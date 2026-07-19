from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from config.database import get_db
from models.compliance import ComplianceReport
from services.compliance_workflow import compliance_workflow

router = APIRouter(prefix="/compliance", tags=["compliance"])


class ComplianceRequest(BaseModel):
    document_id: int
    report_type: str
    standards: List[str]


class ComplianceReportResponse(BaseModel):
    id: int
    document_id: int
    report_type: str
    standards: List[str]
    compliance_score: int | None
    findings: List[str] | None
    summary: str | None
    report_content: str
    created_at: str

    class Config:
        from_attributes = True


@router.post("/analyze", response_model=ComplianceReportResponse)
def analyze_compliance(request: ComplianceRequest, db: Session = Depends(get_db)):
    try:
        initial_state = {
            "messages": [],
            "document_id": request.document_id,
            "db": db,
            "standards": request.standards,
            "report_type": request.report_type
        }
        
        result = compliance_workflow.invoke(initial_state)
        
        report_id = result.get("saved_report_id")
        report = db.query(ComplianceReport).filter(ComplianceReport.id == report_id).first()
        
        if not report:
            raise HTTPException(status_code=500, detail="Failed to retrieve report")
            
        return ComplianceReportResponse(
            id=report.id,
            document_id=report.document_id,
            report_type=report.report_type,
            standards=report.standards,
            compliance_score=report.compliance_score,
            findings=report.findings,
            summary=report.summary,
            report_content=report.report_content,
            created_at=report.created_at.isoformat() if report.created_at else ""
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/reports/{document_id}", response_model=List[ComplianceReportResponse])
def get_reports(document_id: int, db: Session = Depends(get_db)):
    reports = db.query(ComplianceReport).filter(ComplianceReport.document_id == document_id).all()
    return [
        ComplianceReportResponse(
            id=report.id,
            document_id=report.document_id,
            report_type=report.report_type,
            standards=report.standards,
            compliance_score=report.compliance_score,
            findings=report.findings,
            summary=report.summary,
            report_content=report.report_content,
            created_at=report.created_at.isoformat() if report.created_at else ""
        )
        for report in reports
    ]


@router.get("/report/{report_id}", response_model=ComplianceReportResponse)
def get_report(report_id: int, db: Session = Depends(get_db)):
    report = db.query(ComplianceReport).filter(ComplianceReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return ComplianceReportResponse(
        id=report.id,
        document_id=report.document_id,
        report_type=report.report_type,
        standards=report.standards,
        compliance_score=report.compliance_score,
        findings=report.findings,
        summary=report.summary,
        report_content=report.report_content,
        created_at=report.created_at.isoformat() if report.created_at else ""
    )
