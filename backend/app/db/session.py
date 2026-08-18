import os
import sqlite3
from app.core.config import settings

def get_db():
    # Ensure directory exists
    os.makedirs(os.path.dirname(settings.DB_FILE), exist_ok=True)
    conn = sqlite3.connect(settings.DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS contacts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            phone TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS call_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            phone TEXT NOT NULL,
            call_sid TEXT,
            status TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            details TEXT
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS feedback_entries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            customer_name TEXT NOT NULL,
            phone TEXT NOT NULL,
            rating INTEGER NOT NULL,
            feedback_text TEXT,
            sentiment TEXT,
            category TEXT,
            followup_needed INTEGER DEFAULT 0,
            transcript TEXT,
            status TEXT DEFAULT 'completed',
            created_at TEXT NOT NULL
        )
    """)

    try:
        cursor.execute("ALTER TABLE feedback_entries ADD COLUMN transcript TEXT")
    except Exception:
        pass

    try:
        cursor.execute("ALTER TABLE feedback_entries ADD COLUMN status TEXT DEFAULT 'completed'")
    except Exception:
        pass

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS support_tickets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            customer_name TEXT NOT NULL,
            phone TEXT NOT NULL,
            subject TEXT NOT NULL,
            description TEXT,
            priority TEXT DEFAULT 'MEDIUM',
            status TEXT DEFAULT 'OPEN',
            created_at TEXT NOT NULL
        )
    """)

    conn.commit()
    conn.close()
