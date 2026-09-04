# Confidence Sync

An internal HR and IT helpdesk for employees, with an AI assistant grounded in the
organisation's own policy documents and manuals.

Employees raise HR requests and IT tickets, browse a knowledge base of HR policies and
IT manuals, and talk to a chat assistant that answers from those documents rather than
from general knowledge. Admins triage tickets for their department, assign them, and
upload the documents that feed the knowledge base.

## What it does

**For employees**

- Submit HR requests (leave, document requests such as NOC or salary certificates) and
  IT tickets (hardware faults, software issues).
- Track their own tickets and comment on them.
- Browse and download HR policies and IT manuals.
- Chat with an assistant that helps them work out whether they need a ticket at all,
  and what details to gather before raising one.

**For admins**

- See the ticket queue for their own department only — HR admins see HR requests, IT
  admins see IT tickets.
- Update status, priority, and assignee, and reply on the ticket thread.
- Upload PDFs to the knowledge base, which are chunked, embedded, and stored for
  retrieval.

**The AI layer**

Uploaded PDFs are split into chunks, embedded, and stored in Postgres as `pgvector`
embeddings. At query time the user's message is embedded and matched against those
chunks by cosine distance. The retrieved excerpts are passed to the model as grounding
context.

The same retrieval path backs two other features: an AI summary of a ticket thread, and
a set of suggested next steps for the assignee drawn from relevant internal
documentation.

The system prompts are deliberately strict about not inventing organisational
specifics — approval chains, form names, entitlements, timeframes. If the retrieved
excerpts don't cover the question, the assistant says so instead of guessing.

## Architecture

```
Browser  ──►  Vite dev server (5173)  ──/api proxy──►  FastAPI (8000)
                                                          │
                            ┌─────────────────┬───────────┴──────┬──────────────────┐
                            ▼                 ▼                  ▼                  ▼
                    Postgres + pgvector   cognito-local        s3mock          bedrock-mock
                         (5432)             (9229)             (9090)             (3000)
                                                                                    │
                                                                                    ▼
                                                                                 Ollama
                                                                                 (11434)
```

The application code talks to Cognito, S3, and Bedrock through the standard boto3
clients. Everything local is swapped in via `*_ENDPOINT_URL` overrides, so nothing in
`app/` knows it isn't talking to real AWS.

Bedrock is the interesting one: `bedrock-mock` implements the Bedrock runtime API and
proxies it to a local Ollama instance, which does the actual inference on the GPU. That
means no AWS account and no per-token cost for local development, but it does mean the
stack expects a working NVIDIA GPU (see Prerequisites).

**Backend layering.** Routes handle HTTP and authorization guards, services hold the
business logic, repositories own all I/O — database, S3, Cognito, Bedrock. Domain
exceptions are raised by the lower layers and mapped to status codes centrally in
`app/exceptions/handlers.py`, so routes don't raise `HTTPException` by hand.

**Authentication.** Cognito issues the tokens. The backend verifies the access token's
signature against the pool's JWKS, then resolves the local `users` row by the token's
`sub` claim. Authorization is layered on top with composable guards (`require_admin`,
`require_it`, `require_hr`) that check role and department.

## Tech stack

| | |
|---|---|
| Backend | Python 3.12, FastAPI, SQLAlchemy 2 (async), Alembic, Pydantic Settings |
| Database | Postgres 16 with `pgvector` |
| AI | Bedrock runtime API, served locally by `bedrock-mock` over Ollama, wired up through LangChain |
| Auth | Cognito (cognito-local in development), PyJWT |
| Storage | S3 API (Adobe s3mock in development), boto3 |
| PDF | PyMuPDF |
| Frontend | React 19, TypeScript, Vite, TanStack Router / Form / Table |
| Styling | Tailwind CSS v4, shadcn/ui, Base UI, Lucide |
| Tooling | uv (Python), npm, basedpyright, ESLint |

## Project structure

