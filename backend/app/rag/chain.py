from typing import Dict, Any, List
from app.rag.retriever import retrieve_similar_chunks
from app.core.config import settings

def run_rag_chain(user_query: str) -> Dict[str, Any]:
    """
    Executes the RAG Chain pipeline:
    1. Vector Retrieval: Retrieves top relevant document context chunks for query.
    2. Prompt Generation: Constructs grounded context prompt.
    3. LLM Generation: Invokes Gemini API model to answer based on document context.
    """
    clean_query = user_query.strip()
    if not clean_query:
        return {
            "answer": "Please enter a valid question or prompt.",
            "sources": [],
            "retrieved_chunks": []
        }

    # 1. Retrieve top 3 relevant chunks from RAG vector index
    retrieved_chunks = retrieve_similar_chunks(clean_query, top_k=3)
    sources = list(set([c["source"] for c in retrieved_chunks if c.get("source")]))

    # 2. Build RAG Context text
    if retrieved_chunks:
        context_text = "\n\n".join([
            f"[Source: {c['source']} (Score: {c['score']})]\n{c['text']}"
            for c in retrieved_chunks
        ])
    else:
        context_text = "No direct document match found in knowledge base."

    # 3. Formulate RAG Prompt for Gemini
    rag_prompt = (
        "You are BFibernet AI Copilot, an enterprise AI assistant for BFibernet Fiber Broadband.\n"
        "Answer the user's question using ONLY the provided official knowledge base context below.\n\n"
        f"--- OFFICIAL KNOWLEDGE BASE CONTEXT ---\n{context_text}\n"
        "-------------------------------------\n\n"
        f'User Question: "{clean_query}"\n\n'
        "Instructions:\n"
        "1. Provide a clear, professional, direct answer grounded in the context.\n"
        "2. Include relevant plan names, prices, speeds, SLAs, or contact helplines if mentioned.\n"
        "3. If the answer is not in the context, politely state what official info is available.\n"
        "4. Do not use markdown headers (##), speak naturally as an enterprise assistant."
    )

    answer = ""

    # 4. Generate answer via Gemini API
    if settings.gemini_api_key:
        try:
            from google import genai
            client = genai.Client(api_key=settings.gemini_api_key)
            model_candidates = [settings.gemini_model, "gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"]
            for model_name in model_candidates:
                try:
                    response = client.models.generate_content(
                        model=model_name,
                        contents=rag_prompt
                    )
                    if response and response.text:
                        answer = response.text.strip()
                        break
                except Exception:
                    continue
        except Exception as e:
            print(f"[RAG Chain Gemini Warning] {e}")

    # Fallback response generator if Gemini key unavailable or offline
    if not answer:
        if retrieved_chunks:
            top_text = retrieved_chunks[0]["text"]
            answer = f"Based on official BFibernet documentation ({sources[0]}):\n\n{top_text}"
        else:
            answer = (
                "Welcome to BFibernet AI Copilot! I am connected to the official enterprise knowledge base. "
                "You can ask me about Fiber 50Mbps/100Mbps/300Mbps/1Gbps broadband plans, installation SLAs, "
                "billing policies, or support helplines."
            )

    return {
        "answer": answer,
        "sources": sources,
        "retrieved_chunks": retrieved_chunks
    }
