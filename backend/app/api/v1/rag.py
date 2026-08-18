from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from app.rag.chain import run_rag_chain
from app.rag.ingest import ingest_documents
from app.rag.retriever import load_vector_store

router = APIRouter(prefix="/rag", tags=["RAG Knowledge Engine"])

class RAGQueryRequest(BaseModel):
    question: str

@router.post("/query")
def query_rag(request: RAGQueryRequest):
    """
    RAG Query Endpoint: Retrieves context from documents in app/documents/ 
    and generates grounded answers using Gemini AI.
    """
    q = request.question.strip()
    if not q:
        raise HTTPException(status_code=400, detail="Question prompt cannot be empty.")

    result = run_rag_chain(q)
    return {
        "success": True,
        "question": q,
        "answer": result["answer"],
        "sources": result["sources"],
        "retrieved_chunks": result["retrieved_chunks"]
    }

@router.post("/ingest")
def trigger_ingest():
    """Triggers PDF and document ingestion from app/documents/ into vector index."""
    result = ingest_documents()
    return result

@router.get("/documents")
def get_documents_status():
    """Returns status of ingested RAG knowledge base documents."""
    store = load_vector_store()
    return {
        "total_chunks": store.get("total_chunks", 0),
        "documents": store.get("documents", [])
    }
