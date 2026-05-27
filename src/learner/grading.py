"""
grading.py — normalize → accepted_answers cache → escalate to llm.grade.
Local-grade-first / escalate-on-novelty per spec §5.
"""
import json
import logging
import re

from learner.db import get_conn, transaction, fetchone, fetchall, jdump, jload

log = logging.getLogger(__name__)

# Punctuation to strip when normalizing
_PUNCT = re.compile(r"[。，、！？,.!?；;：:「」『』【】《》\s]+")


def normalize(answer: str) -> str:
    """Trim and strip punctuation from a Mandarin answer."""
    return _PUNCT.sub("", answer.strip()).lower()


def check_cache(word_id: int, question_type: str | None, normalized: str) -> dict | None:
    """
    Look up `normalized` in accepted_answers for (word_id, question_type).
    Returns the verdict dict if found, else None.
    """
    row = fetchone("""
        SELECT verdict FROM accepted_answers
        WHERE word_id = ?
          AND (question_type = ? OR question_type IS NULL)
          AND normalized_answer = ?
        LIMIT 1
    """, (word_id, question_type, normalized))
    if row:
        return jload(row["verdict"])
    return None


def store_cache(word_id: int, question_type: str | None, normalized: str, verdict: dict) -> None:
    """Store a grader verdict in accepted_answers."""
    with transaction() as conn:
        conn.execute("""
            INSERT OR REPLACE INTO accepted_answers
                (word_id, question_type, normalized_answer, verdict)
            VALUES (?, ?, ?, ?)
        """, (word_id, question_type, normalized, jdump(verdict)))


def grade_answer_with_cache(
    word_id: int,
    question: dict,
    answer: str,
) -> dict:
    """
    Grade an answer for a question, using cache first, LLM on novelty.

    Returns grader_output_json dict.
    """
    from learner import llm  # late import to avoid circular
    qtype = question.get("type")
    normalized = normalize(answer)

    # 1. Check cache
    cached = check_cache(word_id, qtype, normalized)
    if cached is not None:
        log.debug("Cache hit for word_id=%d, norm=%r", word_id, normalized)
        return cached

    # 2. Escalate to LLM
    log.debug("Cache miss for word_id=%d — calling LLM grader", word_id)
    result = llm.grade(question, answer)

    # Ensure normalized_answer is set
    if not result.get("normalized_answer"):
        result["normalized_answer"] = normalized

    # 3. Store in cache if grader approves
    if result.get("accept_for_cache", False):
        store_cache(word_id, qtype, normalized, result)

    return result
