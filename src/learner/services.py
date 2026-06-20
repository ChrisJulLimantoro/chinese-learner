"""
services.py — service layer (spec §8). Plain Python called by NiceGUI UI.
No HTTP — all DB + LLM calls happen here.
"""
import json
import logging
import time
from typing import Any

from learner.config import DEFAULT_SESSION_SIZE, START_HSK_LEVEL
from learner.db import (
    get_conn, transaction, fetchone, fetchall,
    jdump, jload, get_user_profile, update_user_profile,
)
from learner.grading import grade_answer_with_cache
from learner.srs import (
    update_srs, ensure_srs_state,
    get_unseen_words, get_due_words, get_mixed_words,
    count_due, check_progression,
)

log = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _row_to_dict(row) -> dict:
    return dict(row) if row else {}


def _session_score(session_id: int) -> tuple[int, int]:
    """Returns (correct_count, total_answered) for a session."""
    rows = fetchall("""
        SELECT outcome FROM session_items
        WHERE session_id = ? AND outcome IS NOT NULL
    """, (session_id,))
    total = len(rows)
    correct = sum(1 for r in rows if r["outcome"] == "correct")
    return correct, total


def _ensure_lesson_card(word: dict) -> dict:
    """Load or generate+cache the lesson card for a word. Returns updated word dict."""
    from learner import llm
    if word.get("lesson_card_json"):
        return word

    log.info("Generating lesson card for word_id=%d (%s)", word["id"], word["simplified"])
    card = llm.generate_lesson_card(word)
    card_json = jdump(card)

    with transaction() as conn:
        conn.execute(
            "UPDATE words SET lesson_card_json = ? WHERE id = ?",
            (card_json, word["id"]),
        )
    word = dict(word)
    word["lesson_card_json"] = card_json
    return word


def _word_row_to_dict(row) -> dict:
    d = dict(row)
    for field in ("pos", "meanings", "measure_word"):
        if isinstance(d.get(field), str):
            try:
                d[field] = json.loads(d[field])
            except Exception:
                pass
    return d


# ---------------------------------------------------------------------------
# start_session
# ---------------------------------------------------------------------------

def _create_session(words: list[dict], kind: str, level: int) -> dict:
    """
    Shared core: ensure lesson cards + questions, persist session + items, seed SRS.
    Returns the standard session payload.
    """
    from learner import llm

    if not words:
        raise RuntimeError("No words available for session. Word bank may be empty.")

    # Ensure lesson cards cached
    enriched_words = [_ensure_lesson_card(w) for w in words]

    # Generate questions (batched, one LLM call)
    questions = llm.generate_questions(enriched_words)

    # Pad if LLM returned fewer questions than words
    while len(questions) < len(enriched_words):
        idx = len(questions)
        w = enriched_words[idx % len(enriched_words)]
        simplified = w.get("simplified", "?")
        meanings = w.get("meanings") or ["something"]
        if isinstance(meanings, str):
            try:
                meanings = json.loads(meanings)
            except Exception:
                meanings = [meanings]
        questions.append({
            "type": "gloss_to_word",
            "prompt": f"What Mandarin word means '{meanings[0] if meanings else simplified}'?",
            "target_word": simplified,
            "context": meanings[0] if meanings else "",
        })

    now = time.time()
    config = {"kind": kind, "size": len(enriched_words), "level": level}

    with transaction() as conn:
        cur = conn.execute("""
            INSERT INTO sessions (kind, status, created_at, cursor, config_json)
            VALUES (?, 'in_progress', ?, 0, ?)
        """, (kind, now, jdump(config)))
        session_id = cur.lastrowid

        item_ids = []
        for i, (w, q) in enumerate(zip(enriched_words, questions)):
            cur2 = conn.execute("""
                INSERT INTO session_items
                    (session_id, order_index, word_id, question_json)
                VALUES (?, ?, ?, ?)
            """, (session_id, i, w["id"], jdump(q)))
            item_ids.append(cur2.lastrowid)
            ensure_srs_state(w["id"])

    items = []
    for i, (w, q, item_id) in enumerate(zip(enriched_words, questions, item_ids)):
        items.append({
            "item_id": item_id,
            "order_index": i,
            "word": _word_row_to_dict(w),
            "lesson_card": jload(w.get("lesson_card_json")),
            "question_json": q,
            "user_answer": None,
            "grader_output_json": None,
            "outcome": None,
        })

    return {
        "session_id": session_id,
        "kind": kind,
        "status": "in_progress",
        "cursor": 0,
        "items": items,
    }


