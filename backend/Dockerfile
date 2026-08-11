# syntax=docker/dockerfile:1

FROM python:3.12-slim

# Pull the uv binary from Astral's distroless image (fast, no pip bootstrap needed)
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

ENV UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

WORKDIR /app

# Install OS deps needed to build/run psycopg etc. Trim this if you don't need it.
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev gcc \
    && rm -rf /var/lib/apt/lists/*

# --- Dependency layer (cached separately from app code) ---
# Only copy the manifest files first so `docker build` can cache this layer
# and skip re-installing deps every time you change a .py file.
COPY pyproject.toml uv.lock* ./
RUN uv sync --frozen --no-install-project --no-dev || uv sync --no-install-project --no-dev

# --- App layer ---
COPY . .
RUN uv sync --frozen --no-dev || uv sync --no-dev

ENV PATH="/app/.venv/bin:$PATH"

EXPOSE 8000

# --reload is fine for local/dev compose; production (EC2) should build its own
# image without --reload, or override the command there.
CMD ["sh", "-c", "until uv run alembic upgrade head; do echo 'Migration failed, retrying in 2s...'; sleep 2; done && uv run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"]
