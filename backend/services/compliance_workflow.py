from typing import TypedDict, Annotated, Sequence, Optional, Dict
from langgraph.graph import StateGraph, END
from langgraph.graph.message import add_messages
from sqlalchemy.orm import Session
from services.compliance_service import compliance_service
from models.document import Document


class ComplianceAgentState(TypedDict):
    messages: Annotated[Sequence[dict], add_messages]
    document_id: int
    db: Session
    document_content: str
    standards: list[str]
    report_type: str
    compliance_result: Optional[Dict]
    saved_report_id: Optional[int]


def load_document(state: ComplianceAgentState) -> ComplianceAgentState:
    db = state["db"]
    document_id = state["document_id"]
    document = db.query(Document).filter(Document.id == document_id).first()
    if document:
        content = document.content or ""
        return {"document_content": content}
    else:
        return {"document_content": ""}


def analyze_compliance(state: ComplianceAgentState) -> ComplianceAgentState:
    content = state["document_content"]
    standards = state["standards"]
    report_type = state["report_type"]
    
    if report_type == "compliance":
        result = compliance_service.analyze_compliance(content, standards)
    elif report_type == "failure":
        result = compliance_service.analyze_failure(content, standards)
    else:
        result = {
            "compliance_score": 0,
            "findings": ["Invalid report type"],
            "summary": "Invalid report type",
            "report_content": "Invalid report type"
        }
    
    return {"compliance_result": result}


def save_report(state: ComplianceAgentState) -> ComplianceAgentState:
    db = state["db"]
    document_id = state["document_id"]
    report_type = state["report_type"]
    standards = state["standards"]
    result = state["compliance_result"]
    
    report = compliance_service.save_report(
        db, document_id, report_type, standards, result)
    return {"saved_report_id": report.id}


def create_compliance_workflow():
    workflow = StateGraph(ComplianceAgentState)
    
    workflow.add_node("load_document", load_document)
    workflow.add_node("analyze_compliance", analyze_compliance)
    workflow.add_node("save_report", save_report)
    
    workflow.set_entry_point("load_document")
    workflow.add_edge("load_document", "analyze_compliance")
    workflow.add_edge("analyze_compliance", "save_report")
    workflow.add_edge("save_report", END)
    
    return workflow.compile()


compliance_workflow = create_compliance_workflow()
