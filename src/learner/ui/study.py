"""
study.py — session builder + two-phase run view.

Builder (/study, no session_id): pick a quick mode or hand-select words, then start.
Run view (/study?session_id=): LEARN all lesson cards → DRILL all words (timed, graded).
"""
import time
from nicegui import ui, run
from learner.services import (
    load_session, grade_answer, start_session, start_session_with_words,
    list_vocabulary, list_addable_words,
)
from learner.ui.layout import frame
from learner.ui.components import render_lesson_card

TIMER_SECONDS = 120

_TYPE_LABELS = {
    "en_to_zh":        "Translate to Mandarin",
    "cloze":           "Fill in the blank",
    "synonym_discrim": "Synonym discrimination",
    "gloss_to_word":   "Gloss to word",
}


# ---------------------------------------------------------------------------
# Session builder (landing for /study)
# ---------------------------------------------------------------------------

def build_study_builder() -> None:
    with frame("Study", current="/study"):
        with ui.column().classes("items-start w-full mb-5 gap-0"):
            ui.label("Build a session").classes("font-display text-2xl font-semibold ink mb-1")
            ui.label("Pick a quick mode, or hand-select the words you want to study.").classes(
                "muted mb-5"
            )


        # ----- Quick modes -----
        with ui.card().classes("w-full p-5 mb-5 fade-up d1"):
            ui.label("Quick start").classes("section-title mb-3")
            with ui.row().classes("gap-2 flex-wrap"):
                ui.button("Review due", on_click=lambda: _quick_start("review")).classes(
                    "btn-ghost"
                ).props("flat")
                ui.button("+ New words", on_click=lambda: _quick_start("new_drop")).classes(
                    "btn-ghost"
                ).props("flat")
                ui.button("Mixed", on_click=lambda: _quick_start("mixed")).classes(
                    "btn-jade"
                ).props("unelevated")

        # ----- Custom selection -----
        with ui.card().classes("w-full p-5 fade-up d2"):
            ui.label("Custom — choose words").classes("section-title mb-3")
            selected: set[int] = set()

            try:
                bank = list_vocabulary()
            except Exception:
                bank = []
            try:
                new_words = list_addable_words(40)
            except Exception:
                new_words = []

            start_btn = ui.button("Start (Learn → Drill)").classes("btn-jade mt-4").props(
                "unelevated"
            )

            def refresh_btn():
                start_btn.set_text(f"Start (Learn → Drill) · {len(selected)}")
                start_btn.set_enabled(bool(selected))

            def toggle(wid: int, on: bool):
                if on:
                    selected.add(wid)
                else:
                    selected.discard(wid)
                refresh_btn()

            def word_row(w: dict, new: bool):
                with ui.row().classes("items-center gap-3 w-full py-1"):
                    cb = ui.checkbox(on_change=lambda e, _w=w["id"]: toggle(_w, e.value))
                    cb.props("dense").classes("shrink-0")
                    ui.label(w["simplified"]).classes("ink text-lg").style(
                        "font-family: var(--font-hanzi)"
                    )
                    ui.label(w.get("pinyin", "")).classes("pinyin text-sm")
                    meanings = w.get("meanings") or []
                    gloss = ", ".join(str(m) for m in meanings[:2]) if isinstance(meanings, list) else str(meanings)
                    ui.label(gloss).classes("text-xs muted truncate")
                    if new:
                        ui.label("new").classes("pill pill-gold ml-auto")

            with ui.tabs().classes("w-full").props("dense active-color=positive") as tabs:
                tab_bank = ui.tab(f"My bank ({len(bank)})")
                tab_new = ui.tab("New words")
            with ui.tab_panels(tabs, value=tab_bank).classes("w-full").style(
                "background: transparent"
            ):
                with ui.tab_panel(tab_bank):
                    if bank:
                        with ui.column().classes("w-full gap-0 max-h-80 overflow-auto"):
                            for w in bank:
                                word_row(w, new=False)
                    else:
                        ui.label("Your bank is empty — add words from the Vocabulary page.").classes(
                            "faint text-sm"
                        )
                with ui.tab_panel(tab_new):
                    if new_words:
                        with ui.column().classes("w-full gap-0 max-h-80 overflow-auto"):
                            for w in new_words:
                                word_row(w, new=True)
                    else:
                        ui.label("No new words available at this level.").classes("faint text-sm")

            start_btn.on("click", lambda: _custom_start(sorted(selected)))
            refresh_btn()


async def _quick_start(kind: str) -> None:
    n = ui.notification("Preparing session…", spinner=True, timeout=None)
    try:
        sess = await run.io_bound(start_session, kind=kind)
        n.dismiss()
        ui.navigate.to(f"/study?session_id={sess['session_id']}")
    except Exception as e:
        n.dismiss()
        ui.notify(str(e), type="negative")


