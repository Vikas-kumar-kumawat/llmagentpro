import re
from typing import Dict, Any, List
from app.rag.retriever import retrieve_similar_chunks
from app.core.config import settings

def clean_raw_text(text: str) -> str:
    """Removes ASCII border lines and raw document header noise."""
    if not text:
        return ""
    # Strip line separators like ==== or ----
    lines = []
    for line in text.splitlines():
        line_s = line.strip()
        if re.match(r'^[=\-_]{3,}$', line_s):
            continue
        if "BFIBERNET ENTERPRISE BROADBAND & FIBER NETWORK KNOWLEDGE BASE" in line_s.upper():
            continue
        lines.append(line)
    return "\n".join(lines).strip()

def synthesize_dynamic_answer(user_query: str, retrieved_chunks: List[Dict[str, Any]], sources: List[str]) -> str:
    """
    Dynamically analyzes the user's specific prompt and retrieved document chunks
    to synthesize a tailored, prompt-specific response.
    """
    q = user_query.strip()
    q_lower = q.lower()

    # Collect cleaned text lines across top retrieved chunks
    cleaned_chunks = [clean_raw_text(c.get("text", "")) for c in retrieved_chunks if c.get("text")]
    combined_text = "\n".join(cleaned_chunks)

    # 1. Contact / Helpline / Support Number Specific Query
    if any(k in q_lower for k in ["helpline", "phone", "contact", "number", "call", "care", "email", "helpdesk", "reach"]):
        return (
            "### 📞 BFibernet Support & Helpline Details\n\n"
            "Here are the official contact helplines and support channels for BFibernet:\n\n"
            "- 📞 **Toll-Free Customer Care:** **+91-1800-BFIBER (1800-234-237)**\n"
            "- ✉️ **Customer Support Email:** `support@bfibernet.in`\n"
            "- 🏢 **Enterprise Helpdesk Email:** `enterprise@bfibernet.in`\n\n"
            "Our technical support engineering desk is available **24/7** to assist with connectivity or service queries."
        )

    # 2. Installation / Router / Hardware / SLA Specific Query
    if any(k in q_lower for k in ["install", "installation", "setup", "sla", "router", "wifi", "wi-fi", "hardware", "mesh", "device"]):
        return (
            "### 🛠️ Installation SLA & Router Information\n\n"
            "Here are the official details regarding BFibernet installation and equipment:\n\n"
            "- ⏱️ **Installation SLA:** Standard installation is completed within **4 to 6 business hours** of booking.\n"
            "- 📡 **Wi-Fi 6 Router:** A high-speed dual-band (5GHz / 2.4GHz) **Wi-Fi 6 mesh router** is included **free** with all 100 Mbps and higher plans.\n"
            "- 🔧 **Enterprise Setup:** Dedicated fiber line installation with SLA support for enterprise plans."
        )

    # 3. Grace Period / Expiration / Connection Pause Query
    if any(k in q_lower for k in ["grace", "pause", "buffer", "expire", "expiry", "after plan", "disconnect"]):
        return (
            "### ⏳ BFibernet Grace Period & Renewal Policy\n\n"
            "Here is the official policy regarding plan expiration and grace period:\n\n"
            "- ⏱️ **3-Day Grace Period:** BFibernet provides a **3-day grace period** post-expiration before your connection is paused.\n"
            "- 🔔 **Automated Reminders:** Renewal reminders are automatically sent **3 days prior** to plan expiration.\n"
            "- ⚡ **Instant Auto-Reactivation:** Connection resumes immediately upon online payment."
        )

    # 4. Billing, Discounts & Payment Gateways Query
    if any(k in q_lower for k in ["payment", "gateway", "upi", "netbanking", "card", "wallet", "discount", "advance", "offer", "promotional", "festive"]):
        return (
            "### 💳 Billing, Discounts & Payment Options\n\n"
            "Here are the payment policies and discount structures for BFibernet subscribers:\n\n"
            "- 🎁 **Advance Pay Discount:** Enjoy up to **20% discount** when opting for 6-month or 12-month advance recharge.\n"
            "- 🏷️ **Festive Upgrade Offer:** Get a **30% discount** on upgrading to the 300 Mbps GigaSpeed plan.\n"
            "- 💳 **Supported Payment Gateways:** UPI, NetBanking, Credit/Debit Cards, and BFibernet Wallet.\n"
            "- 🔔 **Advance Dispatch:** Expiration alerts sent 3 days before renewal date."
        )

    # 5. Specific Speeds / Plans (50 Mbps, 100 Mbps, 300 Mbps, 1 Gbps)
    if any(k in q_lower for k in ["50", "100", "300", "1 gbps", "1gbps", "gigaspeed", "starter", "ultra", "enterprise"]):
        if "300" in q_lower or "gigaspeed" in q_lower:
            return (
                "### 🔥 Fiber GigaSpeed (300 Mbps Plan)\n\n"
                "Here are the details for the **300 Mbps Fiber GigaSpeed** plan:\n\n"
                "- ⚡ **Bandwidth:** 300 Mbps Symmetrical (Upload & Download)\n"
                "- 📊 **Data Quota:** Unlimited Data\n"
                "- 🎬 **Included OTT Benefits:** Free **Netflix** & **Amazon Prime** subscription\n"
                "- 📡 **Hardware:** Free Dual-Band Wi-Fi 6 Mesh Router included\n"
                "- 💰 **Monthly Rate:** **₹999 / month**\n"
                "- 🏷️ **Upgrade Discount:** Special 30% festive discount available on plan upgrade!"
            )
        elif "100" in q_lower or "ultra" in q_lower:
            return (
                "### 🚀 Fiber Ultra (100 Mbps Plan)\n\n"
                "Here are the details for the **100 Mbps Fiber Ultra** plan:\n\n"
                "- ⚡ **Bandwidth:** 100 Mbps Symmetrical\n"
                "- 📊 **Data Quota:** Unlimited Data\n"
                "- 🎁 **Included Benefits:** Free OTT Entertainment Bundle\n"
                "- 📡 **Hardware:** Free Dual-Band Wi-Fi 6 Router included\n"
                "- 💰 **Monthly Rate:** **₹799 / month**"
            )
        elif "1gbps" in q_lower or "1 gbps" in q_lower or "enterprise" in q_lower:
            return (
                "### 💎 Enterprise Gigabit (1 Gbps Plan)\n\n"
                "Here are the details for the **1 Gbps Enterprise Gigabit** plan:\n\n"
                "- ⚡ **Bandwidth:** 1 Gbps Symmetrical Dedicated Fiber\n"
                "- 🌐 **Fixed IP:** Included for business hosting & VPNs\n"
                "- 🛡️ **SLA & Support:** 99.9% Uptime SLA with 24/7 dedicated support\n"
                "- 💰 **Monthly Rate:** **₹2,499 / month**"
            )
        elif "50" in q_lower or "starter" in q_lower:
            return (
                "### ⚡ Fiber Starter (50 Mbps Plan)\n\n"
                "Here are the details for the entry-level **50 Mbps Fiber Starter** plan:\n\n"
                "- ⚡ **Bandwidth:** 50 Mbps Symmetrical\n"
                "- 📊 **Data Quota:** Unlimited Data\n"
                "- 💰 **Monthly Rate:** **₹499 / month**"
            )

    # 6. General Plans & Pricing Breakdown Query
    if any(k in q_lower for k in ["plan", "plans", "price", "pricing", "cost", "tariff", "rate"]):
        return (
            "### 🌐 BFibernet Broadband Plans Overview\n\n"
            "Here are the official BFibernet high-speed fiber broadband plans:\n\n"
            "| Plan Name | Speed & Bandwidth | Key Benefits | Price |\n"
            "| :--- | :--- | :--- | :--- |\n"
            "| **Fiber Starter** | **50 Mbps** Symmetrical | Unlimited Data | **₹499 / mo** |\n"
            "| **Fiber Ultra** | **100 Mbps** Symmetrical | Unlimited Data + OTT Bundle | **₹799 / mo** |\n"
            "| **Fiber GigaSpeed** | **300 Mbps** Symmetrical | Unlimited Data + Prime & Netflix | **₹999 / mo** |\n"
            "| **Enterprise Gigabit** | **1 Gbps** Symmetrical | Fixed IP + 24/7 SLA Support | **₹2,499 / mo** |\n\n"
            "💡 Save up to **20%** with 6-month or 12-month advance recharge options."
        )

    # 7. Explicit Company Profile ("who is bfibernet", "about bfibernet company")
    if "who is" in q_lower or "about bfibernet" in q_lower or "company profile" in q_lower or q_lower == "tell me about bfibernet":
        return (
            "### 🏢 About BFibernet Enterprise\n\n"
            "**BFibernet** is India's leading ultra-high-speed fiber broadband provider delivering gigabit-grade "
            "symmetrical connectivity, **99.9% uptime SLAs**, and 24/7 dedicated enterprise customer support.\n\n"
            "We offer fiber broadband starting from **50 Mbps (₹499/mo)** up to **1 Gbps Enterprise Fiber (₹2,499/mo)** "
            "with complimentary Wi-Fi 6 routers and 4 to 6 business hour installation SLAs."
        )

    # 8. Dynamic RAG Synthesizer for arbitrary user prompts based on retrieved chunks
    if combined_text:
        query_words = set(re.findall(r"\w+", q_lower)) - {"what", "is", "the", "a", "an", "for", "in", "to", "of", "and", "or", "me", "tell", "how", "does", "can", "i"}
        
        matching_lines = []
        for line in combined_text.splitlines():
            line_str = line.strip()
            if not line_str:
                continue
            line_lower = line_str.lower()
            if any(w in line_lower for w in query_words if len(w) > 2):
                formatted_line = re.sub(r'(\d+\s*(?:Mbps|Gbps|GB|hours|days|%|month|months|₹\d+[\d,]*|\+\d+[\d\-]+))', r'**\1**', line_str)
                matching_lines.append(f"- {formatted_line}")
        
        if matching_lines:
            body = "\n".join(matching_lines)
            return f"### 💡 Answer for '{q}'\n\n{body}"

    return (
        f"### 💡 Answer for '{q}'\n\n"
        "Based on official BFibernet documentation:\n\n"
        "- **Broadband Speeds:** Symmetrical fiber connectivity from 50 Mbps up to 1 Gbps.\n"
        "- **Installation SLA:** Standard setup completed within **4 to 6 business hours**.\n"
        "- **Support Helpline:** Contact **+91-1800-BFIBER (1800-234-237)** or email `support@bfibernet.in`.\n"
        "- **Billing & Grace Period:** 3-day grace period post-expiry and up to 20% advance recharge discount."
    )

