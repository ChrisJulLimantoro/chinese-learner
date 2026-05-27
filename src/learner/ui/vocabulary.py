"""
vocabulary.py — the user's personal word bank.
List view: words you've added (card + SRS memory), grown via the Add buttons.
Detail view (?word=<id>): the full lesson card + SRS status.
"""
from nicegui import ui, run
from learner.services import (
    list_vocabulary, vocab_count, add_words_to_bank, get_word_card,
)
from learner.ui.layout import frame
from learner.ui.components import render_lesson_card

_BOX_DUE_DAYS = {1: "8h", 2: "1d", 3: "3d", 4: "7d", 5: "21d"}


def build_vocabulary(word_id: int | None = None) -> None:
    with frame("Vocabulary", current="/vocabulary"):
        if word_id:
            _render_detail(word_id)
        else:
            _render_list()


def _render_list() -> None:
    try:
        words = list_vocabulary()
        count = vocab_count()
    except Exception as e:
        ui.label(f"Error loading vocabulary: {e}").classes("accent-vermillion")
        return

    with ui.row().classes("items-center justify-between w-full mb-5"):
        with ui.column().classes("gap-0"):
            ui.label("Vocabulary").classes("font-display text-2xl font-semibold ink")
            ui.label(f"{count} words in your bank").classes("text-sm muted")
        with ui.row().classes("gap-2"):
            ui.button("+ Add word", on_click=lambda: _add(1)).classes("btn-ghost").props("flat")
            ui.button("+ Add 5", on_click=lambda: _add(5)).classes("btn-jade").props("unelevated")

    if not words:
        with ui.card().classes("w-full p-8 text-center"):
            ui.label("Your bank is empty.").classes("ink mb-1")
            ui.label("Tap “+ Add 5” to pull in the next most-common words and generate their cards.").classes(
                "muted text-sm"
            )
        return

    with ui.column().classes("w-full gap-2 fade-up d1"):
        for w in words:
            _word_row(w)


def _word_row(w: dict) -> None:
    wid = w["id"]
    with ui.card().classes("w-full px-4 py-3 cursor-pointer").on(
        "click", lambda _id=wid: ui.navigate.to(f"/vocabulary?word={_id}")
    ):
        with ui.row().classes("items-center justify-between w-full"):
            with ui.row().classes("items-center gap-3"):
                ui.label(w["simplified"]).classes("ink text-xl").style("font-family: var(--font-hanzi)")
                ui.label(w.get("pinyin", "")).classes("pinyin text-sm")
                meanings = w.get("meanings") or []
                gloss = ", ".join(str(m) for m in meanings[:2]) if isinstance(meanings, list) else str(meanings)
                ui.label(gloss).classes("text-xs muted")
            with ui.row().classes("items-center gap-2"):
                ui.label(f"HSK {w.get('hsk_level', '?')}").classes("pill pill-muted")
                ui.label(f"Box {w.get('box', 1)}").classes("pill pill-muted")
                if w.get("mastered"):
                    ui.label("mastered").classes("pill pill-jade")
                elif w.get("due"):
                    ui.label("due now").classes("pill pill-red")
                else:
                    ui.label(f"~{_BOX_DUE_DAYS.get(w.get('box', 1), '')}").classes("pill pill-gold")


async def _add(count: int) -> None:
    n = ui.notification(f"Adding {count} word(s)…", spinner=True, timeout=None)
    try:
        added = await run.io_bound(add_words_to_bank, count)
        n.dismiss()
        if added:
            ui.notify(f"Added {len(added)} word(s): " + " ".join(a["simplified"] for a in added),
                      type="positive")
            ui.navigate.to("/vocabulary")
        else:
            ui.notify("No more unseen words available at this level.", type="warning")
    except Exception as e:
        n.dismiss()
        ui.notify(str(e), type="negative")


def _render_detail(word_id: int) -> None:
    try:
        data = get_word_card(word_id)
    except Exception as e:
        ui.label(f"Error: {e}").classes("accent-vermillion")
        ui.button("← Back", on_click=lambda: ui.navigate.to("/vocabulary")).classes("btn-ghost").props("flat")
        return

    with ui.row().classes("w-full max-w-2xl mb-3"):
        ui.button("← Back to bank", on_click=lambda: ui.navigate.to("/vocabulary")).classes(
            "btn-ghost"
        ).props("flat")

    render_lesson_card(data.get("lesson_card") or {}, data["word"])

    srs = data.get("srs")
    if srs:
        with ui.card().classes("w-full max-w-2xl p-4"):
            ui.label("Memory status").classes("section-title mb-2")
            with ui.row().classes("gap-2 flex-wrap"):
                ui.label(f"Box {srs.get('box', 1)}").classes("pill pill-gold")
                ui.label("mastered" if srs.get("mastered") else "learning").classes(
                    "pill pill-jade" if srs.get("mastered") else "pill pill-muted"
                )
                ui.label(f"✓ {srs.get('correct_count', 0)}").classes("pill pill-jade")
                ui.label(f"✗ {srs.get('wrong_count', 0)}").classes("pill pill-red")
