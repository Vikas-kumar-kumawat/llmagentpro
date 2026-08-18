import os
import json
import re
import math
from typing import List, Dict, Any
from app.rag.ingest import (
    VECTOR_STORE_FILE, 
    ingest_documents, 
    compute_term_frequencies
)

def load_vector_store() -> Dict[str, Any]:
    """Loads the vector store JSON or auto-ingests documents if store is missing."""
    if not os.path.exists(VECTOR_STORE_FILE):
        ingest_documents()

    try:
        with open(VECTOR_STORE_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return ingest_documents()

def cosine_similarity(vec1: Dict[str, float], vec2: Dict[str, float]) -> float:
    """Calculates cosine similarity score between two TF vectors."""
    if not vec1 or not vec2:
        return 0.0

    dot_product = sum(val * vec2.get(word, 0.0) for word, val in vec1.items())
    mag1 = math.sqrt(sum(val ** 2 for val in vec1.values()))
    mag2 = math.sqrt(sum(val ** 2 for val in vec2.values()))

    if mag1 == 0.0 or mag2 == 0.0:
        return 0.0

    return dot_product / (mag1 * mag2)

def retrieve_similar_chunks(query: str, top_k: int = 3) -> List[Dict[str, Any]]:
    """
    Performs vector similarity search against document chunks for a given query.
    Returns top_k matching chunks with similarity scores.
    """
    query_clean = query.strip()
    if not query_clean:
        return []

    store = load_vector_store()
    chunks = store.get("chunks", [])

    if not chunks:
        # Retry document ingestion if store is empty
        store = ingest_documents()
        chunks = store.get("chunks", [])

    query_vec = compute_term_frequencies(query_clean)
    query_words = set(re.findall(r"\w+", query_clean.lower()))

    scored_chunks = []
    for c in chunks:
        chunk_text = c.get("text", "")
        chunk_words = set(re.findall(r"\w+", chunk_text.lower()))

        # Cosine similarity score
        cos_score = cosine_similarity(query_vec, c.get("tf_vector", {}))

        # Keyword overlap bonus
        overlap_words = query_words.intersection(chunk_words)
        overlap_score = len(overlap_words) / max(len(query_words), 1)

        final_score = (cos_score * 0.6) + (overlap_score * 0.4)

        if final_score > 0.05 or any(w in chunk_text.lower() for w in query_words if len(w) > 3):
            scored_chunks.append({
                "id": c.get("id"),
                "source": c.get("source", "Document"),
                "chunk_index": c.get("chunk_index", 0),
                "text": chunk_text,
                "score": round(final_score, 4)
            })

    # Sort descending by similarity score
    scored_chunks.sort(key=lambda x: x["score"], reverse=True)
    return scored_chunks[:top_k]
