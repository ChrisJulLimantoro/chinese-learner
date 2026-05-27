"""
layout.py — shared frame: persistent left_drawer sidebar + header.
All pages call layout.frame() as a context manager.
"""
from contextlib import contextmanager
from nicegui import ui
from learner.services import get_stats, due_reviews
from learner.ui.theme import inject_theme, ACCENT, PALETTE

SIDEBAR_W = 240
HEADER_H = 60


def _nav_link(label: str, path: str, active: bool) -> None:
    cls = "nav-link active" if active else "nav-link"
    ui.link(label, path).classes(f"{cls} w-full")


def _sidebar(current: str) -> None:
    """Render the persistent left drawer."""
    # Set the Quasar `width` prop (not just CSS) so the layout reserves exactly
    # SIDEBAR_W for the page content — otherwise Quasar reserves its 300px default.
    with ui.left_drawer(fixed=True).props(f"width={SIDEBAR_W}").style(
        f"padding: 0; top: {HEADER_H}px;"
    ):
        # Brand
        with ui.element("div").classes("px-5 py-6 w-full").style("border-bottom: 1px solid var(--border)"):
            ui.label("汉 Learner").classes("font-display text-2xl font-semibold").style(
                "color: var(--ink); letter-spacing: -0.01em;"
            )
            ui.label("HSK Vocabulary Drill").classes("text-xs faint mt-1").style("letter-spacing: 0.06em")

        # Nav links
        with ui.element("div").classes("px-3 py-4 w-full").style("border-bottom: 1px solid var(--border)"):
            ui.label("NAVIGATION").classes("section-title px-2 mb-3")
            with ui.column().classes("gap-1 w-full"):
                _nav_link("Home", "/", current == "/")
                _nav_link("Vocabulary", "/vocabulary", current == "/vocabulary")
                _nav_link("Study", "/study", current == "/study")
                _nav_link("Sessions", "/sessions", current == "/sessions")
                _nav_link("Stats", "/stats", current == "/stats")

        # Level + progress
        try:
            stats = get_stats()
            level = stats.get("level", 2)
            mastered = stats.get("mastered", 0)
            total = stats.get("total", 1) or 1
            pct = mastered / total
            streak = stats.get("streak_days", 0)
        except Exception:
            level, mastered, total, pct, streak = 2, 0, 1, 0.0, 0

        with ui.element("div").classes("px-5 py-5 w-full").style("border-bottom: 1px solid var(--border)"):
            with ui.row().classes("items-center justify-between w-full"):
                ui.label("Level").classes("section-title")
                ui.label(f"HSK {level}").classes("pill pill-gold")
            ui.linear_progress(value=pct, show_value=False).classes("mt-3").style("height: 6px")
            ui.label(f"{mastered} / {total} mastered").classes("text-xs muted mt-2")

        # Due + streak
        try:
            due_info = due_reviews()
            due = due_info["count"]
        except Exception:
            due = 0
        with ui.element("div").classes("px-5 py-5 w-full"):
            with ui.row().classes("gap-2 w-full flex-wrap"):
                ui.label(f"Due {due}").classes("pill pill-red" if due else "pill pill-muted")
                ui.label(f"Streak {streak}d").classes("pill pill-jade" if streak else "pill pill-muted")


@contextmanager
def frame(title: str = "汉 Learner", current: str = "/"):
    """Context manager that wraps page content in the shared layout."""
    inject_theme()

    _sidebar(current)

    # Content sits below the header and to the right of the sidebar
    with ui.element("div").classes("min-h-screen min-w-full"):
        # content area to the right of the sidebar; px gives equal L/R margin.
        # w-full children (e.g. vocabulary) span fully; max-w-* children stay centered.
        with ui.element("div").classes("px-9 py-7 flex flex-col items-center w-full"):
            yield
