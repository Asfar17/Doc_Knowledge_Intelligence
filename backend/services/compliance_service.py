from typing import List, Dict, Optional
from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from config.settings import settings
from sqlalchemy.orm import Session
from models.compliance import ComplianceReport
from models.document import Document


class ComplianceService:
    def __init__(self):
        self.llm = ChatOpenAI(
            api_key=settings.OPENAI_API_KEY,
            model=settings.OPENAI_MODEL,
            temperature=0.1
        )

    def analyze_compliance(
        self,
        document_content: str,
        standards: List[str]
    ) -> Dict:
        standards_text = ", ".join(standards)
        prompt = ChatPromptTemplate.from_messages([
            ("system", "You are a compliance and safety analysis expert specializing in industrial standards."),
            ("user", """Analyze the following document against these standards: {standards}

Document content:
{document_content}

Please provide:
1. A compliance score (0-100)
2. Key findings (list of compliance issues or strengths)
3. Summary of the analysis
4. Full compliance report text

Return your response in JSON format with these keys:
- compliance_score: integer
- findings: list of strings
- summary: string
- report_content: string
""")
        ])
        
        chain = prompt | self.llm
        
        try:
            response = chain.invoke({
                "standards": standards_text,
                "document_content": document_content
            })
            
            import json
            result = json.loads(response.content)
            return result
        except Exception as e:
            return {
                "compliance_score": 0,
                "findings": [f"Analysis failed: {str(e)}"],
                "summary": "Analysis failed",
                "report_content": f"Failed to generate report: {str(e)}"
            }

    def analyze_failure(
        self,
        document_content: str,
        standards: List[str]
    ) -> Dict:
        standards_text = ", ".join(standards)
        prompt = ChatPromptTemplate.from_messages([
            ("system", "You are a failure analysis expert specializing in industrial safety and operations."),
            ("user", """Identify potential failures in the following document by analyzing against these standards: {standards}

Document content:
{document_content}

Please provide:
1. Potential failure points (list)
2. Risk assessment for each failure
3. Recommendations for mitigation
4. Full failure analysis report text

Return your response in JSON format with these keys:
- compliance_score: integer (0-100, where lower means more potential failures)
- findings: list of strings (potential failures)
- summary: string (summary of failure analysis)
- report_content: string (full report)
""")
        ])
        
        chain = prompt | self.llm
        
        try:
            response = chain.invoke({
                "standards": standards_text,
                "document_content": document_content
            })
            
            import json
            result = json.loads(response.content)
            return result
        except Exception as e:
            return {
                "compliance_score": 0,
                "findings": [f"Failure analysis failed: {str(e)}"],
                "summary": "Failure analysis failed",
                "report_content": f"Failed to generate failure analysis report: {str(e)}"
            }

    def save_report(
        self,
        db: Session,
        document_id: int,
        report_type: str,
        standards: List[str],
        analysis_result: Dict
    ) -> ComplianceReport:
        report = ComplianceReport(
            document_id=document_id,
            report_type=report_type,
            standards=standards,
            compliance_score=analysis_result.get("compliance_score"),
            findings=analysis_result.get("findings"),
            summary=analysis_result.get("summary"),
            report_content=analysis_result.get("report_content")
        )
        db.add(report)
        db.commit()
        db.refresh(report)
        return report


compliance_service = ComplianceService()
