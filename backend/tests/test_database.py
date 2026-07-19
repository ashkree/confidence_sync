# backend/tests/test_database.py
from sqlalchemy import text

from app.database import engine


def test_connection():
    with engine.connect() as conn:
        result = conn.execute(text("SELECT 1"))
        assert result.scalar() == 1


def test_pgvector_extension():
    with engine.connect() as conn:
        result = conn.execute(
            text("SELECT extname FROM pg_extension WHERE extname = 'vector'")
        )
        assert result.fetchone() is not None, "pgvector extension is not installed"
