import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config.database import Base, get_engine
from models.document import Document
from models.knowledge_chunk import KnowledgeChunk
from models.memory import MemoryRecord
from models.compliance import ComplianceReport


def init_db():
    engine = get_engine()
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!")


if __name__ == "__main__":
    init_db()
