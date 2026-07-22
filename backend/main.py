from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import documents, query, memory, compliance
import logging

logger = logging.getLogger(__name__)

app = FastAPI(title="Enterprise Knowledge Intelligence System")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://doc-knowledge-intelligence.vercel.app",
        "http://localhost:5173",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(documents.router)
app.include_router(query.router)
app.include_router(memory.router)
app.include_router(compliance.router)


@app.on_event("startup")
async def startup_event():
    """Create database tables on startup if they don't exist."""
    try:
        from config.database import get_engine, Base
        # Import all models so Base knows about them
        from models.document import Document
        from models.knowledge_chunk import KnowledgeChunk
        from models.memory import MemoryRecord
        from models.compliance import ComplianceReport

        engine = get_engine()
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created/verified successfully")
    except Exception as e:
        # Don't crash startup if DB is unavailable — log and continue
        logger.error(f"DB init failed (non-fatal): {e}")


@app.get("/")
async def root():
    return {
        "message": "Hello World from Enterprise Level Knowledge Intelligence System!",
        "status": "running"
    }


@app.get("/health")
async def health():
    """Fast health check — no DB connections."""
    return {"status": "healthy"}


@app.get("/db-status")
async def db_status():
    """Check database connectivity and table existence."""
    result = {"postgres": "unknown", "qdrant": "unknown", "neo4j": "unknown"}

    # Check PostgreSQL
    try:
        from config.database import get_engine
        engine = get_engine()
        with engine.connect() as conn:
            conn.execute(__import__("sqlalchemy").text("SELECT 1"))
        result["postgres"] = "connected"
    except Exception as e:
        result["postgres"] = f"error: {str(e)[:100]}"

    # Check Qdrant
    try:
        from services.knowledge_service import knowledge_service
        knowledge_service.qdrant_client.get_collections()
        result["qdrant"] = "connected"
    except Exception as e:
        result["qdrant"] = f"error: {str(e)[:100]}"

    # Check Neo4j
    try:
        from services.knowledge_service import knowledge_service
        with knowledge_service.neo4j_driver.session() as session:
            session.run("RETURN 1")
        result["neo4j"] = "connected"
    except Exception as e:
        result["neo4j"] = f"error: {str(e)[:100]}"

    return result
