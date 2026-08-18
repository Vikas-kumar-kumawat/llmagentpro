import os
import glob
import json
import re
import math
from typing import List, Dict, Any

DOCUMENTS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "documents")
VECTOR_STORE_FILE = os.path.join(os.path.dirname(__file__), "vector_store.json")

def extract_text_from_pdf(filepath: str) -> str:
    """Extracts text content from a PDF file using available libraries or fallback."""
    text = ""
    # Try pypdf
    try:
        import pypdf
        reader = pypdf.PdfReader(filepath)
        for page in reader.pages:
            extracted = page.extract_text()
            if extracted:
                text += extracted + "\n"
        if text.strip():
            return text
    except Exception:
        pass

    # Try PyPDF2
    try:
        import PyPDF2
        with open(filepath, "rb") as f:
            reader = PyPDF2.PdfReader(f)
            for page in reader.pages:
                extracted = page.extract_text()
                if extracted:
                    text += extracted + "\n"
        if text.strip():
            return text
    except Exception:
        pass

    # Try pdfplumber
    try:
        import pdfplumber
        with pdfplumber.open(filepath) as pdf:
            for page in pdf.pages:
                extracted = page.extract_text()
                if extracted:
                    text += extracted + "\n"
        if text.strip():
            return text
    except Exception:
        pass

    # Basic raw string extraction fallback for binary PDFs
    try:
        with open(filepath, "rb") as f:
            content = f.read().decode("latin-1", errors="ignore")
            # Extract plain text strings between BT and ET tags or ASCII words
            strings = re.findall(r"\((.*?)\)", content)
            if strings:
                text = " ".join([s for s in strings if len(s) > 2])
    except Exception:
        pass

    return text

def extract_file_content(filepath: str) -> str:
    """Extracts text from PDF, TXT, or MD files."""
    ext = os.path.splitext(filepath)[1].lower()
    if ext == ".pdf":
        return extract_text_from_pdf(filepath)
    elif ext in [".txt", ".md", ".json", ".csv"]:
        try:
            with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
                return f.read()
        except Exception:
            return ""
    return ""

def chunk_text(text: str, chunk_size: int = 400, overlap: int = 60) -> List[str]:
    """Splits text into overlapping semantic chunks."""
    clean_text = re.sub(r"\s+", " ", text).strip()
    if not clean_text:
        return []

    chunks = []
    start = 0
    while start < len(clean_text):
        end = start + chunk_size
        chunk = clean_text[start:end]
        if chunk.strip():
            chunks.append(chunk.strip())
        start += (chunk_size - overlap)

    return chunks

def compute_term_frequencies(text: str) -> Dict[str, float]:
    """Computes normalized TF vector for cosine similarity search."""
    words = re.findall(r"\w+", text.lower())
    total = len(words)
    if total == 0:
        return {}
    tf = {}
    for w in words:
        if len(w) > 2:
            tf[w] = tf.get(w, 0) + 1.0
    for w in tf:
        tf[w] = tf[w] / total
    return tf

def ingest_documents() -> Dict[str, Any]:
    """
    Ingests all files from app/documents/, chunks them, 
    computes vector representations, and saves to vector_store.json.
    """
    if not os.path.exists(DOCUMENTS_DIR):
        os.makedirs(DOCUMENTS_DIR, exist_ok=True)

    files = glob.glob(os.path.join(DOCUMENTS_DIR, "*.*"))
    vector_store = []
    processed_files = []

    for filepath in files:
        filename = os.path.basename(filepath)
        content = extract_file_content(filepath)

        if not content.strip():
            continue

        chunks = chunk_text(content)
        processed_files.append({"filename": filename, "chunk_count": len(chunks)})

        for idx, chunk in enumerate(chunks):
            tf_vector = compute_term_frequencies(chunk)
            vector_store.append({
                "id": f"{filename}_{idx}",
                "source": filename,
                "chunk_index": idx,
                "text": chunk,
                "tf_vector": tf_vector
            })

    with open(VECTOR_STORE_FILE, "w", encoding="utf-8") as f:
        json.dump({
            "updated_at": os.path.getmtime(DOCUMENTS_DIR) if os.path.exists(DOCUMENTS_DIR) else 0,
            "documents": processed_files,
            "total_chunks": len(vector_store),
            "chunks": vector_store
        }, f, indent=2)

    return {
        "success": True,
        "processed_files": processed_files,
        "total_chunks": len(vector_store),
        "vector_store_file": VECTOR_STORE_FILE
    }

if __name__ == "__main__":
    res = ingest_documents()
    print("Document ingestion completed:", res)
