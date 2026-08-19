import os
import glob
import json
import re
import math
from typing import List, Dict, Any

DOCUMENTS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "documents")
VECTOR_STORE_FILE = os.path.join(os.path.dirname(__file__), "vector_store.json")

# Stopwords set for tokenization and term frequency computation
STOPWORDS = {
    "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "aren't",
    "as", "at", "be", "because", "been", "before", "being", "below", "between", "both", "but", "by",
    "can", "could", "did", "do", "does", "doing", "down", "during", "each", "few", "for", "from",
    "further", "had", "has", "have", "having", "he", "her", "here", "hers", "herself", "him", "himself",
    "his", "how", "i", "if", "in", "into", "is", "it", "its", "itself", "just", "me", "more", "most",
    "my", "myself", "no", "nor", "not", "of", "off", "on", "once", "only", "or", "other", "our", "ours",
    "ourselves", "out", "over", "own", "same", "she", "should", "so", "some", "such", "than", "that",
    "the", "their", "theirs", "them", "themselves", "then", "there", "these", "they", "this", "those",
    "through", "to", "too", "under", "until", "up", "very", "was", "we", "were", "what", "when", "where",
    "which", "while", "who", "whom", "why", "with", "would", "you", "your", "yours", "yourself", "yourselves"
}

def tokenize(text: str) -> List[str]:
    """Tokenizes text into lowercase alphanumeric terms."""
    if not text:
        return []
    return re.findall(r"\b[a-zA-Z0-9_]+\b", text.lower())

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

    # Raw string extraction fallback for binary PDFs
    try:
        with open(filepath, "rb") as f:
            content = f.read().decode("latin-1", errors="ignore")
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
    elif ext in [".txt", ".md", ".json", ".csv", ".log"]:
        try:
            with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
                return f.read()
        except Exception:
            return ""
    return ""

def smart_paragraph_chunk_text(text: str, target_chunk_size: int = 700, overlap: int = 120) -> List[str]:
    """
    Splits text into coherent chunks based on paragraphs, headers, and sentence boundaries.
    Prevents splitting words or key headers mid-sentence.
    """
    if not text or not text.strip():
        return []

    # Clean double headers & ASCII borders
    cleaned_lines = []
    for line in text.splitlines():
        line_s = line.strip()
        if re.match(r'^[=\-_]{4,}$', line_s):
            continue
        cleaned_lines.append(line)

    full_text = "\n".join(cleaned_lines)
    # Break into paragraphs
    paragraphs = re.split(r'\n\s*\n', full_text)

    chunks = []
    current_chunk = ""

    for para in paragraphs:
        para_clean = para.strip()
        if not para_clean:
            continue

        if len(current_chunk) + len(para_clean) + 2 <= target_chunk_size:
            current_chunk = f"{current_chunk}\n\n{para_clean}".strip()
        else:
            if current_chunk:
                chunks.append(current_chunk)
            
            # If paragraph itself is larger than target_chunk_size, split by sentences
            if len(para_clean) > target_chunk_size:
                sentences = re.split(r'(?<=[.!?])\s+', para_clean)
                sub_chunk = ""
                for sent in sentences:
                    if len(sub_chunk) + len(sent) + 1 <= target_chunk_size:
                        sub_chunk = f"{sub_chunk} {sent}".strip()
                    else:
                        if sub_chunk:
                            chunks.append(sub_chunk)
                        sub_chunk = sent
                if sub_chunk:
                    current_chunk = sub_chunk
                else:
                    current_chunk = ""
            else:
                # Add overlap from ending of previous chunk if available
                if current_chunk:
                    overlap_text = current_chunk[-overlap:] if len(current_chunk) >= overlap else current_chunk
                    current_chunk = f"{overlap_text}\n{para_clean}".strip()
                else:
                    current_chunk = para_clean

    if current_chunk.strip():
        chunks.append(current_chunk.strip())

    return chunks

