import os

from sqlalchemy import create_engine, text
from sqlalchemy.orm import DeclarativeBase, sessionmaker

DB_URL = os.getenv("DB_URL")

if not DB_URL:
    raise ValueError("DB_URL environment variable is not set")

engine = create_engine(DB_URL)

SessionLocal = sessionmaker(bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


def test_connection():
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            print("✅ Database connection successful")

            # check pgvector is installed
            result = conn.execute(
                text("SELECT extname FROM pg_extension WHERE extname = 'vector'")
            )
            if result.fetchone():
                print("✅ pgvector extension is active")
            else:
                print(
                    "⚠️  pgvector extension is NOT installed, run: CREATE EXTENSION vector;"
                )

    except Exception as e:
        print(f"❌ Database connection failed: {e}")


if __name__ == "__main__":
    from dotenv import load_dotenv

    _ = load_dotenv()
    test_connection()