def start_session(kind: str = "mixed", size: int = DEFAULT_SESSION_SIZE) -> dict:
    """Pick words by `kind`, then build a session."""
    level = get_user_profile().get("current_hsk_level", START_HSK_LEVEL)

    if kind == "new_drop":
        words = get_unseen_words(size, level)
    elif kind == "review":
        words = get_due_words(size, level)
    else:  # mixed
        words = get_mixed_words(size)

    if not words:
        words = get_unseen_words(size)  # fallback: unseen from any level

    return _create_session(words, kind, level)


def start_session_with_words(word_ids: list[int], kind: str = "custom") -> dict:
    """Build a session from an explicit list of word ids (bank + new HSK words)."""
    if not word_ids:
        raise RuntimeError("No words selected for the session.")
    level = get_user_profile().get("current_hsk_level", START_HSK_LEVEL)

    # Preserve the given order; load each word row.
    words = []
    for wid in word_ids:
        row = fetchone("SELECT * FROM words WHERE id = ?", (wid,))
        if row:
            words.append(dict(row))
    return _create_session(words, kind, level)


# ---------------------------------------------------------------------------
# grade_answer
# ---------------------------------------------------------------------------

def record_study_activity() -> None:
    """
    Update the daily study streak. Called whenever the user studies.

    - same day as last_study_date  → no change
    - exactly the previous day     → streak += 1
    - any larger gap (or first time)→ streak reset to 1
    """
    from datetime import date, timedelta

    profile = get_user_profile()
    today = date.today()
    last_str = profile.get("last_study_date")

    if last_str == today.isoformat():
        return  # already counted today

    streak = profile.get("study_streak_days", 0) or 0
    last = None
    if last_str:
        try:
            last = date.fromisoformat(last_str)
        except ValueError:
            last = None

    if last is not None and last == today - timedelta(days=1):
        streak += 1
    else:
        streak = 1

    update_user_profile(study_streak_days=streak, last_study_date=today.isoformat())


def grade_answer(
    session_item_id: int,
    answer: str,
    response_time_ms: int,
    hesitated: bool = False,
) -> dict:
    """
    Grade answer, persist to DB, advance cursor, update SRS.
    Returns {grader_output, srs_summary, session_complete}.
    """
    # Load the item
    item = fetchone("SELECT * FROM session_items WHERE id = ?", (session_item_id,))
    if not item:
        raise ValueError(f"session_item {session_item_id} not found")

    word_id = item["word_id"]
    session_id = item["session_id"]
    question = jload(item["question_json"])

    # Grade
    grader_out = grade_answer_with_cache(word_id, question, answer)

    # Determine outcome
    over_timer = response_time_ms > 20_000
    if hesitated:
        outcome = "hesitated"
    elif grader_out.get("correct"):
        outcome = "correct"
    else:
        outcome = "wrong"

    # Persist item
    with transaction() as conn:
        conn.execute("""
            UPDATE session_items
            SET user_answer = ?, grader_output_json = ?,
                response_time_ms = ?, outcome = ?
            WHERE id = ?
        """, (answer, jdump(grader_out), response_time_ms, outcome, session_item_id))

    # Advance cursor
    session = fetchone("SELECT * FROM sessions WHERE id = ?", (session_id,))
    new_cursor = session["cursor"] + 1
    total_items = fetchone(
        "SELECT COUNT(*) AS cnt FROM session_items WHERE session_id = ?",
        (session_id,),
    )["cnt"]

    session_complete = new_cursor >= total_items

    with transaction() as conn:
        if session_complete:
            conn.execute("""
                UPDATE sessions
                SET cursor = ?, status = 'completed', completed_at = ?
                WHERE id = ?
            """, (new_cursor, time.time(), session_id))
        else:
            conn.execute(
                "UPDATE sessions SET cursor = ? WHERE id = ?",
                (new_cursor, session_id),
            )

    # Update SRS
    srs = update_srs(word_id, outcome, over_timer=over_timer, hesitated=hesitated)

    # Record daily study streak
    record_study_activity()

    return {
        "grader_output": grader_out,
        "srs_summary": srs,
        "session_complete": session_complete,
        "outcome": outcome,
        "new_cursor": new_cursor,
    }


