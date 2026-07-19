# Enterprise Level Knowledge Intelligence System

An enterprise-grade document knowledge intelligence platform built with FastAPI, React, LangGraph, LlamaIndex, Qdrant, Neo4j, and deployed on Microsoft Azure.

## Project Structure

```
Doc_Knowledge_Intelligent/
├── backend/                  # FastAPI backend
│   ├── config/               # Settings and database config
│   ├── models/               # SQLAlchemy models
│   ├── routers/              # API route handlers
│   ├── services/             # Business logic (knowledge, memory, compliance)
│   ├── utils/                # Document processing utilities
│   ├── scripts/              # DB initialization scripts
│   ├── main.py               # App entry point
│   └── requirements.txt      # Python dependencies
├── frontend/                 # React + Vite frontend
│   └── src/
│       ├── pages/            # Document upload, query, compliance pages
│       ├── components/       # Shared UI components
│       └── api/              # API client
├── .azure/                   # Azure resource provisioning scripts
├── .github/workflows/        # CI/CD pipeline (GitHub Actions)
└── DEPLOYMENT.md             # Full deployment guide
```

## Quick Start (Local Development)

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
pip install -r requirements.txt
cp .env.example .env           # Fill in your credentials
uvicorn main:app --reload
```
API available at http://localhost:8000 | Docs at http://localhost:8000/docs

### Frontend
```bash
cd frontend
npm install
cp .env.example .env           # Set VITE_API_BASE_URL=http://localhost:8000
npm run dev
```
UI available at http://localhost:5173

## Key Features

- Multi-format document ingestion (PDF, DOCX, TXT, CSV, XLS, images)
- Semantic search via Qdrant vector database
- Graph-based retrieval via Neo4j
- Agent orchestration with LangGraph
- Compliance analysis against PESO, OISD, SOP standards
- Session and long-term memory via Redis + PostgreSQL
- Azure Blob Storage for document storage

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for the full Azure deployment guide.
