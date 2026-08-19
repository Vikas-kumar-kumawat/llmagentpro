import os
import json
import re
import math
from typing import List, Dict, Any
from app.rag.ingest import (
    VECTOR_STORE_FILE,
    ingest_documents,
    tokenize,
    STOPWORDS
)

def load_vector_store() -> Dict[str, Any]:
    """Loads the vector store JSON or auto-ingests documents if store is missing."""
    if not os.path.exists(VECTOR_STORE_FILE):
        return ingest_documents()

    try:
        with open(VECTOR_STORE_FILE, "r", encoding="utf-8") as f:
            store = json.load(f)
            if not store.get("chunks"):
                return ingest_documents()
            return store
    except Exception:
        return ingest_documents()

def cosine_similarity(vec1: Dict[str, float], vec2: Dict[str, float]) -> float:
    """Calculates cosine similarity score between two term vectors."""
    if not vec1 or not vec2:
        return 0.0

    dot_product = sum(val * vec2.get(word, 0.0) for word, val in vec1.items())
    mag1 = math.sqrt(sum(val ** 2 for val in vec1.values()))
    mag2 = math.sqrt(sum(val ** 2 for val in vec2.values()))

    if mag1 == 0.0 or mag2 == 0.0:
        return 0.0

    return dot_product / (mag1 * mag2)

def compute_bm25_score(
    query_tokens: List[str],
    chunk_tokens: List[str],
    chunk_len: int,
    avgdl: float,
    idf_dict: Dict[str, float],
    k1: float = 1.5,
    b: float = 0.75
) -> float:
    """Computes Okapi BM25 relevance score for a chunk given a tokenized query."""
    if not query_tokens or not chunk_tokens:
        return 0.0

    # Term frequencies in chunk
    chunk_tf: Dict[str, int] = {}
    for t in chunk_tokens:
        chunk_tf[t] = chunk_tf.get(t, 0) + 1

    score = 0.0
    len_norm = 1.0 - b + b * (chunk_len / max(avgdl, 1.0))

    for term in query_tokens:
        if term in STOPWORDS:
            continue
        if term in chunk_tf:
            f = chunk_tf[term]
            idf = idf_dict.get(term, 0.5)
            numerator = f * (k1 + 1.0)
            denominator = f + k1 * len_norm
            score += idf * (numerator / denominator)

    return score

def compute_phrase_match_score(query_str: str, chunk_text: str) -> float:
    """Computes exact phrase and key n-gram match bonuses."""
    q_clean = query_str.lower().strip()
    c_clean = chunk_text.lower()

    score = 0.0

    # Exact query match in chunk
    if len(q_clean) > 4 and q_clean in c_clean:
        score += 0.5

    # 2-word & 3-word n-gram matches
    words = [w for w in re.findall(r"\w+", q_clean) if w not in STOPWORDS and len(w) > 2]
    if len(words) >= 2:
        for i in range(len(words) - 1):
            bigram = f"{words[i]} {words[i+1]}"
            if bigram in c_clean:
                score += 0.25

    return score

def retrieve_similar_chunks(query: str, top_k: int = 5) -> List[Dict[str, Any]]:
    """
    Advanced Multi-Stage Hybrid Retrieval Engine:
    1. Tokenize & extract query terms.
    2. BM25 scoring over all document chunks.
    3. TF-IDF vector cosine similarity scoring.
    4. Exact phrase & N-gram matching bonus.
    5. Reciprocal Rank Fusion (RRF) Reranking to produce top_k precision chunks.
    """
    query_clean = query.strip()
    if not query_clean:
        return []

    store = load_vector_store()
    chunks = store.get("chunks", [])
    avgdl = float(store.get("avgdl", 50.0))
    idf_dict = store.get("idf_dict", {})

    if not chunks:
        store = ingest_documents()
        chunks = store.get("chunks", [])
        avgdl = float(store.get("avgdl", 50.0))
        idf_dict = store.get("idf_dict", {})

    query_tokens = tokenize(query_clean)
    query_words = [w for w in query_tokens if w not in STOPWORDS]

    # Build query TF-IDF vector
    q_tf: Dict[str, float] = {}
    for w in query_words:
        q_tf[w] = q_tf.get(w, 0) + 1.0
    for w in q_tf:
        q_tf[w] = (q_tf[w] / float(max(len(query_words), 1))) * idf_dict.get(w, 0.5)

    bm25_list = []
    tfidf_list = []

    for idx, c in enumerate(chunks):
        chunk_text = c.get("text", "")
        chunk_tokens = tokenize(chunk_text)
        chunk_len = c.get("length", len(chunk_tokens))

        # BM25 score
        bm25_score = compute_bm25_score(
            query_tokens=query_tokens,
            chunk_tokens=chunk_tokens,
            chunk_len=chunk_len,
            avgdl=avgdl,
            idf_dict=idf_dict
        )

        # TF-IDF Cosine Similarity
        tfidf_vec = c.get("tfidf_vector", {})
        if not tfidf_vec and c.get("tf_vector"):
            # Fallback construct TF-IDF
            tfidf_vec = {t: v * idf_dict.get(t, 0.1) for t, v in c.get("tf_vector").items()}

        cosine_score = cosine_similarity(q_tf, tfidf_vec)

        phrase_score = compute_phrase_match_score(query_clean, chunk_text)

        bm25_list.append((idx, bm25_score + phrase_score * 0.5))
        tfidf_list.append((idx, cosine_score + phrase_score * 0.3))

    # Sort candidates by BM25 and TF-IDF
    bm25_sorted = sorted(bm25_list, key=lambda x: x[1], reverse=True)
    tfidf_sorted = sorted(tfidf_list, key=lambda x: x[1], reverse=True)

    # Reciprocal Rank Fusion (RRF)
    # RRF_score = 1 / (k + rank_bm25) + 1 / (k + rank_tfidf)
    k_rrf = 60
    rrf_scores: Dict[int, float] = {}

    for rank, (idx, b_score) in enumerate(bm25_sorted[:50]):
        rrf_scores[idx] = rrf_scores.get(idx, 0.0) + (1.0 / (k_rrf + rank + 1))

    for rank, (idx, t_score) in enumerate(tfidf_sorted[:50]):
        rrf_scores[idx] = rrf_scores.get(idx, 0.0) + (1.0 / (k_rrf + rank + 1))

    # Rerank & package results
    final_ranked = sorted(rrf_scores.items(), key=lambda x: x[1], reverse=True)

    results = []
    for idx, rrf_score in final_ranked[:top_k]:
        c = chunks[idx]
        chunk_text = c.get("text", "")
        
        # Calculate final confidence score for display (0.0 to 1.0 scale)
        confidence = round(min(rrf_score * 30.0, 0.99), 2)
        if confidence < 0.15:
            # Check if any keyword matches directly
            if any(qw in chunk_text.lower() for qw in query_words if len(qw) > 3):
                confidence = 0.45

        if confidence >= 0.10:
            results.append({
                "id": c.get("id"),
                "source": c.get("source", "Document"),
                "chunk_index": c.get("chunk_index", 0),
                "title_context": c.get("title_context", ""),
                "text": chunk_text,
                "score": confidence,
                "rrf_score": round(rrf_score, 5)
            })

    return results

