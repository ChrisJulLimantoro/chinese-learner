"""
components.py — shared UI building blocks reused across pages.
"""
import json
from nicegui import ui


def render_lesson_card(card: dict, word: dict) -> None:
    """Render a rich lesson card (learning material) — used by study + vocabulary."""
    card = card or {}
    simplified = card.get("simplified") or word.get("simplified", "?")
    pinyin = card.get("pinyin_marked") or word.get("pinyin", "")
    meanings = card.get("core_meanings") or word.get("meanings") or []
    if isinstance(meanings, str):
        try:
            meanings = json.loads(meanings)
        except Exception:
            meanings = [meanings]
    pos = card.get("pos") or word.get("pos") or []
    if isinstance(pos, str):
        try:
            pos = json.loads(pos)
        except Exception:
            pos = [pos]

    with ui.card().classes("w-full max-w-2xl p-8 mb-4 fade-up d1"):
        # Headword
        ui.label(simplified).classes("headword text-7xl font-semibold text-center mb-3")
        ui.label(pinyin).classes("pinyin text-2xl text-center mb-1")
        if pos:
            ui.label(f"({', '.join(str(p) for p in pos)})").classes("text-sm text-center faint mb-2")
        ui.label(", ".join(str(m) for m in meanings)).classes("text-lg text-center ink mb-5")

        ui.separator()

        # Examples
        examples = card.get("examples", [])
        if examples:
            ui.label("Examples").classes("section-title mt-4 mb-2")
            for ex in examples:
                with ui.element("div").classes("mb-3 surface-flat px-3 py-2"):
                    ui.label(ex.get("hanzi", "")).classes("text-base ink").style("font-family: var(--font-hanzi)")
                    ui.label(ex.get("pinyin", "")).classes("text-sm pinyin")
                    ui.label(ex.get("gloss", "")).classes("text-sm muted italic")

        # Near synonyms
        synonyms = card.get("near_synonyms", [])
        if synonyms:
            ui.separator().classes("my-4")
            ui.label("Near synonyms").classes("section-title mb-2")
            for syn in synonyms:
                word_text = syn.get("word", "")
                pinyin_text = syn.get("pinyin", "")
                distinction = syn.get("distinction", "")
                ui.label(f"≈ {word_text} ({pinyin_text})").classes("text-sm font-medium accent-gold")
                if distinction:
                    ui.label(distinction).classes("text-xs muted mb-1")

        # Common mistakes
        mistakes = card.get("common_mistakes", [])
        if mistakes:
            ui.separator().classes("my-4")
            ui.label("Common mistakes").classes("section-title mb-2")
            for m in mistakes:
                with ui.row().classes("gap-2 items-start mb-1"):
                    ui.label("!").classes("text-xs accent-vermillion font-bold mt-0.5")
                    ui.label(str(m)).classes("text-xs muted")

        # Nuance
        nuance = card.get("nuance", "")
        if nuance and not nuance.startswith("[STUB]"):
            ui.separator().classes("my-4")
            ui.label("Nuance").classes("section-title mb-1")
            ui.label(nuance).classes("text-sm muted italic")
