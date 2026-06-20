"""
sessions.py — session list with status badges + Resume/Re-drill/Review actions.
"""
from datetime import datetime
from nicegui import ui, run
from learner.services import list_sessions, redrill_session, load_session
from learner.ui.layout import frame


def _fmt_time(ts: float | None) -> str:
    if not ts:
        return ""
    return datetime.fromtimestamp(ts).strftime("%b %d %Y, %H:%M")


def _status_badge(status: str) -> None:
    styles = {
        "in_progress": ("pill-gold", "in progress"),
        "completed":   ("pill-jade", "completed"),
        "abandoned":   ("pill-muted", "abandoned"),
        "redrill":     ("pill-jade", "re-drill"),
    }
    cls, label = styles.get(status, ("pill-muted", status))
    ui.label(label).classes(f"pill {cls}")


def build_sessions(review_id: int | None = None) -> None:
    with frame("Sessions", current="/sessions"):
        # If a review_id is in the URL, show that session's review
        if review_id is not None:
            _render_review_page(review_id)
            return

        with ui.row().classes("items-center justify-between w-full mb-4"):
            ui.label("All Sessions").classes("font-display text-2xl font-semibold ink")

        try:
            sessions = list_sessions(50)
        except Exception as e:
            ui.label(f"Error: {e}").classes("accent-vermillion")
            return

        if not sessions:
            ui.label("No sessions yet.").classes("faint")
            return

        for s in sessions:
            _session_card(s)


def _session_card(s: dict) -> None:
    sid = s["id"]
    with ui.card().classes("w-full mb-3 p-4"):
        with ui.row().classes("items-center justify-between w-full"):
            # Left: badges + info
            with ui.column().classes("gap-1"):
                with ui.row().classes("items-center gap-2"):
                    _status_badge(s["status"])
                    ui.label(s["kind"]).classes("text-sm font-medium ink capitalize")
                with ui.row().classes("items-center gap-3 text-xs faint"):
                    ui.label(f"Score: {s['score']}")
                    ui.label(f"Created: {_fmt_time(s.get('created_at'))}")
                    if s.get("completed_at"):
                        ui.label(f"Completed: {_fmt_time(s['completed_at'])}")

            # Right: actions
            with ui.row().classes("gap-1"):
                if s["status"] == "in_progress":
                    ui.button(
                        "Resume",
                        on_click=lambda _sid=sid: ui.navigate.to(f"/study?session_id={_sid}"),
                    ).props("flat size=sm").classes("accent-jade")

                elif s["status"] == "completed":
                    ui.button(
                        "Re-drill",
                        on_click=lambda _sid=sid: _do_redrill(_sid),
                    ).props("flat size=sm").classes("muted")
                    ui.button(
                        "Review",
                        on_click=lambda _sid=sid: ui.navigate.to(f"/sessions?review={_sid}"),
                    ).props("flat size=sm").classes("accent-gold")


async def _do_redrill(session_id: int) -> None:
    n = ui.notification("Preparing session…", spinner=True, timeout=None)
    try:
        new_sess = await run.io_bound(redrill_session, session_id)
        n.dismiss()
        ui.navigate.to(f"/study?session_id={new_sess['session_id']}")
    except Exception as e:
        n.dismiss()
        ui.notify(str(e), type="negative")


def _render_review_page(session_id: int) -> None:
    """Inline read-only review of a session's items."""
    try:
        sess = load_session(session_id)
    except Exception as e:
        ui.label(f"Error: {e}").classes("accent-vermillion")
        return

    ui.label(f"Review — Session #{session_id}").classes("font-display text-2xl font-semibold ink mb-4")
    with ui.row().classes("gap-2 mb-4"):
        ui.label(f"Kind: {sess['kind']}").classes("text-sm muted")
        ui.label(f"Status: {sess['status']}").classes("text-sm muted")

    items = sess.get("items", [])
    if not items:
        ui.label("No items in this session.").classes("faint")
        return

    color_map = {"correct": "var(--jade)", "wrong": "var(--vermillion)", "hesitated": "var(--gold)"}
    pill_map = {"correct": "pill-jade", "wrong": "pill-red", "hesitated": "pill-gold"}
    for item in items:
        word = item.get("word", {})
        question = item.get("question_json") or {}
        grader = item.get("grader_output_json") or {}
        outcome = item.get("outcome", "")
        user_ans = item.get("user_answer") or ""
        rt = item.get("response_time_ms")

        border_color = color_map.get(outcome, "var(--border)")
        pill = pill_map.get(outcome, "pill-muted")

        with ui.card().classes("w-full max-w-2xl mb-3 p-4").style(
            f"border-left: 4px solid {border_color} !important"
        ):
            with ui.row().classes("items-center gap-2 mb-1 flex-wrap"):
                ui.label(word.get("simplified", "")).classes("font-bold text-lg ink").style(
                    "font-family: var(--font-hanzi)"
                )
                ui.label(word.get("pinyin", "")).classes("text-sm pinyin")
                ui.label(outcome or "unanswered").classes(f"pill {pill}")
                if rt:
                    ui.label(f"{rt / 1000:.1f}s").classes("text-xs faint font-mono")

            ui.label(f"Q: {question.get('prompt', '')}").classes("text-sm muted mb-1")

            if user_ans:
                ui.label(f"Your answer: {user_ans}").classes("text-sm ink")

            if grader.get("correct") and grader.get("normalized_answer"):
                ui.label(f"Accepted: {grader['normalized_answer']}").classes("text-xs faint")

            if grader.get("feedback"):
                ui.label(grader["feedback"]).classes("text-xs muted italic mt-1")

            if grader.get("issues"):
                with ui.row().classes("gap-1 mt-2 flex-wrap"):
                    for issue in grader["issues"]:
                        ui.label(issue).classes("pill pill-gold")
