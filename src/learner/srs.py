"""
srs.py — Leitner 5-box SRS: promote/demote, mastery, selection helpers.
"""
import logging
import time
from typing import Literal

from learner.config import (
    BOX_INTERVALS,
    MASTERY_BOX,
    MASTERY_EXTRA_CORRECT,
    LEAK_PLUGGER_THRESHOLD,
    LOWER_LEVEL_REVIEW_SHARE,
)
from learner.db import get_conn, transaction, fetchall, fetchone

log = logging.getLogger(__name__)

Outcome = Literal["correct", "wrong", "hesitated"]


# ---------------------------------------------------------------------------
# Core SRS update
# ---------------------------------------------------------------------------

def ensure_srs_state(word_id: int) -> None:
    """Create srs_state row for word_id if it doesn't exist."""
    with transaction() as conn:
        conn.execute("""
            INSERT OR IGNORE INTO srs_state (word_id, box, next_review_at)
            VALUES (?, 1, 0)
        """, (word_id,))


def update_srs(
    word_id: int,
    outcome: Outcome,
    over_timer: bool = False,
    hesitated: bool = False,
) -> dict:
    """
    Apply SRS rules for a graded answer. Returns updated srs_state row as dict.

    Rules:
    - correct + on-time → promote (+1 box, up to 5)
    - correct + over_timer OR hesitated → no promotion (stay, update next_review)
    - wrong → demote (−1 box, min 1)
    - wrong_count >= LEAK_PLUGGER_THRESHOLD → force box 1
    - mastered when box == MASTERY_BOX and correct_count (in box5) >= MASTERY_EXTRA_CORRECT
    """
    ensure_srs_state(word_id)
    now = time.time()

    row = fetchone("SELECT * FROM srs_state WHERE word_id = ?", (word_id,))
    box = row["box"]
    correct_count = row["correct_count"]
    wrong_count = row["wrong_count"]
    hesitated_count = row["hesitated_count"]
    mastered = bool(row["mastered"])

    # Determine new counts
    if outcome == "correct" and not hesitated:
        correct_count += 1
    elif outcome == "wrong":
        wrong_count += 1
    elif outcome == "hesitated":
        hesitated_count += 1
        correct_count += 1  # counts as correct, no promotion

    # Determine new box
    no_promote = over_timer or hesitated or (outcome == "hesitated")

    if outcome == "wrong":
        box = max(1, box - 1)
    elif outcome in ("correct", "hesitated") and not no_promote and outcome != "hesitated":
        box = min(5, box + 1)
    # else: stay

    # Leak-plugger
    if wrong_count >= LEAK_PLUGGER_THRESHOLD:
        box = 1

    # Mastery: box 5 + enough correct
    if box == MASTERY_BOX and correct_count >= MASTERY_EXTRA_CORRECT:
        mastered = True
    else:
        mastered = False

    interval = BOX_INTERVALS.get(box, BOX_INTERVALS[5])
    next_review_at = now + interval

    with transaction() as conn:
        conn.execute("""
            UPDATE srs_state
            SET box = ?, next_review_at = ?, correct_count = ?,
                wrong_count = ?, hesitated_count = ?, mastered = ?
            WHERE word_id = ?
        """, (box, next_review_at, correct_count, wrong_count, hesitated_count, int(mastered), word_id))

    return {
        "word_id": word_id,
        "box": box,
        "next_review_at": next_review_at,
        "correct_count": correct_count,
        "wrong_count": wrong_count,
        "hesitated_count": hesitated_count,
        "mastered": mastered,
    }


# ---------------------------------------------------------------------------
# Word selection
# ---------------------------------------------------------------------------

def _current_level() -> int:
    row = fetchone("SELECT current_hsk_level FROM user_profile WHERE id = 1")
    return row["current_hsk_level"] if row else 2


def get_unseen_words(size: int, level: int | None = None) -> list[dict]:
    """
    Return up to `size` words at `level` (or current profile level) that have
    no srs_state row yet — i.e., never introduced.
    Ordered by frequency_rank (ascending = most common first).
    """
    if level is None:
        level = _current_level()
    rows = fetchall("""
        SELECT w.* FROM words w
        LEFT JOIN srs_state s ON s.word_id = w.id
        WHERE w.hsk_level = ? AND s.word_id IS NULL
        ORDER BY w.frequency_rank ASC NULLS LAST, w.id ASC
        LIMIT ?
    """, (level, size))
    return [dict(r) for r in rows]


def get_due_words(size: int, level: int | None = None) -> list[dict]:
    """
    Return up to `size` due SRS items (next_review_at <= now).
    Blends: (1 - LOWER_LEVEL_REVIEW_SHARE) from current level,
    LOWER_LEVEL_REVIEW_SHARE from lower levels when possible.
    """
    now = time.time()
    if level is None:
        level = _current_level()

    lower_size = max(1, int(size * LOWER_LEVEL_REVIEW_SHARE)) if level > 1 else 0
    current_size = size - lower_size

    current = fetchall("""
        SELECT w.* FROM words w
        JOIN srs_state s ON s.word_id = w.id
        WHERE w.hsk_level = ? AND s.next_review_at <= ? AND s.mastered = 0
        ORDER BY s.next_review_at ASC
        LIMIT ?
    """, (level, now, current_size))

    lower = []
    if lower_size > 0:
        lower = fetchall("""
            SELECT w.* FROM words w
            JOIN srs_state s ON s.word_id = w.id
            WHERE w.hsk_level < ? AND s.next_review_at <= ? AND s.mastered = 0
            ORDER BY s.next_review_at ASC
            LIMIT ?
        """, (level, now, lower_size))

    return [dict(r) for r in current] + [dict(r) for r in lower]


def get_mixed_words(size: int) -> list[dict]:
    """Blend: try due reviews first, pad with unseen if short."""
    due = get_due_words(size)
    if len(due) >= size:
        return due[:size]
    remaining = size - len(due)
    unseen = get_unseen_words(remaining)
    return due + unseen


def count_due() -> int:
    """Count SRS items due now."""
    now = time.time()
    row = fetchone("""
        SELECT COUNT(*) AS cnt FROM srs_state
        WHERE next_review_at <= ? AND mastered = 0
    """, (now,))
    return row["cnt"] if row else 0


def check_progression(level: int) -> bool:
    """Return True if the user should advance from `level` to level+1."""
    from learner.config import MASTERY_PERCENT, LEVEL_FLOOR
    total = fetchone("SELECT COUNT(*) AS cnt FROM words WHERE hsk_level = ?", (level,))
    mastered = fetchone("""
        SELECT COUNT(*) AS cnt FROM words w
        JOIN srs_state s ON s.word_id = w.id
        WHERE w.hsk_level = ? AND s.mastered = 1
    """, (level,))

    total_cnt = total["cnt"] if total else 0
    mastered_cnt = mastered["cnt"] if mastered else 0

    if total_cnt == 0:
        return False
    return (mastered_cnt >= LEVEL_FLOOR) and (mastered_cnt / total_cnt >= MASTERY_PERCENT)