# ---------------------------------------------------------------------------
# load_session
# ---------------------------------------------------------------------------

def load_session(session_id: int) -> dict:
    """
    Load a session + all items (with saved answers/grading) + cursor.
    """
    session = fetchone("SELECT * FROM sessions WHERE id = ?", (session_id,))
    if not session:
        raise ValueError(f"Session {session_id} not found")

    items_rows = fetchall("""
        SELECT si.*, w.simplified, w.traditional, w.pinyin,
               w.hsk_level, w.pos, w.meanings, w.lesson_card_json, w.frequency_rank
        FROM session_items si
        JOIN words w ON w.id = si.word_id
        WHERE si.session_id = ?
        ORDER BY si.order_index ASC
    """, (session_id,))

    items = []
    for row in items_rows:
        d = dict(row)
        for field in ("pos", "meanings"):
            if isinstance(d.get(field), str):
                try:
                    d[field] = json.loads(d[field])
                except Exception:
                    pass
        items.append({
            "item_id": d["id"],
            "order_index": d["order_index"],
            "word": {
                "id": d["word_id"],
                "simplified": d["simplified"],
                "traditional": d["traditional"],
                "pinyin": d["pinyin"],
                "hsk_level": d["hsk_level"],
                "pos": d["pos"],
                "meanings": d["meanings"],
                "frequency_rank": d["frequency_rank"],
            },
            "lesson_card": jload(d.get("lesson_card_json")),
            "question_json": jload(d["question_json"]),
            "user_answer": d["user_answer"],
            "grader_output_json": jload(d.get("grader_output_json")),
            "response_time_ms": d["response_time_ms"],
            "outcome": d["outcome"],
        })

    s = dict(session)
    return {
        "session_id": session_id,
        "kind": s["kind"],
        "status": s["status"],
        "created_at": s["created_at"],
        "completed_at": s.get("completed_at"),
        "cursor": s["cursor"],
        "parent_session_id": s.get("parent_session_id"),
        "config": jload(s.get("config_json")),
        "items": items,
    }


# ---------------------------------------------------------------------------
# list_sessions
# ---------------------------------------------------------------------------

def list_sessions(limit: int = 50) -> list[dict]:
    """Return recent sessions with basic stats."""
    rows = fetchall("""
        SELECT * FROM sessions
        ORDER BY created_at DESC
        LIMIT ?
    """, (limit,))

    result = []
    for row in rows:
        s = dict(row)
        correct, answered = _session_score(s["id"])
        total = fetchone(
            "SELECT COUNT(*) AS cnt FROM session_items WHERE session_id = ?",
            (s["id"],),
        )["cnt"]
        result.append({
            "id": s["id"],
            "kind": s["kind"],
            "status": s["status"],
            "created_at": s["created_at"],
            "completed_at": s.get("completed_at"),
            "cursor": s["cursor"],
            "size": total,
            "answered": answered,
            "correct": correct,
            "score": f"{correct}/{answered}" if answered else "0/0",
        })
    return result


# ---------------------------------------------------------------------------
# redrill_session
# ---------------------------------------------------------------------------

