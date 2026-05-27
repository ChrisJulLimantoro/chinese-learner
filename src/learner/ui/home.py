"""
home.py — dashboard: resume callout, start session, due reviews, recent sessions.
"""
import time
from datetime import datetime

from nicegui import ui, run
from learner.services import (
    list_sessions, due_reviews, get_in_progress_session,
    start_session, redrill_session,
)
from learner.ui.layout import frame
from learner.ui.theme import ACCENT


def _fmt_time(ts: float | None) -> str:
    if not ts:
        return ""
    return datetime.fromtimestamp(ts).strftime("%b %d, %H:%M")


def _status_badge(status: str) -> None:
    styles = {
        "in_progress": ("pill-gold", "in progress"),
        "completed":   ("pill-jade", "completed"),
        "abandoned":   ("pill-muted", "abandoned"),
        "redrill":     ("pill-jade", "re-drill"),
    }
    cls, label = styles.get(status, ("pill-muted", status))
    ui.label(label).classes(f"pill {cls}")


def build_home() -> None:
    with frame("Home", current="/"):
        # ----- Resume in-progress callout -----
        try:
            inprog = get_in_progress_session()
        except Exception:
            inprog = None

        if inprog:
            with ui.row().classes("items-center justify-between w-full mb-5"):
                with ui.column().classes("gap-0"):
                    ui.label("Home").classes("font-display text-2xl font-semibold ink")
                    
            
            with ui.card().classes("w-full mb-6 p-5 fade-up d1").style(
                "border-left: 4px solid var(--jade) !important"
            ):
                with ui.row().classes("items-center justify-between w-full"):
                    with ui.column().classes("gap-1"):
                        ui.label("Resume in-progress session").classes("font-semibold accent-jade")
                        cursor = inprog.get("cursor", 0)
                        total = len(inprog.get("items", []))
                        kind = inprog.get("kind", "mixed")
                        ui.label(f"HSK {kind} · {cursor}/{total} done").classes("text-sm muted")
                    ui.button(
                        "Resume →",
                        on_click=lambda s=inprog["session_id"]: ui.navigate.to(f"/study?session_id={s}"),
                    ).classes("btn-jade").props("unelevated")

        # ----- Start new session -----
        with ui.card().classes("w-full mb-6 p-5 fade-up d2"):
            ui.label("Start a new session").classes("font-display text-lg font-semibold ink mb-1")
            ui.label("Quick-start a mode, or build a custom session by hand-picking words.").classes(
                "text-sm muted mb-3"
            )
            with ui.row().classes("gap-2 flex-wrap items-center"):
                for kind, label in [
                    ("new_drop", "+ New words"),
                    ("review",   "Review due"),
                    ("mixed",    "Mixed"),
                ]:
                    ui.button(
                        label,
                        on_click=lambda k=kind: _start_new(k),
                    ).classes("btn-ghost text-sm").props("flat")
                ui.button(
                    "Build a session →",
                    on_click=lambda: ui.navigate.to("/study"),
                ).classes("btn-jade ml-auto").props("unelevated")

        # ----- Vocabulary shortcut -----
        with ui.card().classes("w-full mb-6 p-5 fade-up d2 cursor-pointer").on(
            "click", lambda: ui.navigate.to("/vocabulary")
        ):
            with ui.row().classes("items-center justify-between w-full"):
                with ui.column().classes("gap-0"):
                    ui.label("Vocabulary bank").classes("font-display text-lg font-semibold ink")
                    ui.label("Browse your words, view lesson cards, and add new ones.").classes(
                        "text-sm muted"
                    )
                ui.label("Open →").classes("accent-jade")

        # ----- Due reviews -----
        try:
            due_info = due_reviews()
            due_cnt = due_info["count"]
        except Exception:
            due_cnt = 0

        if due_cnt > 0:
            with ui.card().classes("w-full mb-6 p-4 fade-up d3").style(
                "border-left: 4px solid var(--gold) !important"
            ):
                with ui.row().classes("items-center justify-between w-full"):
                    ui.label(f"Due reviews: {due_cnt}").classes("font-medium accent-gold")
                    ui.button(
                        "Review now →",
                        on_click=lambda: _start_new("review"),
                    ).classes("btn-ghost").props("flat")

        # ----- Recent sessions -----
        with ui.row().classes("items-center justify-between w-full mb-3 mt-5"):
            ui.label("Recent sessions").classes("font-display text-lg font-semibold ink mb-3 mt-2")

        try:
            sessions = list_sessions(10)
        except Exception:
            sessions = []

        if not sessions:
            ui.label("No sessions yet. Start one above!").classes("faint text-sm")
        else:
            for s in sessions:
                _session_row(s)


async def _start_new(kind: str) -> None:
    n = ui.notification("Preparing session…", spinner=True, timeout=None)
    try:
        sess = await run.io_bound(start_session, kind=kind)
        n.dismiss()
        ui.navigate.to(f"/study?session_id={sess['session_id']}")
    except Exception as e:
        n.dismiss()
        ui.notify(str(e), type="negative")


def _session_row(s: dict) -> None:
    with ui.card().classes("w-full mb-2 px-4 py-3"):
        with ui.row().classes("items-center justify-between w-full"):
            with ui.row().classes("items-center gap-3"):
                _status_badge(s["status"])
                ui.label(f"HSK {s['kind']}").classes("text-sm font-medium ink")
                ui.label(s["score"]).classes("text-sm muted font-mono")
                ui.label(_fmt_time(s.get("created_at"))).classes("text-xs faint")

            with ui.row().classes("gap-1"):
                sid = s["id"]
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
