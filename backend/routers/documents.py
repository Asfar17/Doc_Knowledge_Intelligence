import os
from pathlib import Path
from typing import List
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from pydantic import BaseModel
from config.database import get_db
from models.document import Document
from utils import detect_document_type, extract_document_metadata, extract_document_text
from services import storage_service, knowledge_service

router = APIRouter(prefix="/documents", tags=["documents"])


class DocumentResponse(BaseModel):
    id: int
    title: str
    file_path: str | None
    file_type: str | None
    doc_metadata: dict | None
    created_at: str
    updated_at: str | None

    class Config:
        from_attributes = True


class ProcessDocumentResponse(BaseModel):
    status: str
    num_chunks: int | None = None
    num_entities: int | None = None
    message: str | None = None


def process_document_background(document_id: int, file_path: str, doc_type: str, doc_metadata: dict):
    try:
        text = extract_document_text(file_path, doc_type)
        knowledge_service.process_document(text, document_id, doc_metadata)
    except Exception as e:
        pass


@router.post("/upload", response_model=DocumentResponse)
async def upload_document(file: UploadFile = File(...), db: Session = Depends(get_db)):
    file_content = await file.read()
    doc_type = detect_document_type(file.filename)

    temp_dir = Path("./temp")
    temp_dir.mkdir(exist_ok=True)
    temp_path = temp_dir / file.filename

    with open(temp_path, "wb") as f:
        f.write(file_content)

    metadata = extract_document_metadata(str(temp_path), doc_type)

    file_path = storage_service.save_file(file_content, file.filename)

    os.remove(temp_path)

    db_document = Document(
        title=file.filename,
        file_path=file_path,
        file_type=doc_type,
        doc_metadata=metadata,
    )
    db.add(db_document)
    db.commit()
    db.refresh(db_document)

    return DocumentResponse(
        id=db_document.id,
        title=db_document.title,
        file_path=db_document.file_path,
        file_type=db_document.file_type,
        doc_metadata=db_document.doc_metadata,
        created_at=db_document.created_at.isoformat() if db_document.created_at else "",
        updated_at=db_document.updated_at.isoformat() if db_document.updated_at else None,
    )


@router.post("/{document_id}/process", response_model=ProcessDocumentResponse)
def process_document(
    document_id: int, background_tasks: BackgroundTasks, db: Session = Depends(get_db)
):
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    if not document.file_path:
        return ProcessDocumentResponse(status="error", message="Document has no file path")
    
    background_tasks.add_task(
        process_document_background,
        document_id,
        document.file_path,
        document.file_type,
        document.doc_metadata or {}
    )
    
    return ProcessDocumentResponse(
        status="processing",
        message="Document processing started in background"
    )


@router.get("/", response_model=List[DocumentResponse])
def get_documents(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    documents = db.query(Document).offset(skip).limit(limit).all()
    return [
        DocumentResponse(
            id=doc.id,
            title=doc.title,
            file_path=doc.file_path,
            file_type=doc.file_type,
            doc_metadata=doc.doc_metadata,
            created_at=doc.created_at.isoformat() if doc.created_at else "",
            updated_at=doc.updated_at.isoformat() if doc.updated_at else None,
        )
        for doc in documents
    ]


@router.get("/{document_id}", response_model=DocumentResponse)
def get_document(document_id: int, db: Session = Depends(get_db)):
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    return DocumentResponse(
        id=document.id,
        title=document.title,
        file_path=document.file_path,
        file_type=document.file_type,
        doc_metadata=document.doc_metadata,
        created_at=document.created_at.isoformat() if document.created_at else "",
        updated_at=document.updated_at.isoformat() if document.updated_at else None,
    )


@router.get("/graph/data")
def get_graph_data():
    return knowledge_service.get_graph_data()
