from sqlalchemy import Column, Integer, String, Text, DateTime, JSON
from sqlalchemy.sql import func
from config.database import Base


class MemoryRecord(Base):
    __tablename__ = "memory_records"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, index=True, nullable=False)
    query = Column(Text, nullable=False)
    response = Column(Text, nullable=False)
    doc_metadata = Column("metadata", JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
