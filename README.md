# Local dev with Docker Compose

## One-time setup
```bash
cp .env.example .env
```

## Everyday dev (hot reload frontend)
```bash
docker compose --profile dev up --build
```
- Frontend (Vite dev server, HMR): http://localhost:5173
- Backend (FastAPI): http://localhost:8000
- cognito-local: http://localhost:9229
- Postgres: localhost:5432

Both `frontend/` and `backend/` are bind-mounted, so edits on your machine are
picked up live (Vite HMR for frontend, `uvicorn --reload` for backend).

## Prod-sim check (static build behind nginx, like S3 would serve)
```bash
docker compose --profile prod up --build
```
- Frontend (nginx, static build): http://localhost:8080

Use this before shipping to catch anything that only breaks in a real build
(e.g. env vars not actually present at build time, routing/fallback issues).

## Notes
- `postgres` and `cognito-local` data persist across restarts (named volume /
  bind mount). To fully reset Postgres: `docker compose down -v`.
- `cognito-local` reads/writes `./.cognito`, so your existing seeded users in
  `.cognito/db/local_3Z6Efhtn.json` are used as-is — no reseeding needed.
- `frontend-dev` and `frontend-prod` are mutually exclusive via Compose
  **profiles**; only one needs to run at a time. `postgres`, `cognito-local`,
  and `backend` have no profile, so they always start regardless.
- Adjust `DATABASE_URL` in `backend/app` if your driver isn't `psycopg`
  (e.g. if you're on `asyncpg`, it'd be `postgresql+asyncpg://...`).