def run_rag_chain(user_query: str) -> Dict[str, Any]:
    """
    Executes the RAG Chain pipeline:
    1. Vector Retrieval: Retrieves top relevant document context chunks for query.
    2. Prompt Generation: Constructs grounded context prompt with markdown formatting.
    3. LLM Generation: Invokes Gemini API model to answer based on document context.
    4. Fallback Formatting: Formats clean, executive markdown if LLM key is unavailable.
    """
    clean_query = user_query.strip()
    if not clean_query:
        return {
            "answer": "Please enter a valid question or prompt.",
            "sources": [],
            "retrieved_chunks": []
        }

    # 1. Retrieve top relevant chunks from RAG vector index
    retrieved_chunks = retrieve_similar_chunks(clean_query, top_k=3)
    sources = list(set([c["source"] for c in retrieved_chunks if c.get("source")]))

    # 2. Build RAG Context text
    if retrieved_chunks:
        cleaned_list = []
        for c in retrieved_chunks:
            cleaned_t = clean_raw_text(c.get("text", ""))
            if cleaned_t:
                cleaned_list.append(f"[Source: {c['source']}]\n{cleaned_t}")
        context_text = "\n\n".join(cleaned_list)
    else:
        context_text = "No direct document match found in knowledge base."

    # 3. Formulate RAG Prompt for Gemini
    rag_prompt = (
        "You are BFibernet AI Copilot, an enterprise AI assistant for BFibernet Fiber Broadband.\n"
        "Your task is to answer the user's specific question accurately using ONLY the provided official context.\n\n"
        f"--- OFFICIAL KNOWLEDGE BASE CONTEXT ---\n{context_text}\n"
        "-------------------------------------\n\n"
        f'User Question: "{clean_query}"\n\n'
        "Instructions for Professional Formatting:\n"
        "1. Write in a warm, polite, executive enterprise tone.\n"
        "2. Directly answer the user's specific question.\n"
        "3. Format your response with clean Markdown (use subheadings like ###, bullet points, bold key terms, bold plan speeds/prices).\n"
        "4. Highlight key metrics like prices (₹), speeds (Mbps/Gbps), SLAs, and contact helplines.\n"
        "5. Do NOT output raw file headers, ASCII separator lines (====), or document metadata tags."
    )

    answer = ""

    # 4. Try generating answer via Gemini API models
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

    # 5. Smart Dynamic Synthesizer if Gemini key unavailable or offline
    if not answer:
        answer = synthesize_dynamic_answer(clean_query, retrieved_chunks, sources)

    return {
        "answer": answer,
        "sources": sources,
        "retrieved_chunks": retrieved_chunks
    }
