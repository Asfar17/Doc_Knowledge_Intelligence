from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import documents, query, memory, compliance

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development, allow all origins. In production, restrict to your frontend URL!
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
    return {"message": "Hello World from Enterprise Level Knowledge Intelligence System!"}