def redrill_session(
    session_id: int,
    with_variation: bool = False,
    affect_srs: bool = False,
) -> dict:
    """
    Clone a completed session into a new redrill session.
    Default: reuse saved questions (no LLM). with_variation=True regenerates prompts.
    """
    from learner import llm

    orig = load_session(session_id)
    if orig["status"] != "completed":
        raise ValueError(f"Session {session_id} is not completed (status={orig['status']})")

    orig_items = orig["items"]
    now = time.time()

    if with_variation:
        # Regenerate questions (one LLM call)
        words_for_llm = [item["word"] for item in orig_items]
        new_questions = llm.generate_questions(words_for_llm)
        while len(new_questions) < len(orig_items):
            w = orig_items[len(new_questions) % len(orig_items)]["word"]
            meanings = w.get("meanings") or ["something"]
            new_questions.append({
                "type": "gloss_to_word",
                "prompt": f"What Mandarin word means '{meanings[0] if meanings else w['simplified']}'?",
                "target_word": w["simplified"],
                "context": meanings[0] if meanings else "",
            })
    else:
        new_questions = [item["question_json"] for item in orig_items]

    config = {"kind": "redrill", "parent": session_id, "with_variation": with_variation}

    with transaction() as conn:
        cur = conn.execute("""
            INSERT INTO sessions
                (kind, status, created_at, cursor, parent_session_id, config_json)
            VALUES ('redrill', 'in_progress', ?, 0, ?, ?)
        """, (now, session_id, jdump(config)))
        new_session_id = cur.lastrowid

        item_ids = []
        for i, (orig_item, q) in enumerate(zip(orig_items, new_questions)):
            cur2 = conn.execute("""
                INSERT INTO session_items
                    (session_id, order_index, word_id, question_json)
                VALUES (?, ?, ?, ?)
            """, (new_session_id, i, orig_item["word"]["id"], jdump(q)))
            item_ids.append(cur2.lastrowid)

    # Build payload
    items = []
    for i, (orig_item, q, item_id) in enumerate(zip(orig_items, new_questions, item_ids)):
        items.append({
            "item_id": item_id,
            "order_index": i,
            "word": orig_item["word"],
            "lesson_card": orig_item.get("lesson_card"),
            "question_json": q,
            "user_answer": None,
            "grader_output_json": None,
            "outcome": None,
        })

    return {
        "session_id": new_session_id,
        "kind": "redrill",
        "status": "in_progress",
        "cursor": 0,
        "parent_session_id": session_id,
        "items": items,
    }


# ---------------------------------------------------------------------------
# due_reviews
# ---------------------------------------------------------------------------

def due_reviews() -> dict:
    """Return count + preview of due SRS items."""
    cnt = count_due()
    now = time.time()
    rows = fetchall("""
        SELECT w.simplified, w.pinyin, s.box, s.wrong_count
        FROM srs_state s
        JOIN words w ON w.id = s.word_id
        WHERE s.next_review_at <= ? AND s.mastered = 0
        ORDER BY s.next_review_at ASC
        LIMIT 5
    """, (now,))
    return {
        "count": cnt,
        "words": [dict(r) for r in rows],
    }


# ---------------------------------------------------------------------------
# get_stats
# ---------------------------------------------------------------------------