def compute_term_frequencies(tokens: List[str]) -> Dict[str, float]:
    """Computes normalized term frequency dictionary for a list of tokens."""
    total = len(tokens)
    if total == 0:
        return {}
    
    tf = {}
    for term in tokens:
        if term not in STOPWORDS and len(term) > 1:
            tf[term] = tf.get(term, 0) + 1
            
    # Normalize by total tokens
    for term in tf:
        tf[term] = tf[term] / float(total)
        
    return tf

def ingest_documents() -> Dict[str, Any]:
    """
    Ingests all files from app/documents/, chunks them,
    computes BM25 & TF-IDF vector representations, and updates vector_store.json.
    """
    if not os.path.exists(DOCUMENTS_DIR):
        os.makedirs(DOCUMENTS_DIR, exist_ok=True)

    files = glob.glob(os.path.join(DOCUMENTS_DIR, "*.*"))
    vector_store = []
    processed_files = []
    
    doc_term_counts: Dict[str, int] = {}  # Document Frequency DF(t)
    total_tokens_across_chunks = 0

    raw_chunks_data = []

    for filepath in files:
        filename = os.path.basename(filepath)
        content = extract_file_content(filepath)

        if not content.strip():
            continue

        chunks = smart_paragraph_chunk_text(content, target_chunk_size=700, overlap=120)
        processed_files.append({"filename": filename, "chunk_count": len(chunks), "size_bytes": os.path.getsize(filepath)})

        for idx, chunk in enumerate(chunks):
            tokens = tokenize(chunk)
            tf = compute_term_frequencies(tokens)
            unique_terms = set(tf.keys())
            
            for term in unique_terms:
                doc_term_counts[term] = doc_term_counts.get(term, 0) + 1

            total_tokens_across_chunks += len(tokens)

            # Try to extract section title from top of chunk
            first_line = chunk.splitlines()[0] if chunk.splitlines() else ""
            title_context = first_line[:80].strip("#* ")

            raw_chunks_data.append({
                "id": f"{filename}_{idx}",
                "source": filename,
                "chunk_index": idx,
                "text": chunk,
                "tokens": tokens,
                "tf": tf,
                "length": len(tokens),
                "title_context": title_context
            })

    total_chunks = len(raw_chunks_data)
    avgdl = (total_tokens_across_chunks / float(total_chunks)) if total_chunks > 0 else 1.0

    # Compute IDF dictionary for BM25 and TF-IDF
    # Formula: IDF = log((N - n + 0.5) / (n + 0.5) + 1)
    idf_dict: Dict[str, float] = {}
    for term, df in doc_term_counts.items():
        idf_val = math.log(((total_chunks - df + 0.5) / (df + 0.5)) + 1.0)
        idf_dict[term] = max(idf_val, 0.01)

    # Build final chunk entries with TF-IDF vectors
    for item in raw_chunks_data:
        tfidf_vector = {}
        for term, tf_val in item["tf"].items():
            tfidf_vector[term] = round(tf_val * idf_dict.get(term, 0.1), 6)

        vector_store.append({
            "id": item["id"],
            "source": item["source"],
            "chunk_index": item["chunk_index"],
            "text": item["text"],
            "tf_vector": item["tf"],
            "tfidf_vector": tfidf_vector,
            "length": item["length"],
            "title_context": item["title_context"]
        })

    result_store = {
        "updated_at": os.path.getmtime(DOCUMENTS_DIR) if os.path.exists(DOCUMENTS_DIR) else 0,
        "documents": processed_files,
        "total_chunks": total_chunks,
        "avgdl": round(avgdl, 2),
        "idf_dict": idf_dict,
        "chunks": vector_store
    }

    with open(VECTOR_STORE_FILE, "w", encoding="utf-8") as f:
        json.dump(result_store, f, indent=2)

    return {
        "success": True,
        "processed_files": processed_files,
        "total_chunks": total_chunks,
        "avgdl": round(avgdl, 2),
        "vector_store_file": VECTOR_STORE_FILE
    }

if __name__ == "__main__":
    res = ingest_documents()
    print("Advanced Document Ingestion completed:", res)

