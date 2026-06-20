"""
app.py — NiceGUI entry point.
Page routes: / (home), /study, /sessions, /stats
"""
import logging
import os
import sys

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    stream=sys.stdout,
)
log = logging.getLogger(__name__)

# Bootstrap DB + word bank before any UI import
from learner.db import init_db
from learner.wordbank import ensure_wordbank

log.info("Initialising DB…")
init_db()
log.info("DB ready.")

log.info("Checking word bank…")
ensure_wordbank()
log.info("Word bank ready.")

# Now import NiceGUI
from nicegui import ui

# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@ui.page("/")
def page_home():
    from learner.ui.home import build_home
    build_home()


@ui.page("/study")
def page_study(session_id: int = 0):
    # No session_id → show the session builder (do NOT auto-start a session).
    if not session_id:
        from learner.ui.study import build_study_builder
        build_study_builder()
        return
    from learner.ui.study import build_study_page
    build_study_page(session_id)


@ui.page("/vocabulary")
def page_vocabulary(word: int = 0):
    from learner.ui.vocabulary import build_vocabulary
    build_vocabulary(word_id=word if word else None)


@ui.page("/sessions")
def page_sessions(review: int = 0):
    from learner.ui.sessions import build_sessions
    build_sessions(review_id=review if review else None)


@ui.page("/stats")
def page_stats():
    from learner.ui.stats import build_stats
    build_stats()


# ---------------------------------------------------------------------------
# Run
# ---------------------------------------------------------------------------

if __name__ in ("__main__", "__mp_main__"):
    from learner.config import USE_STUB
    mode = "STUB (offline)" if USE_STUB else "LIVE (OpenRouter)"
    log.info("Starting Chinese Learner in %s mode.", mode)

    reload = os.getenv("RELOAD", "false").strip().lower() in ("1", "true", "yes")
    ui.run(
        title="中文 Learner",
        host="0.0.0.0",
        port=8080,
        reload=reload,
        show=False,
        dark=True,
        favicon="🀄",
    )