```
.
├── backend/
│   ├── app/
│   │   ├── main.py               # App setup, routers, CORS, health checks
│   │   ├── config.py             # Pydantic Settings, loaded from .env
│   │   ├── database.py           # Async engine + get_db dependency
│   │   ├── routes/               # HTTP layer — auth, chat, documents, tickets
│   │   ├── services/             # Business logic
│   │   │   ├── auth/             # Cognito login/refresh, JWT verification, deps
│   │   │   ├── ai.py             # Ticket summaries and suggested next steps
│   │   │   ├── chat.py           # Chat sessions, RAG turn assembly, prompts
│   │   │   ├── documents.py      # PDF extraction, embedding, S3 upload
│   │   │   ├── tickets.py
│   │   │   └── users.py
│   │   ├── repository/           # All I/O
│   │   │   ├── aws.py            # Shared boto3 client base
│   │   │   ├── bedrock.py        # Chat + embeddings, sync calls wrapped async
│   │   │   ├── cognito.py
│   │   │   ├── s3.py
│   │   │   ├── chat.py           # Session and message persistence
│   │   │   ├── document.py       # Documents + cosine_distance vector search
│   │   │   ├── ticket.py
│   │   │   └── user.py
│   │   ├── models/               # SQLAlchemy models
│   │   │   ├── base.py
│   │   │   ├── user.py           # UserRole, UserDepartment
│   │   │   ├── ticket.py         # Base ticket, polymorphic on type
│   │   │   ├── hr_request.py     # Subclass — leave and document requests
│   │   │   ├── it_ticket.py      # Subclass — hardware and software issues
│   │   │   ├── ticket_comment.py
│   │   │   ├── documents.py
│   │   │   ├── document_chunks.py# Chunk text + 768-dim embedding
│   │   │   ├── chat_session.py
│   │   │   └── chat_message.py
│   │   ├── schemas/              # Pydantic request/response models
│   │   ├── authorization/        # Role and department guards
│   │   │   ├── checks.py         # role_is, department_is
│   │   │   ├── guards.py         # require_all, require_one, require_admin, ...
│   │   │   └── tickets.py        # Per-ticket access rules
│   │   └── exceptions/           # Domain exceptions + central handlers
│   ├── alembic/                  # Migrations
│   ├── tests/
│   ├── pyproject.toml
│   ├── uv.lock
│   ├── Dockerfile
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── routes/               # File-based routes (TanStack Router)
│   │   │   ├── __root.tsx        # Root route, auth context
│   │   │   ├── index.tsx
│   │   │   ├── login.tsx
│   │   │   ├── unauthorized.tsx
│   │   │   ├── 404.tsx
│   │   │   └── _authenticated/   # Everything behind a login
│   │   │       ├── route.tsx     # Auth gate
│   │   │       ├── employee/     # Employee dashboard
│   │   │       ├── kb/           # Knowledge base hub + $category
│   │   │       ├── ticket/       # submit, $ticketId
│   │   │       ├── profile/
│   │   │       └── admin/        # ADMIN role gate
│   │   │           ├── hr/       # requests, policies
│   │   │           └── it/       # tickets, manuals
│   │   ├── components/
│   │   │   ├── page/             # Page-level components
│   │   │   ├── sections/         # Reusable page sections
│   │   │   └── ui/               # shadcn/ui primitives
│   │   ├── api/                  # Typed fetch wrappers
│   │   ├── types/
│   │   ├── data/                 # Local fixture JSON
│   │   └── routeTree.gen.ts      # Generated — do not edit
│   ├── vite.config.ts
│   ├── package.json
│   └── Dockerfile
│
├── compose.yaml
└── README.md
```

## Getting started

### Prerequisites

- Docker and Docker Compose
- An NVIDIA GPU with the [NVIDIA Container Toolkit](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/latest/install-guide.html)
  installed. The `ollama` service reserves all available NVIDIA devices, and
  `bedrock-mock` won't start until Ollama is healthy — which in turn blocks nothing
  else, but leaves every AI feature failing. If you're on a machine without a GPU, drop
  the `deploy.resources` block from the `ollama` service and expect slow CPU inference.
- The `bedrock-mock:latest` image must exist locally. Compose references it by tag with
  no `build:` context, so it is not built or pulled for you.

  <!-- TODO: document where bedrock-mock comes from and how to build it -->

### 1. Configure environment

There are three env files, and they interact:

```bash
cp backend/.env.example backend/.env
```

