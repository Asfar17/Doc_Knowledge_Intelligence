from sqlalchemy import Column, Integer, String, Text, DateTime, JSON, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from config.database import Base


class ComplianceReport(Base):
    __tablename__ = "compliance_reports"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False)
    report_type = Column(String, nullable=False)
    standards = Column(JSON, nullable=False)
    compliance_score = Column(Integer, nullable=True)
    findings = Column(JSON, nullable=True)
    summary = Column(Text, nullable=True)
    report_content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    document = relationship("Document")
