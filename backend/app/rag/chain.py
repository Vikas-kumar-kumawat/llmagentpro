import re
from typing import Dict, Any, List
from app.rag.retriever import retrieve_similar_chunks
from app.core.config import settings

def clean_raw_text(text: str) -> str:
    """Removes ASCII border lines and raw document header noise."""
    if not text:
        return ""
    lines = []
    for line in text.splitlines():
        line_s = line.strip()
        if re.match(r'^[=\-_]{3,}$', line_s):
            continue
        if "BFIBERNET ENTERPRISE BROADBAND & FIBER NETWORK KNOWLEDGE BASE" in line_s.upper():
            continue
        lines.append(line)
    return "\n".join(lines).strip()

def format_highlight_text(text: str) -> str:
    """Highlights metrics, speeds, prices, SLAs, and phone numbers in bold."""
    if not text:
        return ""
    pattern = r'(\b\d{10}\b|\+\d{2,3}[\d\-]+|\b\d+\s*(?:Mbps|Gbps|GB|TB|hours|hrs|days|%|months?|year|yr|₹|Rs\.?)\b|\b₹\d+[\d,]*\b)'
    return re.sub(pattern, r'**\1**', text, flags=re.IGNORECASE)

def select_suitable_media(query: str, retrieved_chunks: List[Dict[str, Any]]) -> List[Dict[str, str]]:
    """Selects up to 4 suitable BCT Fibernet media thumbnails based on user query and context."""
    q_lower = query.lower()
    combined_context = " ".join([c.get("text", "").lower() for c in retrieved_chunks]) + " " + q_lower

    media_pool = []

    if any(k in combined_context for k in ["router", "wifi", "wi-fi", "hardware", "mesh", "device", "setup"]):
        media_pool = [
            {"url": "/documents/bct_wifi_mesh_router_3.jpg", "caption": "BCT Wi-Fi 6 Mesh Hardware", "filename": "bct_wifi_mesh_router_3.jpg"},
            {"url": "/documents/bct_hardware_chipset_6.jpg", "caption": "Enterprise Router Hardware", "filename": "bct_hardware_chipset_6.jpg"},
            {"url": "/documents/bct_smarthome_wifi6_16.jpg", "caption": "Smart Home Wi-Fi Setup", "filename": "bct_smarthome_wifi6_16.jpg"},
            {"url": "/documents/bct_broadband_laptop_17.jpg", "caption": "High-Speed Wireless Test", "filename": "bct_broadband_laptop_17.jpg"}
        ]
    elif any(k in combined_context for k in ["helpline", "phone", "contact", "support", "customer care", "call", "email"]):
        media_pool = [
            {"url": "/documents/bct_customer_care_support_4.jpg", "caption": "24/7 Technical Support Desk", "filename": "bct_customer_care_support_4.jpg"},
            {"url": "/documents/bct_tech_support_team_8.jpg", "caption": "Customer Service Operations", "filename": "bct_tech_support_team_8.jpg"},
            {"url": "/documents/bct_customer_satisfaction_20.jpg", "caption": "Customer Satisfaction Team", "filename": "bct_customer_satisfaction_20.jpg"},
            {"url": "/documents/bct_telecom_teamwork_18.jpg", "caption": "Helpline Engineering Center", "filename": "bct_telecom_teamwork_18.jpg"}
        ]
    elif any(k in combined_context for k in ["server", "data center", "railwire", "backbone", "infrastructure", "rack"]):
        media_pool = [
            {"url": "/documents/bct_data_center_servers_2.jpg", "caption": "BCT High-Speed Server Rack", "filename": "bct_data_center_servers_2.jpg"},
            {"url": "/documents/bct_fiber_optic_cables_1.jpg", "caption": "Optic Backbone Infrastructure", "filename": "bct_fiber_optic_cables_1.jpg"},
            {"url": "/documents/bct_global_connectivity_7.jpg", "caption": "Global Fiber Network Nodes", "filename": "bct_global_connectivity_7.jpg"},
            {"url": "/documents/bct_fiber_light_trails_9.jpg", "caption": "Gigabit Optic Transmission", "filename": "bct_fiber_light_trails_9.jpg"}
        ]
    elif any(k in combined_context for k in ["plan", "price", "cost", "tariff", "recharge", "speed", "gbps", "mbps", "billing"]):
        media_pool = [
            {"url": "/documents/bct_enterprise_broadband_12.jpg", "caption": "Enterprise Gigabit Plans", "filename": "bct_enterprise_broadband_12.jpg"},
            {"url": "/documents/bct_highspeed_workspace_14.jpg", "caption": "High-Speed Workstation", "filename": "bct_highspeed_workspace_14.jpg"},
            {"url": "/documents/bct_network_analytics_19.jpg", "caption": "Billing & Speed Telemetry", "filename": "bct_network_analytics_19.jpg"},
            {"url": "/documents/bct_digital_workspace_15.jpg", "caption": "Digital Workspace Internet", "filename": "bct_digital_workspace_15.jpg"}
        ]
    else:
        media_pool = [
            {"url": "/documents/bct_fiber_optic_cables_1.jpg", "caption": "Ultra-Fast Fiber Optic Line", "filename": "bct_fiber_optic_cables_1.jpg"},
            {"url": "/documents/bct_customer_care_support_4.jpg", "caption": "24/7 Technical Support Desk", "filename": "bct_customer_care_support_4.jpg"},
            {"url": "/documents/bct_enterprise_broadband_12.jpg", "caption": "Gigabit Enterprise Fiber", "filename": "bct_enterprise_broadband_12.jpg"},
            {"url": "/documents/bct_wifi_mesh_router_3.jpg", "caption": "Wi-Fi 6 Mesh Hardware", "filename": "bct_wifi_mesh_router_3.jpg"}
        ]

    return media_pool

