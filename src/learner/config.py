"""
config.py — load .env, define constants, MODEL_BY_PURPOSE, SRS settings.
"""
import os
from pathlib import Path
from dotenv import load_dotenv

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
PROJECT_ROOT = Path(__file__).parent.parent.parent

# ---------------------------------------------------------------------------
# Environment
# ---------------------------------------------------------------------------
load_dotenv(PROJECT_ROOT / ".env")

# DB path is configurable so containers can point it at a mounted directory
# (mounting the directory — not the single file — is required for SQLite WAL,
# whose -wal/-shm sidecars must live next to the db file).
DB_PATH = Path(os.getenv("DB_PATH", str(PROJECT_ROOT / "progress.db")))
DB_PATH.parent.mkdir(parents=True, exist_ok=True)

OPENCODE_API_KEY: str = os.getenv("OPENCODE_API_KEY", "").strip()
USE_STUB: bool = not OPENCODE_API_KEY

# ---------------------------------------------------------------------------
# LLM models (per-purpose, env-overridable)
# ---------------------------------------------------------------------------
_DEFAULT_MODEL = "deepseek-v4-flash-free"

MODEL_BY_PURPOSE: dict[str, str] = {
    "lesson":   os.getenv("MODEL_LESSON",   _DEFAULT_MODEL),
    "question": os.getenv("MODEL_QUESTION", _DEFAULT_MODEL),
    "grader":   os.getenv("MODEL_GRADER",   _DEFAULT_MODEL),
}

LLM_MAX_TOKENS: int = int(os.getenv("LLM_MAX_TOKENS", "4096"))
LLM_MAX_RETRIES: int = int(os.getenv("LLM_MAX_RETRIES", "3"))

# Per-purpose token budgets (fall back to LLM_MAX_TOKENS). Questions are batched
# across many words, so they need a far larger budget than single-card calls.
MAX_TOKENS_BY_PURPOSE: dict[str, int] = {
    "lesson":   int(os.getenv("LLM_MAX_TOKENS_LESSON",   str(LLM_MAX_TOKENS))),
    "question": int(os.getenv("LLM_MAX_TOKENS_QUESTION", "256000")),
    "grader":   int(os.getenv("LLM_MAX_TOKENS_GRADER",   "16384")),
}

OPENCODE_ZEN_BASE_URL = "https://opencode.ai/zen/v1"

# ---------------------------------------------------------------------------
# SRS constants
# ---------------------------------------------------------------------------
# Box intervals in seconds
BOX_INTERVALS: dict[int, int] = {
    1: 8 * 3600,       # 8 hours
    2: 1 * 86400,      # 1 day
    3: 3 * 86400,      # 3 days
    4: 7 * 86400,      # 7 days
    5: 21 * 86400,     # 21 days
}

MASTERY_BOX = 5
MASTERY_EXTRA_CORRECT = 3       # additional correct answers in box-5 to mark mastered
LEAK_PLUGGER_THRESHOLD = 2      # wrong_count >= N → force back to box 1
MASTERY_PERCENT = 0.95          # 95% of level words mastered to advance
LEVEL_FLOOR = 150               # min mastered words at current level to advance
LOWER_LEVEL_REVIEW_SHARE = 0.30 # 30% of reviews from lower levels
DRILL_TIMER_SECONDS = 120       # soft timer on drill phase

# ---------------------------------------------------------------------------
# Session defaults
# ---------------------------------------------------------------------------
DEFAULT_SESSION_SIZE = 10
MAX_HSK_LEVEL = 6
MIN_HSK_LEVEL = 1
START_HSK_LEVEL = 2

# ---------------------------------------------------------------------------
# Word bank source
# ---------------------------------------------------------------------------
WORDBANK_URL_MASTER = "https://raw.githubusercontent.com/drkameleon/complete-hsk-vocabulary/master/complete.json"
WORDBANK_URL_MAIN   = "https://raw.githubusercontent.com/drkameleon/complete-hsk-vocabulary/main/complete.json"