def get_stats() -> dict:
    """Mastery, weakest words, progression toward next level."""
    profile = get_user_profile()
    level = profile.get("current_hsk_level", START_HSK_LEVEL)

    total_row = fetchone("SELECT COUNT(*) AS cnt FROM words WHERE hsk_level = ?", (level,))
    mastered_row = fetchone("""
        SELECT COUNT(*) AS cnt FROM words w
        JOIN srs_state s ON s.word_id = w.id
        WHERE w.hsk_level = ? AND s.mastered = 1
    """, (level,))

    total = total_row["cnt"] if total_row else 0
    mastered = mastered_row["cnt"] if mastered_row else 0

    weakest = fetchall("""
        SELECT w.simplified, w.pinyin, s.box, s.wrong_count, s.correct_count
        FROM srs_state s
        JOIN words w ON w.id = s.word_id
        WHERE w.hsk_level = ?
        ORDER BY s.wrong_count DESC, s.box ASC
        LIMIT 10
    """, (level,))

    can_advance = check_progression(level)

    return {
        "level": level,
        "mastered": mastered,
        "total": total,
        "mastery_pct": round(mastered / total * 100, 1) if total else 0,
        "weakest": [dict(r) for r in weakest],
        "next_level_progress": {
            "can_advance": can_advance,
            "mastered": mastered,
            "total": total,
        },
        "due_count": count_due(),
        "streak_days": profile.get("study_streak_days", 0),
    }


# ---------------------------------------------------------------------------
# resume_or_start
# ---------------------------------------------------------------------------

def get_in_progress_session() -> dict | None:
    """Return the most recent in-progress session, or None."""
    row = fetchone("""
        SELECT id FROM sessions WHERE status = 'in_progress'
        ORDER BY created_at DESC LIMIT 1
    """)
    if row:
        return load_session(row["id"])
    return None


# ---------------------------------------------------------------------------
# Vocabulary bank
# ---------------------------------------------------------------------------

def vocab_count() -> int:
    """Number of words in the user's bank (have an srs_state row)."""
    row = fetchone("SELECT COUNT(*) AS cnt FROM srs_state")
    return row["cnt"] if row else 0


def list_vocabulary() -> list[dict]:
    """
    All words the user has added (have srs_state), with box / mastery / due info.
    Ordered due-first, then lowest box first.
    """
    now = time.time()
    rows = fetchall("""
        SELECT w.id, w.simplified, w.pinyin, w.hsk_level, w.meanings,
               s.box, s.mastered, s.next_review_at,
               s.correct_count, s.wrong_count
        FROM srs_state s
        JOIN words w ON w.id = s.word_id
        ORDER BY (s.next_review_at <= ?) DESC, s.box ASC, w.frequency_rank ASC NULLS LAST
    """, (now,))
    result = []
    for r in rows:
        d = dict(r)
        if isinstance(d.get("meanings"), str):
            try:
                d["meanings"] = json.loads(d["meanings"])
            except Exception:
                d["meanings"] = [d["meanings"]]
        d["due"] = (d["next_review_at"] or 0) <= now and not d["mastered"]
        result.append(d)
    return result


def get_word_card(word_id: int) -> dict:
    """Load a word + its lesson card (generating if missing) + srs state."""
    row = fetchone("SELECT * FROM words WHERE id = ?", (word_id,))
    if not row:
        raise ValueError(f"Word {word_id} not found")
    word = _ensure_lesson_card(dict(row))
    srs = fetchone("SELECT * FROM srs_state WHERE word_id = ?", (word_id,))
    return {
        "word": _word_row_to_dict(word),
        "lesson_card": jload(word.get("lesson_card_json")),
        "srs": dict(srs) if srs else None,
    }


def add_words_to_bank(count: int = 1) -> list[dict]:
    """
    Add the next `count` most-frequent unseen words at the current level to the
    bank: generate their lesson cards and seed srs_state. Returns the added words.
    """
    level = get_user_profile().get("current_hsk_level", START_HSK_LEVEL)
    words = get_unseen_words(count, level)
    if not words:
        words = get_unseen_words(count)  # fallback: any level
    added = []
    for w in words:
        w = _ensure_lesson_card(w)
        ensure_srs_state(w["id"])
        added.append(_word_row_to_dict(w))
    return added


def list_addable_words(size: int = 40) -> list[dict]:
    """Next unseen words (not yet in the bank) for the custom-session 'New words' tab."""
    level = get_user_profile().get("current_hsk_level", START_HSK_LEVEL)
    words = get_unseen_words(size, level)
    if not words:
        words = get_unseen_words(size)
    return [_word_row_to_dict(w) for w in words]
