"""
wordbank.py — fetch complete.json from drkameleon/complete-hsk-vocabulary,
parse HSK 2.0 (old-1..old-6) entries, import into `words` table.
Run only if `words` table is empty.

Actual JSON structure (confirmed from repo):
  {
    "simplified": "阿姨",
    "radical": "阝",
    "level": ["newest-3", "new-4", "old-3"],
    "frequency": 4355,
    "pos": ["n"],
    "forms": [{
      "traditional": "阿姨",
      "transcriptions": {
        "pinyin": "ā yí",
        "numeric": "a1 yi2", ...
      },
      "meanings": ["maternal aunt", ...],
      "classifiers": ["个"]
    }]
  }
"""
import logging

import httpx

from learner.config import WORDBANK_URL_MASTER, WORDBANK_URL_MAIN
from learner.db import transaction, jdump, words_table_empty

log = logging.getLogger(__name__)


def _fetch_raw() -> list[dict]:
    """Fetch complete.json, trying master branch first, then main."""
    for url in (WORDBANK_URL_MASTER, WORDBANK_URL_MAIN):
        try:
            log.info("Fetching word bank from %s", url)
            resp = httpx.get(url, timeout=60, follow_redirects=True)
            resp.raise_for_status()
            return resp.json()
        except Exception as exc:
            log.warning("Failed to fetch from %s: %s", url, exc)
    raise RuntimeError("Could not fetch word bank from either URL")


def _parse_level(levels: list[str]) -> int | None:
    """Return the first old-N level as an integer 1–6, or None."""
    for lv in (levels or []):
        if lv.startswith("old-"):
            try:
                n = int(lv.split("-")[1])
                if 1 <= n <= 6:
                    return n
            except (IndexError, ValueError):
                pass
    return None


def import_wordbank() -> int:
    """Import HSK 2.0 words into `words`. Returns number of rows inserted."""
    if not words_table_empty():
        log.info("Word bank already imported; skipping.")
        return 0

    log.info("Word bank table empty — importing…")
    raw = _fetch_raw()

    rows = []
    for entry in raw:
        level = _parse_level(entry.get("level", []))
        if level is None:
            continue  # skip non-HSK-2.0 entries

        simplified: str = entry.get("simplified", "").strip()
        if not simplified:
            continue

        forms = entry.get("forms", [])
        first_form = forms[0] if forms else {}

        traditional = (first_form.get("traditional") or "").strip() or None
        if traditional == simplified:
            traditional = None  # skip if identical

        # Transcriptions are in a nested dict
        transcriptions = first_form.get("transcriptions", {})
        pinyin = transcriptions.get("pinyin", "").strip() or simplified

        meanings_raw = first_form.get("meanings", [])
        meanings: list[str] = [str(m).strip() for m in meanings_raw if m]

        classifiers = first_form.get("classifiers", [])
        measure_word = None
        if classifiers:
            mw_entry = classifiers[0]
            if isinstance(mw_entry, dict):
                measure_word = {"mw": mw_entry.get("simplified", str(mw_entry)), "pinyin": ""}
            elif isinstance(mw_entry, str):
                measure_word = {"mw": mw_entry, "pinyin": ""}

        pos_raw = entry.get("pos", [])
        pos: list[str] = [str(p).strip() for p in pos_raw if p]

        freq_rank: int | None = entry.get("frequency")

        rows.append((
            simplified,
            traditional,
            pinyin,
            level,
            freq_rank,
            jdump(pos),
            jdump(meanings),
            jdump(measure_word),
        ))

    with transaction() as conn:
        conn.executemany("""
            INSERT INTO words
                (simplified, traditional, pinyin, hsk_level, frequency_rank, pos, meanings, measure_word)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, rows)

    log.info("Imported %d words into word bank.", len(rows))
    return len(rows)


def ensure_wordbank() -> None:
    """Called at app startup: import if empty."""
    import_wordbank()
