# Services are initialized lazily — imported directly where needed
# Do NOT initialize heavy services at module load time (causes startup crashes on Azure)

from .storage_service import storage_service, StorageService
from .knowledge_service import knowledge_service, KnowledgeService
from .validation_service import validation_service, ValidationService

__all__ = [
    "storage_service",
    "StorageService",
    "knowledge_service",
    "KnowledgeService",
    "validation_service",
    "ValidationService"
]
