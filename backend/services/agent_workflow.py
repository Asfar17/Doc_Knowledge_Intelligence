from typing import TypedDict, Annotated, Sequence, Optional, Dict
from langgraph.graph import StateGraph, END
from langgraph.graph.message import add_messages
from services import knowledge_service
from services import multimodal_service
from services import validation_service
from services.memory_service import memory_service
from config.settings import settings
from PIL import Image
from sqlalchemy.orm import Session


class AgentState(TypedDict):
    messages: Annotated[Sequence[dict], add_messages]
    query: str
    session_id: str
    db: Session
    images: Optional[list[Image.Image]]
    vector_results: list[dict]
    graph_results: list[dict]
    memory_context: str
    response: str
    validation_results: Optional[Dict]


def retrieve_memory(state: AgentState) -> AgentState:
    memory_context = memory_service.retrieve_relevant_context(
        db=state["db"],
        session_id=state["session_id"],
        query=state["query"]
    )
    return {"memory_context": memory_context}


def process_query(state: AgentState) -> AgentState:
    query = state["query"]
    results = knowledge_service.combined_query(query)
    return {
        "vector_results": results["vector_results"],
        "graph_results": results["graph_results"],
    }


def generate_response(state: AgentState) -> AgentState:
    try:
        context_parts = []
        if state.get("memory_context"):
            context_parts.append(state["memory_context"])
        if state.get("vector_results"):
            context_parts.append("\n".join([r["text"] for r in state["vector_results"]]))
        context = "\n\n".join(context_parts)
        response = multimodal_service.multimodal_service.generate_response(
            query=state["query"],
            context=context,
            images=state.get("images")
        )
        return {"response": response}
    except Exception as e:
        return {"response": f"Could not generate response: {str(e)}"}


def validate_response(state: AgentState) -> AgentState:
    response = state.get("response", "")
    vector_results = state.get("vector_results", [])
    validation_results = validation_service.validation_service.validate_response(
        response, vector_results
    )
    return {"validation_results": validation_results}


def save_to_memory(state: AgentState) -> AgentState:
    memory_service.add_to_session_memory(
        session_id=state["session_id"],
        query=state["query"],
        response=state["response"]
    )
    memory_service.add_to_long_term_memory(
        db=state["db"],
        session_id=state["session_id"],
        query=state["query"],
        response=state["response"]
    )
    return state


def create_workflow():
    workflow = StateGraph(AgentState)

    workflow.add_node("retrieve_memory", retrieve_memory)
    workflow.add_node("process_query", process_query)
    workflow.add_node("generate_response", generate_response)
    workflow.add_node("validate_response", validate_response)
    workflow.add_node("save_to_memory", save_to_memory)

    workflow.set_entry_point("retrieve_memory")
    workflow.add_edge("retrieve_memory", "process_query")
    workflow.add_edge("process_query", "generate_response")
    workflow.add_edge("generate_response", "validate_response")
    workflow.add_edge("validate_response", "save_to_memory")
    workflow.add_edge("save_to_memory", END)

    return workflow.compile()


# Lazy initialization — only build workflow when first used
_workflow = None

def get_workflow():
    global _workflow
    if _workflow is None:
        _workflow = create_workflow()
    return _workflow

# Keep backward compat — callers using `workflow.invoke(...)` still work
class _LazyWorkflow:
    def invoke(self, state):
        return get_workflow().invoke(state)

workflow = _LazyWorkflow()
