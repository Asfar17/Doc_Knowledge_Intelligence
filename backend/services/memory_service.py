import redis
import json
from typing import Optional, List, Dict
from sqlalchemy.orm import Session
from models.memory import MemoryRecord
from config.settings import settings


class MemoryService:
    def __init__(self):
        # Azure Cache for Redis requires SSL (port 6380) and a password
        self.redis_client = redis.Redis(
            host=settings.REDIS_HOST,
            port=settings.REDIS_PORT,
            db=settings.REDIS_DB,
            password=settings.REDIS_PASSWORD if settings.REDIS_PASSWORD else None,
            ssl=settings.REDIS_SSL,
            ssl_cert_reqs=None if settings.REDIS_SSL else None,
            decode_responses=True,
        )

    def get_session_memory(self, session_id: str) -> List[Dict]:
        key = f"session:{session_id}"
        data = self.redis_client.get(key)
        return json.loads(data) if data else []

    def add_to_session_memory(self, session_id: str, query: str, response: str, metadata: Optional[Dict] = None) -> None:
        key = f"session:{session_id}"
        memory_list = self.get_session_memory(session_id)
        memory_list.append({
            "query": query,
            "response": response,
            "metadata": metadata or {}
        })
        self.redis_client.setex(key, 3600, json.dumps(memory_list))

    def clear_session_memory(self, session_id: str) -> None:
        key = f"session:{session_id}"
        self.redis_client.delete(key)

    def add_to_long_term_memory(self, db: Session, session_id: str, query: str, response: str, metadata: Optional[Dict] = None) -> None:
        record = MemoryRecord(
            session_id=session_id,
            query=query,
            response=response,
            metadata=metadata or {}
        )
        db.add(record)
        db.commit()
        db.refresh(record)

    def get_long_term_memory(self, db: Session, session_id: str, limit: int = 10) -> List[MemoryRecord]:
        return db.query(MemoryRecord).filter(
            MemoryRecord.session_id == session_id
        ).order_by(MemoryRecord.created_at.desc()).limit(limit).all()

    def retrieve_relevant_context(self, db: Session, session_id: str, query: str, limit: int = 5) -> str:
        session_memory = self.get_session_memory(session_id)
        long_term_memory = self.get_long_term_memory(db, session_id, limit)

        context_parts = []

        if session_memory:
            context_parts.append("Recent conversation:")
            for item in session_memory[-limit:]:
                context_parts.append(f"Q: {item['query']}")
                context_parts.append(f"A: {item['response']}")

        if long_term_memory:
            context_parts.append("\nLong-term memory:")
            for record in reversed(long_term_memory):
                context_parts.append(f"Q: {record.query}")
                context_parts.append(f"A: {record.response}")

        return "\n".join(context_parts)


memory_service = MemoryService()
