from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import documents, query, memory, compliance

app = FastAPI(title="Enterprise Knowledge Intelligence System")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(documents.router)
app.include_router(query.router)
app.include_router(memory.router)
app.include_router(compliance.router)


@app.get("/")
async def root():
    return {"message": "Hello World from Enterprise Level Knowledge Intelligence System!", "status": "running"}


@app.get("/health")
async def health():
    """Fast health check for Azure warmup probe — no DB connections."""
    return {"status": "healthy"}
