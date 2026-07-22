# Enterprise Level Knowledge Intelligence System

An enterprise-grade document knowledge intelligence platform built with FastAPI, React, LangGraph, LlamaIndex, Qdrant, Neo4j, and deployed on Render + Vercel.

## 🌐 Live URLs

| Service | URL |
|---|---|
| **Frontend** | https://doc-knowledge-intelligence.vercel.app |
| **Backend API** | https://doc-knowledge-intelligence.onrender.com |
| **API Docs** | https://doc-knowledge-intelligence.onrender.com/docs |

## Tech Stack

**Frontend**: React + TypeScript + Vite + Material UI → deployed on **Vercel**

**Backend**: Python 3.12 + FastAPI + LangGraph + LlamaIndex → deployed on **Render**

**Databases**: PostgreSQL (Azure) · Qdrant Cloud (vectors) · Neo4j AuraDB (graph) · Redis (Azure Cache)

**Storage**: Azure Blob Storage

**AI**: OpenAI GPT-4o-mini · LangChain · LangGraph agents

## Project Structure

```
Doc_Knowledge_Intelligent/
├── backend/                  # FastAPI backend (deployed to Render)
│   ├── config/               # Settings and database config
│   ├── models/               # SQLAlchemy models
│   ├── routers/              # API route handlers
│   ├── services/             # Business logic (knowledge, memory, compliance)
│   ├── utils/                # Document processing utilities
│   ├── main.py               # App entry point
│   ├── requirements.txt      # Python dependencies
│   └── runtime.txt           # Python 3.12 for Render
├── frontend/                 # React + Vite frontend (deployed to Vercel)
│   ├── src/
│   │   ├── pages/            # Document upload, query, compliance pages
│   │   ├── components/       # Shared UI components
│   │   └── api/              # API client
│   └── vercel.json           # Vercel SPA routing config
├── render.yaml               # Render deployment config
└── .github/workflows/        # CI/CD (auto-deploys on push to main)
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
API at http://localhost:8000 · Docs at http://localhost:8000/docs

### Frontend
```bash
cd frontend
npm install
cp .env.example .env           # Set VITE_API_BASE_URL=http://localhost:8000
npm run dev
```
UI at http://localhost:5173

## Key Features

- Multi-format document ingestion (PDF, DOCX, TXT, CSV, XLS, images)
- Semantic search via Qdrant vector database
- Graph-based retrieval via Neo4j
- Agent orchestration with LangGraph
- Compliance analysis against PESO, OISD, SOP standards
- Session and long-term memory via Redis + PostgreSQL
- Azure Blob Storage for document files

## Deployment

- **Frontend**: Push to `main` → Vercel auto-deploys
- **Backend**: Push to `main` → Render auto-deploys
- See `render.yaml` for backend configuration
