"""
db.py — SQLite connection, schema init, thin query helpers.
"""
import sqlite3
import json
import threading
from contextlib import contextmanager
from pathlib import Path
from typing import Any

from learner.config import DB_PATH, START_HSK_LEVEL

# Thread-local storage for connections
_local = threading.local()


def get_conn() -> sqlite3.Connection:
    """Return a thread-local sqlite3 connection with row_factory."""
    if not hasattr(_local, "conn") or _local.conn is None:
        conn = sqlite3.connect(str(DB_PATH), check_same_thread=False)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA journal_mode=WAL")
        conn.execute("PRAGMA foreign_keys=ON")
        _local.conn = conn
    return _local.conn


@contextmanager
def transaction():
    """Context manager that commits on success, rolls back on error."""
    conn = get_conn()
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise


def init_db() -> None:
    """Create tables if they don't exist; seed user_profile."""
    conn = get_conn()
    conn.executescript("""
    CREATE TABLE IF NOT EXISTS words (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        simplified      TEXT    NOT NULL,
        traditional     TEXT,
        pinyin          TEXT    NOT NULL,
        hsk_level       INTEGER NOT NULL,
        frequency_rank  INTEGER,
        pos             TEXT,           -- JSON array
        meanings        TEXT,           -- JSON array of strings
        measure_word    TEXT,           -- JSON {mw, pinyin} or NULL
        lesson_card_json TEXT           -- cached rich card (NULL until generated)
    );

    CREATE TABLE IF NOT EXISTS srs_state (
        word_id         INTEGER PRIMARY KEY REFERENCES words(id),
        box             INTEGER NOT NULL DEFAULT 1,
        next_review_at  REAL    NOT NULL DEFAULT 0,  -- unix timestamp
        correct_count   INTEGER NOT NULL DEFAULT 0,
        wrong_count     INTEGER NOT NULL DEFAULT 0,
        hesitated_count INTEGER NOT NULL DEFAULT 0,
        mastered        INTEGER NOT NULL DEFAULT 0   -- 0/1 bool
    );

    CREATE TABLE IF NOT EXISTS user_profile (
        id              INTEGER PRIMARY KEY CHECK (id = 1),
        current_hsk_level INTEGER NOT NULL DEFAULT 2,
        study_streak_days INTEGER NOT NULL DEFAULT 0,
        last_study_date TEXT
    );

    CREATE TABLE IF NOT EXISTS sessions (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        kind            TEXT    NOT NULL,       -- new_drop|review|mixed|redrill
        status          TEXT    NOT NULL DEFAULT 'in_progress',  -- in_progress|completed|abandoned
        created_at      REAL    NOT NULL,       -- unix timestamp
        completed_at    REAL,
        cursor          INTEGER NOT NULL DEFAULT 0,
        parent_session_id INTEGER REFERENCES sessions(id),
        config_json     TEXT                    -- snapshot of generation params
    );

    CREATE TABLE IF NOT EXISTS session_items (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id      INTEGER NOT NULL REFERENCES sessions(id),
        order_index     INTEGER NOT NULL,
        word_id         INTEGER NOT NULL REFERENCES words(id),
        question_json   TEXT    NOT NULL,       -- {type, prompt, target_word, context}
        user_answer     TEXT,                   -- NULL until answered
        grader_output_json TEXT,                -- NULL until answered
        response_time_ms INTEGER,
        outcome         TEXT                    -- correct|wrong|hesitated; NULL until answered
    );

    CREATE TABLE IF NOT EXISTS accepted_answers (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        word_id         INTEGER NOT NULL REFERENCES words(id),
        question_type   TEXT,
        normalized_answer TEXT NOT NULL,
        verdict         TEXT NOT NULL           -- JSON grader_output_json
    );

    CREATE INDEX IF NOT EXISTS idx_session_items_session
        ON session_items(session_id, order_index);
    CREATE INDEX IF NOT EXISTS idx_accepted_answers_lookup
        ON accepted_answers(word_id, question_type, normalized_answer);
    CREATE INDEX IF NOT EXISTS idx_srs_next_review
        ON srs_state(next_review_at);
    """)

    # Seed user_profile (exactly one row)
    conn.execute("""
        INSERT OR IGNORE INTO user_profile (id, current_hsk_level)
        VALUES (1, ?)
    """, (START_HSK_LEVEL,))
    conn.commit()


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def jdump(obj: Any) -> str | None:
    if obj is None:
        return None
    return json.dumps(obj, ensure_ascii=False)


def jload(s: str | None) -> Any:
    if s is None:
        return None
    return json.loads(s)


def fetchone(sql: str, params: tuple = ()) -> sqlite3.Row | None:
    return get_conn().execute(sql, params).fetchone()


def fetchall(sql: str, params: tuple = ()) -> list[sqlite3.Row]:
    return get_conn().execute(sql, params).fetchall()


def execute(sql: str, params: tuple = ()) -> sqlite3.Cursor:
    return get_conn().execute(sql, params)


def words_table_empty() -> bool:
    row = fetchone("SELECT COUNT(*) AS cnt FROM words")
    return row["cnt"] == 0


def get_user_profile() -> dict:
    row = fetchone("SELECT * FROM user_profile WHERE id = 1")
    return dict(row) if row else {"current_hsk_level": START_HSK_LEVEL}


def update_user_profile(**kwargs) -> None:
    with transaction() as conn:
        for k, v in kwargs.items():
            conn.execute(f"UPDATE user_profile SET {k} = ? WHERE id = 1", (v,))