async def _custom_start(word_ids: list[int]) -> None:
    if not word_ids:
        ui.notify("Select at least one word.", type="warning")
        return
    n = ui.notification("Preparing session…", spinner=True, timeout=None)
    try:
        sess = await run.io_bound(start_session_with_words, word_ids)
        n.dismiss()
        ui.navigate.to(f"/study?session_id={sess['session_id']}")
    except Exception as e:
        n.dismiss()
        ui.notify(str(e), type="negative")


# ---------------------------------------------------------------------------
# Run view
# ---------------------------------------------------------------------------

def _render_feedback(grader_out: dict, outcome: str) -> None:
    correct = grader_out.get("correct", False)
    naturalness = grader_out.get("naturalness", 0)
    feedback = grader_out.get("feedback", "")
    issues = grader_out.get("issues", [])

    accent = "var(--jade)" if correct else "var(--vermillion)"
    label = "Correct" if correct else "Incorrect"
    anim = "pulse-jade" if correct else "shake"

    with ui.card().classes(f"w-full p-5 mt-3 {anim}").style(
        f"border-left: 4px solid {accent} !important"
    ):
        with ui.row().classes("items-center gap-2 mb-2"):
            ui.icon("check_circle" if correct else "cancel").classes("text-xl").style(f"color: {accent}")
            ui.label(label).classes("font-semibold").style(f"color: {accent}")
            ui.label(f"Naturalness: {'★' * naturalness}{'☆' * (5 - naturalness)}").classes(
                "text-sm accent-gold"
            )
        if feedback:
            ui.label(feedback).classes("text-sm ink")
        if issues:
            with ui.row().classes("gap-1 mt-2 flex-wrap"):
                for issue in issues:
                    ui.label(issue).classes("pill pill-gold")


def _phase_header(label: str, value: float) -> None:
    with ui.row().classes("items-center gap-3 mb-5 w-full"):
        ui.label(label).classes("text-sm muted font-mono")
        ui.linear_progress(value=value, show_value=False).classes("flex-1").style("height: 6px")


def build_study(session_data: dict) -> None:
    """Run a session: LEARN all cards, then DRILL all words."""
    items = session_data["items"]
    n = len(items)
    cursor_ref = {"cursor": session_data.get("cursor", 0)}
    # Resume straight into drill if the session already has answered items.
    phase_ref = {"phase": "drill" if cursor_ref["cursor"] > 0 else "learn"}
    learn_ref = {"i": 0}
    start_time_ref = {"t": 0.0}
    timer_ref = {"remaining": TIMER_SECONDS, "over": False}
    active_timer_ref = {"obj": None}

    container = ui.element("div").classes("w-full flex flex-col items-center")

    def enter_drill():
        phase_ref["phase"] = "drill"
        render_current()

    def begin_question():
        start_time_ref["t"] = time.time()
        timer_ref["remaining"] = TIMER_SECONDS
        timer_ref["over"] = False

    def advance(new_cursor: int):
        cursor_ref["cursor"] = new_cursor
        render_current()

    def _cancel_timer():
        if active_timer_ref["obj"] is not None:
            try:
                active_timer_ref["obj"].cancel()
            except Exception:
                pass
            active_timer_ref["obj"] = None

    def render_current():
        _cancel_timer()
        container.clear()

        with container:
            if phase_ref["phase"] == "learn":
                _render_learn()
            else:
                _render_drill()

    # ---- LEARN phase ----
    def _render_learn():
        i = learn_ref["i"]
        item = items[i]
        _phase_header(f"Learn · card {i + 1} of {n}", (i + 1) / max(n, 1))
        render_lesson_card(item.get("lesson_card") or {}, item["word"])

        with ui.row().classes("gap-2 mt-2 items-center"):
            ui.button("← Prev", on_click=_learn_prev).props("flat").classes("btn-ghost").set_enabled(i > 0)
            if i < n - 1:
                ui.button("Next →", on_click=_learn_next).classes("btn-ghost").props("flat")
                ui.button("Skip to drill →", on_click=enter_drill).classes("btn-jade ml-auto").props("unelevated")
            else:
                ui.button("始 Start drill →", on_click=enter_drill).classes("btn-jade ml-auto").props("unelevated")

    def _learn_prev():
        learn_ref["i"] = max(0, learn_ref["i"] - 1)
        render_current()

    def _learn_next():
        learn_ref["i"] = min(n - 1, learn_ref["i"] + 1)
        render_current()

    # ---- DRILL phase ----
    def _render_drill():
        cursor = cursor_ref["cursor"]
        if cursor >= n:
            with ui.card().classes("w-full p-10 text-center fade-up d1"):
                ui.icon("celebration").classes("text-6xl mb-3").style("color: var(--gold)")
                ui.label("Session complete!").classes("font-display text-3xl font-semibold ink")
                ui.label("Great work — head home to see your results.").classes("muted mb-5 mt-1")
                ui.button("Back to Home", on_click=lambda: ui.navigate.to("/")).classes("btn-jade").props("unelevated")
            return

        item = items[cursor]
        word = item["word"]
        question = item.get("question_json") or {}
        _phase_header(f"Drill · item {cursor + 1} of {n}", cursor / max(n, 1))
        _render_drill_card(item, question, word, cursor)

    def _render_drill_card(item, question, word, cursor):
        qtype = question.get("type", "")
        prompt = question.get("prompt", "")
        begin_question()

        with ui.card().classes("w-full p-7 mb-4 fade-up d1"):
            ui.label(_TYPE_LABELS.get(qtype, qtype)).classes("section-title mb-3")
            ui.label(prompt).classes("text-xl ink mb-5").style("font-family: var(--font-display)")

            timer_label = ui.label(f"⏱ {timer_ref['remaining']}s").classes(
                "text-sm font-mono mb-4"
            ).style("color: var(--gold)")
            feedback_div = ui.element("div")

            answer_input = ui.input(
                placeholder="Type your Mandarin answer…",
            ).classes("w-full answer-input").props("autofocus borderless")

            submitted_ref = {"done": False}

            async def submit(hesitated: bool = False):
                if submitted_ref["done"]:
                    return
                submitted_ref["done"] = True
                _cancel_timer()

                answer = answer_input.value or ""
                elapsed_ms = int((time.time() - start_time_ref["t"]) * 1000)

                n = ui.notification("Grading…", spinner=True, timeout=None)
                try:
                    result = await run.io_bound(
                        grade_answer,
                        session_item_id=item["item_id"],
                        answer=answer,
                        response_time_ms=elapsed_ms,
                        hesitated=hesitated,
                    )
                    n.dismiss()
                except Exception as e:
                    n.dismiss()
                    ui.notify(str(e), type="negative")
                    submitted_ref["done"] = False
                    return

                items[cursor]["user_answer"] = answer
                items[cursor]["outcome"] = result["outcome"]

                feedback_div.clear()
                with feedback_div:
                    _render_feedback(result["grader_output"], result["outcome"])
                    ui.button(
                        "Next →",
                        on_click=lambda: advance(result["new_cursor"]),
                    ).classes("btn-jade mt-3").props("unelevated")

                answer_input.disable()
                submit_btn.disable()
                hesitate_btn.disable()

            answer_input.on("keydown.enter", lambda: submit())

            with ui.row().classes("gap-2 mt-4 items-center"):
                submit_btn = ui.button("Submit", on_click=lambda: submit()).classes("btn-jade").props("unelevated")
                hesitate_btn = ui.button(
                    "I had to think hard",
                    on_click=lambda: submit(hesitated=True),
                ).classes("btn-ghost text-xs").props("flat")

            def tick():
                if submitted_ref["done"]:
                    return
                timer_ref["remaining"] -= 1
                remaining = max(0, timer_ref["remaining"])
                if remaining <= 0:
                    timer_ref["over"] = True
                    timer_label.set_text("⏱ 0s · over time — no promotion")
                    timer_label.classes(add="timer-over")
                    timer_label.style("color: var(--vermillion)")
                else:
                    timer_label.set_text(f"⏱ {remaining}s")
                    timer_label.style(
                        "color: var(--vermillion)" if remaining <= 5 else "color: var(--gold)"
                    )

            active_timer_ref["obj"] = ui.timer(1.0, tick)

    render_current()


