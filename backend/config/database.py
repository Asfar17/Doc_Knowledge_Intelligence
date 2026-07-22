from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from config.settings import settings

# Lazy engine — created on first use, not at import time
_engine = None
_SessionLocal = None

Base = declarative_base()


def get_engine():
    global _engine
    if _engine is None:
        _engine = create_engine(
            settings.POSTGRES_DATABASE_URL,
            pool_pre_ping=True,
            pool_size=3,
            max_overflow=5,
            connect_args={
                "connect_timeout": 10,  # fail fast instead of hanging
                "options": "-c statement_timeout=30000"
            }
        )
    return _engine


def get_session_factory():
    global _SessionLocal
    if _SessionLocal is None:
        _SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=get_engine())
    return _SessionLocal


def get_db():
    SessionLocal = get_session_factory()
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
