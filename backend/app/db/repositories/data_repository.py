from datetime import datetime
from app.db.session import get_db

class DataRepository:
    """
    Decoupled Repository Pattern for Contacts, Call Logs, Feedback, and Support Tickets.
    """

    @staticmethod
    def get_all_contacts(limit: int = 50):
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT id, name, phone, created_at FROM contacts ORDER BY id DESC LIMIT ?", (limit,))
        contacts = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return contacts

    @staticmethod
    def get_call_logs(limit: int = 20):
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT id, name, phone, call_sid, status, timestamp, details FROM call_logs ORDER BY id DESC LIMIT ?", (limit,))
        logs = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return logs

    @staticmethod
    def add_contact(name: str, phone: str) -> dict:
        conn = get_db()
        cursor = conn.cursor()
        now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        cursor.execute("INSERT INTO contacts (name, phone, created_at) VALUES (?, ?, ?)", (name, phone, now_str))
        conn.commit()
        contact_id = cursor.lastrowid
        conn.close()
        return {"id": contact_id, "name": name, "phone": phone, "created_at": now_str}

    @staticmethod
    def ensure_contact_exists(name: str, phone: str):
        conn = get_db()
        cursor = conn.cursor()
        now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        cursor.execute("SELECT id FROM contacts WHERE phone = ?", (phone,))
        if not cursor.fetchone():
            cursor.execute("INSERT INTO contacts (name, phone, created_at) VALUES (?, ?, ?)", (name, phone, now_str))
            conn.commit()
        conn.close()

    @staticmethod
    def add_call_log(name: str, phone: str, call_sid: str, status: str, details: str):
        conn = get_db()
        cursor = conn.cursor()
        now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        cursor.execute("""
            INSERT INTO call_logs (name, phone, call_sid, status, timestamp, details)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (name, phone, call_sid, status, now_str, details))
        conn.commit()
        conn.close()

    @staticmethod
    def get_feedback_and_tickets(limit: int = 50):
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id, customer_name, phone, rating, feedback_text, sentiment, category, followup_needed, transcript, status, created_at 
            FROM feedback_entries ORDER BY id DESC LIMIT ?
        """, (limit,))
        feedback = [dict(row) for row in cursor.fetchall()]

        cursor.execute("""
            SELECT id, customer_name, phone, subject, description, priority, status, created_at 
            FROM support_tickets ORDER BY id DESC LIMIT ?
        """, (limit,))
        tickets = [dict(row) for row in cursor.fetchall()]

        conn.close()
        return {"feedback_entries": feedback, "support_tickets": tickets}

    @staticmethod
    def get_feedback_by_id(feedback_id: str):
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT id, customer_name, phone, rating, feedback_text, sentiment, category, followup_needed, transcript, status, created_at FROM feedback_entries WHERE id = ?", (feedback_id,))
        row = cursor.fetchone()
        conn.close()
        return dict(row) if row else None

    @staticmethod
    def update_feedback_text(feedback_id: str, new_text: str):
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("UPDATE feedback_entries SET feedback_text = ? WHERE id = ?", (new_text, feedback_id))
        conn.commit()
        conn.close()

    @staticmethod
    def update_feedback_transcript_and_data(feedback_id: str, feedback_text: str, rating: int = None, sentiment: str = None, transcript_json: str = None, status: str = None):
        conn = get_db()
        cursor = conn.cursor()
        query = "UPDATE feedback_entries SET feedback_text = ?"
        params = [feedback_text]

        if rating is not None:
            query += ", rating = ?"
            params.append(rating)
        if sentiment:
            query += ", sentiment = ?"
            params.append(sentiment)
        if transcript_json:
            query += ", transcript = ?"
            params.append(transcript_json)
        if status:
            query += ", status = ?"
            params.append(status)

        query += " WHERE id = ?"
        params.append(feedback_id)

        cursor.execute(query, params)
        conn.commit()
        conn.close()

    @staticmethod
    def save_feedback(customer_name: str, phone: str, rating: int, feedback_text: str, sentiment: str, category: str, followup_needed: bool):
        conn = get_db()
        cursor = conn.cursor()
        now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        cursor.execute("""
            INSERT INTO feedback_entries (customer_name, phone, rating, feedback_text, sentiment, category, followup_needed, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (customer_name, phone, rating, feedback_text, sentiment, category, 1 if followup_needed else 0, now_str))
        feedback_id = cursor.lastrowid

        ticket_id = None
        if followup_needed:
            subject = f"Followup Required: {customer_name} ({category.upper()})"
            desc = f"Customer Rating: {rating}/5. Feedback: {feedback_text}. Auto-generated by LangGraph Agent."
            cursor.execute("""
                INSERT INTO support_tickets (customer_name, phone, subject, description, priority, status, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (customer_name, phone, subject, desc, "HIGH" if rating == 1 else "MEDIUM", "OPEN", now_str))
            ticket_id = cursor.lastrowid

        conn.commit()
        conn.close()
        return feedback_id, ticket_id

    @staticmethod
    def delete_feedback_entry(feedback_id: str) -> bool:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM feedback_entries WHERE id = ?", (feedback_id,))
        rows = cursor.rowcount
        conn.commit()
        conn.close()
        return rows > 0

    @staticmethod
    def update_feedback_entry(feedback_id: str, customer_name: str, phone: str, rating: int, feedback_text: str, sentiment: str) -> bool:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE feedback_entries 
            SET customer_name = ?, phone = ?, rating = ?, feedback_text = ?, sentiment = ?
            WHERE id = ?
        """, (customer_name, phone, rating, feedback_text, sentiment, feedback_id))
        rows = cursor.rowcount
        conn.commit()
        conn.close()
        return rows > 0