def build_study_page(session_id: int) -> None:
    with frame("Study", current="/study"):
        try:
            session_data = load_session(session_id)
        except Exception as e:
            ui.label(f"Error loading session: {e}").classes("accent-vermillion")
            ui.button("Back to Home", on_click=lambda: ui.navigate.to("/"))
            return

        if session_data["status"] == "completed":
            _render_review(session_data)
        else:
            build_study(session_data)


def _render_review(session_data: dict) -> None:
    """Read-only review of a completed session."""
    ui.label("Session Review").classes("font-display text-2xl font-semibold ink mb-4")
    items = session_data.get("items", [])
    color_map = {"correct": "var(--jade)", "wrong": "var(--vermillion)", "hesitated": "var(--gold)"}
    pill_map = {"correct": "pill-jade", "wrong": "pill-red", "hesitated": "pill-gold"}
    for item in items:
        word = item.get("word", {})
        question = item.get("question_json") or {}
        grader = item.get("grader_output_json") or {}
        outcome = item.get("outcome", "")
        user_ans = item.get("user_answer", "")

        border = color_map.get(outcome, "var(--border)")
        pill = pill_map.get(outcome, "pill-muted")

        with ui.card().classes("w-full mb-3 p-4").style(
            f"border-left: 4px solid {border} !important"
        ):
            with ui.row().classes("items-center gap-2 mb-1"):
                ui.label(word.get("simplified", "")).classes("font-bold text-lg ink").style(
                    "font-family: var(--font-hanzi)"
                )
                ui.label(outcome or "unanswered").classes(f"pill {pill}")
            ui.label(question.get("prompt", "")).classes("text-sm muted mb-1")
            if user_ans:
                ui.label(f"Your answer: {user_ans}").classes("text-sm ink")
            if grader.get("feedback"):
                ui.label(grader["feedback"]).classes("text-xs faint italic")