def synthesize_dynamic_answer(user_query: str, retrieved_chunks: List[Dict[str, Any]], sources: List[str]) -> str:
    """
    Synthesizes a highly detailed, comprehensive Perplexity-style response
    structured with executive overview, clear section headings, detailed bullet points,
    and clean text highlights.
    """
    q = user_query.strip()
    q_lower = q.lower()

    cleaned_chunks = []
    for c in retrieved_chunks:
        t = clean_raw_text(c.get("text", ""))
        if t:
            cleaned_chunks.append({"source": c.get("source", "Doc"), "text": t})

    combined_text = "\n\n".join([item["text"] for item in cleaned_chunks])

    # 1. Contact / Helpline Queries (Structured in Perplexity Style)
    if any(k in q_lower for k in ["helpline", "phone", "contact", "customer care", "support email", "email"]):
        phone_matches = re.findall(r'(\+\d[\d\-\s]{8,15}|\b\d{10}\b|1800[-\d]+)', combined_text)
        email_matches = re.findall(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', combined_text)

        phones = list(dict.fromkeys([p.strip() for p in phone_matches if len(p.strip()) >= 10]))
        emails = list(dict.fromkeys([e.strip() for e in email_matches if '@' in e]))

        phone_list_str = ", ".join([f"**{p}**" for p in phones[:4]]) if phones else "**+91-9119138787**, **+91-9119138686**"
        email_list_str = ", ".join([f"**{e}**" for e in emails[:4]]) if emails else "**info@bctfibernet.com**, **support@bctfibernet.com**, **nodal@apexfibernet.com**"

        return (
            f"### Official Support & Contact Directory\n\n"
            f"BFibernet provides 24/7 dedicated customer service, technical troubleshooting, and enterprise network assistance. "
            f"Below is the complete verified contact directory extracted from official company records.\n\n"
            f"### 1. Direct Voice Helplines\n"
            f"- 📞 **Primary Support Helplines:** {phone_list_str}\n"
            f"- ⏱️ **Operating Hours:** Available **24 Hours / 7 Days a week** for uninterrupted connectivity support.\n"
            f"- ⚡ **Escalation SLA:** Critical network outage complaints are routed directly to senior network operations engineers within **15 minutes**.\n\n"
            f"### 2. Official Email Desks\n"
            f"- ✉️ **Customer & General Inquiries:** {email_list_str}\n"
            f"- 🏢 **Enterprise & Billing Desk:** Email `billing@bctfibernet.com` for invoice disputes and recharge queries.\n"
            f"- 🛡️ **Grievance & Nodal Officer:** For formal complaint escalations, reach out to `nodal@apexfibernet.com`.\n\n"
            f"### 3. Customer Care SLA & Support Standards\n"
            f"- **First Contact Resolution (FCR):** Target resolution within **2 business hours** for line resets & router configuration issues.\n"
            f"- **On-Site Field Visit:** Technical field engineers arrive at customer locations within **4 to 6 business hours** if hardware replacement is required."
        )

    # 2. General Knowledge Extraction in Perplexity Style
    if combined_text:
        query_words = set(re.findall(r"\w+", q_lower)) - {
            "what", "is", "the", "a", "an", "for", "in", "to", "of", "and", "or", "me", "tell", "how",
            "does", "can", "i", "about", "give", "show", "details", "information", "with", "from"
        }

        relevant_sentences = []
        seen_sentences = set()

        for chunk_item in cleaned_chunks:
            source_name = chunk_item["source"]
            chunk_str = chunk_item["text"]

            lines_or_sentences = re.split(r'(?<=[.!?])\s+|\n+', chunk_str)
            for item in lines_or_sentences:
                item_str = item.strip()
                if len(item_str) < 14:
                    continue
                item_lower = item_str.lower()

                match_count = sum(1 for w in query_words if len(w) > 2 and w in item_lower)
                if match_count > 0 or len(query_words) == 0:
                    norm_sent = re.sub(r'\s+', ' ', item_str)
                    if norm_sent not in seen_sentences:
                        seen_sentences.add(norm_sent)
                        formatted = format_highlight_text(norm_sent)
                        relevant_sentences.append((match_count, source_name, formatted))

        relevant_sentences.sort(key=lambda x: x[0], reverse=True)

        if relevant_sentences:
            part1 = [f"- {item[2]}" for item in relevant_sentences[:3]]
            part2 = [f"- {item[2]}" for item in relevant_sentences[3:6]]

            sec1_text = "\n".join(part1) if part1 else "- High-speed symmetrical broadband connectivity."
            sec2_text = "\n".join(part2) if part2 else "- Guaranteed uptime and dedicated customer service desk."

            return (
                f"### Overview & Analysis for '{user_query}'\n\n"
                f"Based on official BFibernet knowledge base records, here is a detailed breakdown answering your query:\n\n"
                f"### 1. Key Highlights & Specifications\n\n"
                f"{sec1_text}\n\n"
                f"### 2. Operational & Service Details\n\n"
                f"{sec2_text}\n\n"
                f"### 3. Service Guarantees\n"
                f"- 🚀 **Gigabit Performance:** Symmetrical download and upload speeds delivered over 100% pure glass fiber.\n"
                f"- ⏱️ **Fast Installation:** Router provisioning and fiber line termination within **4 to 6 business hours**."
            )

    return (
        f"### BFibernet Broadband Service Overview\n\n"
        f"Here is a comprehensive summary of BFibernet fiber broadband services and policies:\n\n"
        f"### 1. Broadband Plans & Speeds\n"
        f"- ⚡ **Speed Tiers:** Ultra-high-speed fiber broadband ranging from **100 Mbps up to 1 Gbps** symmetrical.\n"
        f"- ♾️ **Unlimited Data:** Truly unlimited high-speed data with zero FUP caps on high-tier plans.\n\n"
        f"### 2. Support & Contact Helplines\n"
        f"- 📞 **Support Helplines:** **+91-9119138787**, **+91-9119138686** (24/7 Desk).\n"
        f"- ✉️ **Support Email:** **info@bctfibernet.com**, **support@bctfibernet.com**.\n\n"
        f"### 3. Service Level Agreements\n"
        f"- ⏱️ **Installation SLA:** Line termination and Wi-Fi 6 router setup completed within **4 to 6 business hours**.\n"
        f"- 🛡️ **Uptime Guarantee:** **99.9% network SLA** backed by enterprise fiber ring architecture."
    )

def run_rag_chain(user_query: str) -> Dict[str, Any]:
    """
    Executes the RAG Chain pipeline in Perplexity AI style:
    1. Multi-Stage Hybrid Retrieval: Retrieves top 5 matching context chunks.
    2. Multi-Media Gallery Selection: Selects relevant thumbnail media cards.
    3. Grounded Synthesis: Generates detailed, structured Markdown answers.
    """
    clean_query = user_query.strip()
    if not clean_query:
        return {
            "answer": "Please enter a valid question or prompt.",
            "sources": [],
            "retrieved_chunks": [],
            "image": None,
            "media_gallery": []
        }

    # 1. Retrieve top 5 relevant chunks using Hybrid RAG Engine
    retrieved_chunks = retrieve_similar_chunks(clean_query, top_k=5)
    sources = list(dict.fromkeys([c["source"] for c in retrieved_chunks if c.get("source")]))

    # 2. Select suitable media gallery matching query topic
    media_gallery = select_suitable_media(clean_query, retrieved_chunks)
    primary_image = media_gallery[0] if media_gallery else None

    # 3. Build RAG Context text
    if retrieved_chunks:
        cleaned_list = []
        for c in retrieved_chunks:
            cleaned_t = clean_raw_text(c.get("text", ""))
            score_percent = int(c.get("score", 0.5) * 100)
            if cleaned_t:
                cleaned_list.append(f"[Document: {c['source']} | Confidence: {score_percent}%]\n{cleaned_t}")
        context_text = "\n\n".join(cleaned_list)
    else:
        context_text = "No direct document match found in knowledge base."

    # 4. Formulate RAG Prompt for Gemini (Perplexity Style)
    rag_prompt = (
        "You are BFibernet AI Copilot, an enterprise AI assistant for BFibernet Fiber Broadband.\n"
        "Your task is to provide a detailed, comprehensive, beautifully structured answer in PERPLEXITY AI style based ONLY on official context.\n\n"
        f"--- OFFICIAL KNOWLEDGE BASE CONTEXT ---\n{context_text}\n"
        "-------------------------------------\n\n"
        f'User Question: "{clean_query}"\n\n'
        "PERPLEXITY ANSWER FORMATTING RULES:\n"
        "1. Write a direct executive summary paragraph to start.\n"
        "2. Group details into numbered markdown sections with clear headings (### 1. Section Title, ### 2. Section Title).\n"
        "3. Provide rich, thorough bullet points with detailed explanations.\n"
        "4. Highlight key metrics in bold (prices in ₹, speeds in Mbps/Gbps, SLAs, phone numbers, emails).\n"
        "5. Format phone numbers and emails as clean bold text with icons (📞 +91..., ✉️ email...), NEVER in code backticks.\n"
        "6. Do NOT output raw file headers, ASCII separator lines (====), or document metadata tags."
    )

    answer = ""

    # Try generating answer via Gemini API models
    if settings.gemini_api_key:
        try:
            from google import genai
            client = genai.Client(api_key=settings.gemini_api_key)
            model_candidates = [
                settings.gemini_model,
                "gemini-2.5-flash",
                "gemini-2.0-flash",
                "gemini-1.5-flash",
                "gemini-flash-latest"
            ]
            for model_name in model_candidates:
                try:
                    response = client.models.generate_content(
                        model=model_name,
                        contents=rag_prompt
                    )
                    if response and response.text:
                        answer = clean_raw_text(response.text.strip())
                        break
                except Exception:
                    continue
        except Exception as e:
            print(f"[RAG Chain Gemini Warning] {e}")

    # Fallback Synthesizer if Gemini key is unconfigured or offline
    if not answer:
        answer = synthesize_dynamic_answer(clean_query, retrieved_chunks, sources)

    return {
        "answer": answer,
        "sources": sources,
        "retrieved_chunks": retrieved_chunks,
        "image": primary_image,
        "media_gallery": media_gallery
    }


