from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from config.database import get_db
from services.memory_service import memory_service
from pydantic import BaseModel
from typing import Optional, Dict, List

router = APIRouter(prefix="/memory", tags=["memory"])


class MemoryRecordResponse(BaseModel):
    id: int
    session_id: str
    query: str
    response: str
    metadata: Optional[Dict]
    created_at: str


@router.get("/session/{session_id}")
def get_session_memory(session_id: str):
    try:
        memory = memory_service.get_session_memory(session_id)
        return {"session_id": session_id, "memory": memory}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/session/{session_id}")
def clear_session_memory(session_id: str):
    try:
        memory_service.clear_session_memory(session_id)
        return {"session_id": session_id, "message": "Session memory cleared"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/long-term/{session_id}")
def get_long_term_memory(session_id: str, limit: int = 10, db: Session = Depends(get_db)):
    try:
        records = memory_service.get_long_term_memory(db, session_id, limit)
        return {"session_id": session_id, "memory": [
            {
                "id": r.id,
                "query": r.query,
                "response": r.response,
                "metadata": r.metadata,
                "created_at": r.created_at.isoformat()
            } for r in records
        ]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
