
from typing import List, Dict
import re
from difflib import SequenceMatcher


class ValidationService:
    def __init__(self):
        pass

    def check_compliance(self, response: str) -> float:
        score = 0.0
        if response and len(response.strip()) > 0:
            score += 25.0
        if len(response) >= 50:
            score += 25.0
        return score

    def check_citations(self, response: str, context: List[str]) -> float:
        score = 0.0
        if not context:
            return score
        response_lower = response.lower()
        for chunk in context:
            chunk_lower = chunk.lower()
            if chunk_lower in response_lower:
                score += 25.0 / len(context)
        return score

    def check_accuracy(self, response: str, context: List[str]) -> float:
        score = 0.0
        if not context:
            return score
        response_lower = response.lower()
        for chunk in context:
            chunk_lower = chunk.lower()
            ratio = SequenceMatcher(None, response_lower, chunk_lower).ratio()
            score += ratio * 25.0 / len(context)
        return score

    def validate_response(
        self,
        response: str,
        vector_results: List[Dict]
    ) -> Dict:
        context = [r["text"] for r in vector_results]
        
        compliance_score = self.check_compliance(response)
        citation_score = self.check_citations(response, context)
        accuracy_score = self.check_accuracy(response, context)
        
        total_score = compliance_score + citation_score + accuracy_score
        
        return {
            "compliance_score": compliance_score,
            "citation_score": citation_score,
            "accuracy_score": accuracy_score,
            "total_score": round(total_score, 2),
            "validated": total_score >= 50.0
        }


validation_service = ValidationService()
