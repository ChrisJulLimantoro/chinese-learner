"""
stats.py — mastery counts, weakest words, progression to next level.
"""
from nicegui import ui
from learner.services import get_stats
from learner.ui.layout import frame
from learner.ui.theme import ACCENT, PALETTE


def build_stats() -> None:
    with frame("Stats", current="/stats"):
        try:
            stats = get_stats()
        except Exception as e:
            ui.label(f"Error loading stats: {e}").classes("text-red-500")
            return

        level = stats.get("level", 2)
        mastered = stats.get("mastered", 0)
        total = stats.get("total", 0)
        pct = stats.get("mastery_pct", 0)
        due = stats.get("due_count", 0)
        streak = stats.get("streak_days", 0)
        weakest = stats.get("weakest", [])
        next_lvl = stats.get("next_level_progress", {})

        jade, gold, vermillion = PALETTE["jade"], PALETTE["gold"], PALETTE["vermillion"]
        # title
        with ui.column().classes("items- w-full mb-5"):
            ui.label("Statistics").classes("font-display text-2xl font-semibold ink")
        
        # Overview cards
        with ui.row().classes("gap-4 mb-6 flex-wrap w-full"):
            for i, (label, value, color) in enumerate([
                ("Current level", f"HSK {level}", jade),
                ("Mastered",      f"{mastered} / {total}", jade),
                ("Mastery %",     f"{pct}%", gold),
                ("Due reviews",   str(due), vermillion),
                ("Streak",        f"{streak}d", gold),
            ]):
                with ui.element("div").classes(f"stat-card fade-up d{min(i + 1, 5)} flex-1"):
                    ui.label(value).classes("stat-num").style(f"color: {color}")
                    ui.label(label).classes("text-xs muted mt-1")

        # Progression
        with ui.card().classes("w-full mb-6 p-5"):
            ui.label(f"Progression to HSK {level + 1}").classes("font-display font-semibold ink mb-3")
            pct_val = mastered / total if total else 0
            ui.linear_progress(value=pct_val, show_value=False).style("height: 6px")
            ui.label(f"{mastered} / {total} words mastered at this level").classes("text-sm muted mt-2")

            if next_lvl.get("can_advance"):
                ui.label("Ready to advance to the next level!").classes("text-sm accent-jade font-medium mt-2")
            else:
                from learner.config import LEVEL_FLOOR, MASTERY_PERCENT
                remaining_pct = max(0, int(total * MASTERY_PERCENT) - mastered)
                remaining_floor = max(0, LEVEL_FLOOR - mastered)
                remaining = max(remaining_pct, remaining_floor)
                if remaining > 0:
                    ui.label(f"{remaining} more words to master before advancing.").classes("text-xs faint mt-2")

        # Weakest words
        if weakest:
            with ui.row().classes("items-center justify-between w-full mb-3 mt-5"):
                ui.label("Weakest words").classes("font-display text-lg font-semibold ink mt-2")
            with ui.element("div").classes("w-full"):
                for w in weakest:
                    with ui.card().classes("w-full mb-2 p-3 flex flex-row items-center justify-between"):
                        with ui.row().classes("items-center gap-3"):
                            ui.label(w.get("simplified", "")).classes("font-bold text-lg ink").style(
                                "font-family: var(--font-hanzi)"
                            )
                            ui.label(w.get("pinyin", "")).classes("text-sm pinyin")
                            ui.label(f"Box {w.get('box', 1)}").classes("pill pill-muted")
                        with ui.row().classes("gap-3 text-xs"):
                            ui.label(f"Wrong: {w.get('wrong_count', 0)}").classes("accent-vermillion")
                            ui.label(f"Correct: {w.get('correct_count', 0)}").classes("accent-jade")
        else:
            ui.label("No words studied yet.").classes("faint text-sm")
