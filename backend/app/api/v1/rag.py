import os
import shutil
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from app.rag.chain import run_rag_chain
from app.rag.ingest import ingest_documents, DOCUMENTS_DIR
from app.rag.retriever import load_vector_store, retrieve_similar_chunks

router = APIRouter(prefix="/rag", tags=["RAG Knowledge Engine"])

class RAGQueryRequest(BaseModel):
    question: str

class TestSearchRequest(BaseModel):
    query: str
    top_k: Optional[int] = 5

@router.post("/query")
def query_rag(request: RAGQueryRequest):
    """
    RAG Query Endpoint: Retrieves context using Hybrid BM25 & TF-IDF Vector Search 
    and generates grounded answers in Perplexity AI style.
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
        "retrieved_chunks": result["retrieved_chunks"],
        "image": result.get("image"),
        "media_gallery": result.get("media_gallery", [])
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
        "avgdl": store.get("avgdl", 0),
        "updated_at": store.get("updated_at", 0),
        "documents": store.get("documents", [])
    }

@router.post("/test-search")
def test_search(request: TestSearchRequest):
    """Performs raw hybrid BM25 + vector search and returns matched chunks with confidence scores."""
    q = request.query.strip()
    if not q:
        raise HTTPException(status_code=400, detail="Query cannot be empty.")
    
    top_k = request.top_k or 5
    chunks = retrieve_similar_chunks(q, top_k=top_k)
    return {
        "query": q,
        "match_count": len(chunks),
        "chunks": chunks
    }

@router.post("/upload")
async def upload_rag_document(
    file: UploadFile = File(...),
    target_rag: Optional[str] = Form("customer")
):
    """Uploads a document to RAG documents directory (Customer RAG or Admin RAG) and re-indexes."""
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file selected.")

    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in [".pdf", ".txt", ".md", ".json", ".csv", ".log"]:
        raise HTTPException(
            status_code=400, 
            detail=f"Unsupported file extension '{ext}'. Only PDF, TXT, MD, JSON, CSV files are supported."
        )

    prefix = "admin_" if target_rag == "admin" else "customer_"
    base_name = file.filename
    if not base_name.startswith("admin_") and not base_name.startswith("customer_"):
        save_filename = f"{prefix}{base_name}"
    else:
        save_filename = base_name

    os.makedirs(DOCUMENTS_DIR, exist_ok=True)
    target_path = os.path.join(DOCUMENTS_DIR, save_filename)

    try:
        with open(target_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")

    # Trigger re-ingestion automatically
    ingest_res = ingest_documents()
    return {
        "success": True,
        "message": f"Successfully uploaded and indexed '{save_filename}' into {target_rag.upper()} RAG.",
        "filename": save_filename,
        "target_rag": target_rag,
        "ingest_result": ingest_res
    }


@router.delete("/documents/{filename}")
def delete_rag_document(filename: str):
    """Deletes a document from the RAG documents directory and updates the vector index."""
    target_path = os.path.join(DOCUMENTS_DIR, filename)
    if not os.path.exists(target_path):
        raise HTTPException(status_code=404, detail=f"Document '{filename}' not found.")

    try:
        os.remove(target_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete file: {str(e)}")

    ingest_res = ingest_documents()
    return {
        "success": True,
        "message": f"Deleted '{filename}' and updated vector store.",
        "ingest_result": ingest_res
    }

