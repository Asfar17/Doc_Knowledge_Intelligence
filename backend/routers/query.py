from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends
from pydantic import BaseModel
from services import knowledge_service
from services.agent_workflow import workflow
from PIL import Image
import io
from config.database import get_db
from sqlalchemy.orm import Session

router = APIRouter(prefix="/query", tags=["query"])


class QueryRequest(BaseModel):
    query: str
    top_k: int = 5


class VectorResult(BaseModel):
    text: str
    score: float
    metadata: dict


class GraphResult(BaseModel):
    document_id: int
    related_entities: list[str]


class QueryResponse(BaseModel):
    vector_results: list[VectorResult]
    graph_results: list[GraphResult]


class ValidationResults(BaseModel):
    compliance_score: float
    citation_score: float
    accuracy_score: float
    total_score: float
    validated: bool


class AgentQueryResponse(BaseModel):
    vector_results: list[dict]
    graph_results: list[dict]
    response: str
    validation_results: ValidationResults
    memory_context: str = ""


@router.post("/", response_model=QueryResponse)
def query_knowledge_base(request: QueryRequest):
    try:
        results = knowledge_service.combined_query(request.query, request.top_k)
        return QueryResponse(
            vector_results=[VectorResult(**vr) for vr in results["vector_results"]],
            graph_results=[GraphResult(**gr) for gr in results["graph_results"]]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/semantic", response_model=list[VectorResult])
def semantic_search(request: QueryRequest):
    try:
        results = knowledge_service.semantic_search(request.query, request.top_k)
        return [VectorResult(**vr) for vr in results]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/graph", response_model=list[GraphResult])
def graph_search(request: QueryRequest):
    try:
        results = knowledge_service.graph_retrieval(request.query, request.top_k)
        return [GraphResult(**gr) for gr in results]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/agent", response_model=AgentQueryResponse)
async def agent_query(
    query: str = Form(...),
    session_id: str = Form(...),
    images: list[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    try:
        pil_images = []
        if images:
            for image in images:
                contents = await image.read()
                pil_image = Image.open(io.BytesIO(contents))
                pil_images.append(pil_image)
        
        state = {
            "messages": [],
            "query": query,
            "session_id": session_id,
            "db": db,
            "images": pil_images if pil_images else None,
            "vector_results": [],
            "graph_results": [],
            "memory_context": "",
            "response": "",
            "validation_results": None
        }
        final_state = workflow.invoke(state)
        return AgentQueryResponse(
            vector_results=final_state["vector_results"],
            graph_results=final_state["graph_results"],
            response=final_state["response"],
            validation_results=ValidationResults(**final_state["validation_results"]),
            memory_context=final_state["memory_context"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