| File | Loaded by | Purpose |
|---|---|---|
| `backend/.env` | backend | Application settings |
| `frontend/.env` | frontend | `VITE_API_URL` |
| `./.env` (repo root) | both | Shared overrides. Loaded *second*, so it wins over the service-level file. |

Two values are set directly in `compose.yaml` and will **override whatever you put in
`backend/.env`** — `DB_URL` and `COGNITO_ENDPOINT_URL`. That's deliberate: they need
Docker DNS hostnames (`postgres`, `cognito-local`), not `localhost`. Editing them in
`backend/.env` has no effect.

The endpoints Compose *doesn't* set, you must get right yourself, and they also need
Docker hostnames rather than `localhost`:

```
S3_ENDPOINT_URL=http://s3mock:9090
BEDROCK_ENDPOINT_URL=http://bedrock-mock:3000
```

Full list in [Environment variables](#environment-variables).

### 2. Start the stack

```bash
docker compose up --build
```

Startup is ordered: Postgres and cognito-local come up first, then the backend waits on
a healthy Postgres, then the frontend waits on a healthy backend. Ollama and
`bedrock-mock` come up in parallel — note that the backend does **not** wait for them,
so the API will accept requests before inference is ready. Chat and summaries will fail
until Ollama reports healthy.

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| API | http://localhost:8000 |
| API docs | http://localhost:8000/docs |
| Health check | http://localhost:8000/health |
| DB connectivity check | http://localhost:8000/db |
| Postgres | `localhost:5432` (`app` / `app` / `confidence_sync` by default) |
| cognito-local | http://localhost:9229 |
| s3mock | http://localhost:9090 |
| bedrock-mock | http://localhost:3000 |
| Ollama | http://localhost:11434 |

### 3. Pull the Ollama model

Ollama starts with no models. Nothing in Compose pulls one.

<!-- TODO: confirm the model tag -->

```bash
docker compose exec ollama ollama pull <model>
```

### 4. Run migrations

```bash
docker compose exec backend uv run alembic upgrade head
```

### 5. Seed users

The S3 buckets (`hr_policies`, `it_manuals`) are created automatically by s3mock, so
there's nothing to do there. Users are another matter: logging in requires a user in
cognito-local **and** a matching row in the local `users` table, linked by the Cognito
`sub`. Neither is created for you.

<!-- TODO: document the user seeding step -->

## Common commands

```bash
# Tail logs for one service
docker compose logs -f backend

# Shell into the backend
docker compose exec backend bash

# Create a migration after changing a model
docker compose exec backend uv run alembic revision --autogenerate -m "message"

# Run the tests
docker compose exec backend uv run pytest

# Lint the frontend
docker compose exec frontend npm run lint

# Reset the database completely
docker compose down
docker volume rm confidence-sync_postgres_data
```

Both app containers bind-mount their source directory and run in dev mode, so code
changes hot-reload without a rebuild.

Dependencies are the exception. `.venv` and `node_modules` live in named volumes
(`backend_venv`, `frontend_node_modules`) that mask the bind mount, so a rebuild alone
won't pick up a new package — the old volume is still mounted over the new image's
copy. Remove the volume as well:

```bash
docker compose down
docker volume rm confidence-sync_backend_venv
docker compose up --build
```

State that survives `docker compose down`: Postgres data, cognito-local users, s3mock
objects, and pulled Ollama models. `docker compose down -v` wipes all of it, including
your seeded users and every downloaded model.

## Environment variables

### Backend (`backend/.env`)

| Variable | Description |
|---|---|
| `DB_URL` | **Set by Compose.** Postgres connection string. Also read directly by Alembic. |
| `COGNITO_ENDPOINT_URL` | **Set by Compose.** Defaults to `http://cognito-local:9229`. |
| `S3_ENDPOINT_URL` | `http://s3mock:9090` in development. |
| `BEDROCK_ENDPOINT_URL` | `http://bedrock-mock:3000` in development. |
| `AWS_REGION` | Any valid region string works against the mocks. |
| `AWS_ACCESS_KEY_ID` | Any placeholder works against the mocks. |
| `AWS_SECRET_ACCESS_KEY` | Same. |
| `COGNITO_USER_POOL_ID` | User pool ID. |
| `COGNITO_APP_CLIENT_ID` | App client ID. |
| `COGNITO_APP_CLIENT_SECRET` | App client secret, used to compute `SECRET_HASH`. |
| `APP_ENV` | `development` or `production`. Defaults to `development`. |
| `USE_COGNITO_LOCAL` | Defaults to `true`. Combined with `APP_ENV=development`, switches JWT issuer and JWKS resolution to cognito-local. |

`.env.example` is currently missing `BEDROCK_ENDPOINT_URL`, which `config.py` requires
with no default. Copying the example file as-is gives you a validation error on
startup.

### Postgres (repo root `.env`)

| Variable | Default |
|---|---|
| `POSTGRES_USER` | `app` |
| `POSTGRES_PASSWORD` | `app` |
| `POSTGRES_DB` | `confidence_sync` |

If you change these, change `DB_URL` to match — the default connection string has the
credentials hardcoded.

### Frontend (`frontend/.env`)

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend origin. The Vite dev server proxies `/api` here. |

## API

All application routes are mounted under `/api/v1`.

| Prefix | Purpose |
|---|---|
| `/auth` | Login, token refresh, current user, current user's profile |
| `/tickets` | Create, list by department, list own, detail, status/priority/assignee updates, comments, AI summary |
| `/documents` | Upload, list by category, view inline, download |
| `/chat` | Fetch or start a session, send a message |

`/health` and `/db` sit outside the versioned prefix. Interactive docs are at `/docs`
when the backend is running.

Authentication is a bearer token from `POST /api/v1/auth/login`. Access is enforced by
dependency guards on each route: most require an authenticated user, admin endpoints
require the `ADMIN` role, and department-scoped endpoints additionally require a
matching `HR` or `IT` department.

Errors come back in a consistent envelope:

```json
{ "error": "ticket_not_found", "detail": "..." }
```

The error code is derived from the exception class name, so `TicketNotFoundError`
becomes `ticket_not_found`.

## Data model notes

**Tickets are polymorphic.** `Ticket` is the base table holding everything common —
poster, assignee, status, priority, subject, description, AI summary. `HrRequest` and
`ItTicket` are subclasses in their own tables, discriminated by `type`. Adding a new
ticket category means a new subclass, not new nullable columns on the base.

**Chat sessions expire.** Sessions have a 24-hour TTL. Requesting a stale session
deletes it and starts a fresh one, so the assistant doesn't carry context across days.

**Chunks are 768-dimensional.** `document_chunks.embedding` is a `Vector(768)` column.
Changing the embedding model means a migration and a re-embed of every document.

**Documents are bucketed by department.** HR admins upload to `hr_policies`, IT admins
to `it_manuals`. An admin with no department set can't upload at all.

## Troubleshooting

**Chat and ticket summaries fail, everything else works.** Ollama or `bedrock-mock` is
down. The backend doesn't depend on either, so the app starts fine without them. Check
`docker compose ps` and `docker compose logs bedrock-mock`.

**Ollama container won't start.** Almost always the GPU reservation — either the NVIDIA
Container Toolkit isn't installed or there's no NVIDIA device. See Prerequisites.

**Backend can't reach S3 or Bedrock.** The endpoint URLs are probably pointing at
`localhost`. Inside the network they need to be `http://s3mock:9090` and
`http://bedrock-mock:3000`.

**A newly installed package isn't found.** The dependency volume is masking it. See
Common commands above.

**Login returns 401 with valid credentials.** The Cognito user exists but has no
matching `users` row, or the `sub` doesn't match. That's `UnknownSubjectError`, returned
as a 401 by design so the response can't be used to enumerate provisioned accounts.

## Deployment

The Dockerfiles run dev servers — `uvicorn --reload` for the backend, `vite` for the
frontend. Neither is suitable for production. A production build should drop `--reload`
and serve the frontend as static assets from `npm run build` rather than through the
Vite dev server. The mock services (`cognito-local`, `s3mock`, `bedrock-mock`, `ollama`)
are development-only and get replaced by real Cognito, S3, and Bedrock, with
`USE_COGNITO_LOCAL=false` and `APP_ENV=production`.
