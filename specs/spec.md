# Chinese Learning Agent — v1 Spec

Design-level specification for building the app described in `../architecture.md`. This
document fixes the *shapes* — data, session lifecycle, lesson material, question types,
service layer, and UI — without prescribing every line of code. Where it diverges from
`architecture.md`, the divergence is called out and is the source of truth.

---

## 1. Scope & philosophy

A local, single-user web app that drills HSK vocabulary (HSK 2 → 6) with LLM-generated
material and questions, tracking mastery through a Leitner SRS.

**Hard mode by default — production over recognition.** The app deliberately avoids the
"feels productive" trap of recognition flashcards:
- English glosses are visible on the lesson card, hidden during the drill.
- Answers are **typed in Mandarin** (free text). **No multiple choice** — it's too easy.
- A 20-second soft timer; answering over it earns no SRS promotion.
- An "I had to think hard" self-demote button (counts as correct, no promotion).
- Mastery threshold 95%; `times_wrong >= 2` forces a word back to box 1.
- 30% of reviews pull from older HSK levels.

**v1 includes:** lesson cards, the four typed question types (§7), the Leitner SRS, session
save/resume/re-drill/review (§4), the dashboard UI (§9), and progression HSK 2 → 6.

**v1 excludes (deferred):** audio/TTS, handwriting/stroke order, Anki export, multi-device
sync, custom word lists, sentence mining, and any external HTTP API.

---

## 2. Stack

| Concern | Choice | Notes |
|---|---|---|
| Language / runtime | Python 3.12+ | |
| Dependency mgmt & run | **uv** | `pyproject.toml`; `uv add …`; `uv run app.py`. Replaces pip / bare `python app.py`. |
| Persistence | **SQLite** (`progress.db`) | Single file. All progress, SRS state, cached cards, sessions. |
| Frontend / UI | **NiceGUI** | Replaces `architecture.md`'s "vanilla JS". See below. |
| LLM | OpenRouter, **`deepseek/deepseek-v4-flash:free`** | OpenAI-compatible SDK. |

### Why NiceGUI (revision to architecture.md)
`architecture.md` specified FastAPI + REST endpoints + vanilla JS. We replace the frontend
with **NiceGUI**:
- Event-driven (not Streamlit's whole-script-rerun, which fights timers, resume, and
  multi-view navigation).
- Built **on FastAPI** — keeps the backend choice intact.
- Built-in `ui.timer` (the 20s soft timer), reactive state, sidebar layout (`ui.left_drawer`),
  native browser inputs (Chinese IME works out of the box), keyboard handling.
- **No Node build step** — unlike Reflex, which compiles to React/Next and is more framework
  than a single-user local app needs.

**Consequence — no REST layer.** Because NiceGUI *is* the FastAPI app and calls Python
directly, the `/api/*` endpoints + `fetch()` from `architecture.md` collapse into an internal
**Python service module** (§8). This is less code, not more. If an external HTTP API is ever
needed, NiceGUI exposes the underlying FastAPI app to add routes — deferred.

### LLM routing (unchanged from architecture.md)
Three call sites — **lesson card**, **question generation**, **grading** — each routed through
one `MODEL_BY_PURPOSE` dict, all defaulting to `deepseek/deepseek-v4-flash:free`. Any one can
be repointed (e.g. grader → Claude Sonnet) via env var, no code change.

```python
MODEL_BY_PURPOSE = {
    "lesson":   os.getenv("MODEL_LESSON",   "deepseek/deepseek-v4-flash:free"),
    "question": os.getenv("MODEL_QUESTION", "deepseek/deepseek-v4-flash:free"),
    "grader":   os.getenv("MODEL_GRADER",   "deepseek/deepseek-v4-flash:free"),
}
```

---

## 3. Data model

Design-level table shapes (SQLite). Exact DDL/types decided at implementation; this fixes the
columns that carry meaning.

### `words` — HSK word bank + cached lesson card
| Field | Meaning |
|---|---|
| `id` | PK |
| `simplified` | headword |
| `traditional` | nullable |
| `pinyin` | tone-marked |
| `hsk_level` | 2–6 |
| `frequency_rank` | lower = more common; drives serve order |
| `pos` | parts of speech (JSON array) |
| `meanings` | base glosses from the word bank (JSON array) |
| `lesson_card_json` | **cached rich lesson card** (§6). NULL until first generated; then **never regenerated**. |

Source bank: `drkameleon/complete-hsk-vocabulary`, imported once.

### `srs_state` — one row per introduced word
| Field | Meaning |
|---|---|
| `word_id` | FK → words |
| `box` | Leitner box 1–5 |
| `next_review_at` | timestamp; due when ≤ now |
| `correct_count` / `wrong_count` / `hesitated_count` | running tallies |
| `mastered` | bool — box 5 + ≥3 further correct |

Box intervals: `8h → 1d → 3d → 7d → 21d`. Correct → +1 box; wrong → −1 box. Leak-plugger:
`wrong_count >= 2` forces back to box 1 regardless of recent correctness.

### `user_profile` — single row
`current_hsk_level`, mastery counts per level.

### `sessions` — one row per study session
| Field | Meaning |
|---|---|
| `id` | PK |
| `kind` | `new_drop` \| `review` \| `mixed` \| `redrill` |
| `status` | `in_progress` \| `completed` \| `abandoned` |
| `created_at` / `completed_at` | timestamps |
| **`cursor`** | index of the current `session_item` — **this is what makes Resume work** |
| `parent_session_id` | nullable; set for `redrill` sessions |
| `config_json` | snapshot of generation params (level mix, size, etc.) |

### `session_items` — the heart of persistence
One row per question in a session. Storing both the question **and** the saved grading is what
lets re-drill and review run with **zero LLM calls**.
| Field | Meaning |
|---|---|
| `id` | PK |
| `session_id` | FK → sessions |
| `order_index` | position in the session (0-based) |
| `word_id` | FK → words |
| `question_json` | generated question: `{type, prompt, target_word, context}` (§7) |
| `user_answer` | typed Mandarin; NULL until answered |
| `grader_output_json` | saved grader result (§7); NULL until answered |
| `response_time_ms` | NULL until answered |
| `outcome` | `correct` \| `wrong` \| `hesitated`; NULL until answered |

### `accepted_answers` — local-grade cache
Normalized answers the grader has already accepted, keyed by `word_id` (+ optionally question
type). Lets repeat/re-drill answers match **locally** without an LLM call.
| Field | Meaning |
|---|---|
| `word_id` | FK → words |
| `question_type` | nullable scope |
| `normalized_answer` | trimmed, punctuation-stripped Mandarin |
| `verdict` | the cached grader verdict for that answer |

---

## 4. Session lifecycle & saving mechanism (core)

### Create (new session)
1. Pick words (unseen for `new_drop`; due SRS items for `review`; blend for `mixed`, with 30%
   from lower levels).
2. For each word: load `lesson_card_json` if cached, else generate once and cache.
3. Generate questions (LLM, **batched** in one call where possible).
4. Persist the `sessions` row (`status = in_progress`, `cursor = 0`) and **all** `session_items`
   up front.
5. Hand the session to the UI.

### Answering
On each submitted answer, `grade_answer(...)` (§8):
- grades the answer,
- **immediately writes** `user_answer`, `grader_output_json`, `response_time_ms`, `outcome`
  to the `session_item`,
- advances `sessions.cursor`,
- updates `srs_state` (promote/demote per the rules; respect timer + self-demote → no
  promotion),
- adds the accepted answer to `accepted_answers`.

Because every step is persisted the instant it happens, **Resume is nothing more than
reloading the session and jumping to `cursor`** — no special "save" action exists or is needed.

### Complete
When the last item is answered, set `status = completed`, `completed_at = now`.

### The three load modes
- **Resume** — open the `in_progress` session, render from `cursor`. (If the app was closed
  mid-question, the unanswered item at `cursor` is simply re-shown.)
- **Re-drill** — clone a completed session's items into a new `redrill` session
  (`parent_session_id` set). For each item: accept the typed answer, then **grade locally**
  against `accepted_answers` (normalized exact/fuzzy match) and **show the previously-saved
  grading**. **No LLM call.** Escalate to the LLM **only** if the new answer matches nothing
  seen before. **Question variation** (rephrasing the prompt for the same word) is an explicit
  opt-in (`with_variation=True`) and is the one path that costs an LLM call. By default,
  re-drill does **not** touch SRS (pure practice); a toggle can let it count.
- **Review** — render `session_items` read-only from saved data: each question, your answer,
  the grader feedback, and what you got wrong. A study log, not interactive.

---

## 5. LLM-minimization strategy

A hard requirement. Expected LLM requests per normal study session: **3–5** (matches
`architecture.md`).

| Mechanism | Effect |
|---|---|
| Lesson cards cached in `words.lesson_card_json` | Generated once per word, **never regenerated**. Biggest single saver. |
| Questions persisted in `session_items` | A session's questions are generated once; resume/review/re-drill reuse them. |
| Batched question generation | One LLM call generates questions for the whole drop, not one per word. |
| Grader cache (`accepted_answers`) | Repeat/known answers graded **locally**. |
| Local-grade-first / escalate-on-novelty | LLM grading fires only for genuinely new free-text answers. |
| Re-drill default = no LLM | Variation is opt-in and is the only re-drill LLM cost. |

---

## 6. Lesson material schema (most detailed section)

The lesson card is the richest artifact in the app — it's what the user *studies*. Cached as
`words.lesson_card_json`. Be maximally informative: a card should teach the word, not just
gloss it.

### Card JSON shape
```jsonc
{
  "simplified": "经常",
  "traditional": "經常",
  "pinyin_marked": "jīngcháng",
  "pinyin_numbered": "jing1chang2",
  "hsk_level": 3,
  "frequency_rank": 612,
  "pos": ["adverb"],
  "core_meanings": ["often", "frequently", "regularly"],
  "nuance": "Describes a habitual, ongoing pattern over a long stretch of time — 'as a rule, regularly'. Leans slightly more formal/written than 常常 and emphasizes regularity over mere repetition.",
  "register": "neutral; common in both speech and writing",
  "measure_word": null,                       // populated for nouns, e.g. {"mw":"个","pinyin":"gè"}
  "examples": [
    {
      "hanzi": "我经常加班。",
      "pinyin": "Wǒ jīngcháng jiābān.",
      "gloss": "I often work overtime."
    },
    {
      "hanzi": "他经常不吃早饭。",
      "pinyin": "Tā jīngcháng bù chī zǎofàn.",
      "gloss": "He frequently skips breakfast."
    }
  ],
  "collocations": ["经常加班", "经常迟到", "经常运动"],
  "near_synonyms": [
    {
      "word": "常常",
      "pinyin": "chángcháng",
      "distinction": "Nearly interchangeable but more colloquial; stresses repetition rather than long-term regularity. 常常 is slightly less formal."
    },
    {
      "word": "往往",
      "pinyin": "wǎngwǎng",
      "distinction": "Means 'tend to / as a rule' and implies a predictable outcome under conditions — NOT freely swappable; describes tendencies, not frequency of action."
    }
  ],
  "common_mistakes": [
    "Don't use 经常 for a single past event — it describes habits, not one-off occurrences (use 常 only with established patterns).",
    "It's an adverb: place it before the verb (我经常去), never after."
  ],
  "character_breakdown": [
    {"char": "经", "meaning": "to pass through / classic / regular", "mnemonic": "the 纟(silk) radical + a sense of 'threads running through' → continuity over time"},
    {"char": "常", "meaning": "constant / ordinary / often", "mnemonic": "the 巾 (cloth) radical under 尚 → an everyday, ever-present cloth → 'constant/usual'"}
  ]
}
```

### Field rules
- `traditional`, `measure_word` are nullable (measure word required for nouns).
- `examples`: 2–3 entries, each with hanzi + pinyin + EN gloss; sentences should *use the word
  in a natural context*, not define it.
- `near_synonyms`: include the discrimination — this is where production learning happens (the
  经常 / 常常 / 往往 family is the canonical case).
- `common_mistakes`: false friends, grammar placement, wrong measure word, register slips.
- `character_breakdown`: per-character meaning + a mnemonic tying components to the gloss.
- All generation is via the `lesson` model purpose. Generated once; cached forever.

---

## 7. Practice question types (typed Mandarin only)

All answers are **free-text Mandarin typed by the user**. No multiple choice. Four types,
mixed and biased toward production:

| Type | Prompt shown | Expected answer |
|---|---|---|
| `en_to_zh` | An English sentence to translate | The Mandarin sentence (sentence production) |
| `cloze` | A Mandarin sentence with the target word blanked (`___`) | The missing target word |
| `synonym_discrim` | A Mandarin sentence + 2 near-synonym candidates *described in English context* | The word that fits more naturally, typed in hanzi |
| `gloss_to_word` | English gloss + a short usage context | The target hanzi |

`question_json` shape:
```jsonc
{ "type": "en_to_zh", "prompt": "I often work overtime.", "target_word": "经常", "context": "habitual action" }
```

### Grading (LLM as grader, not string matcher)
Free text is graded **semantically**: accepts synonyms, ignores punctuation, flags wrong
measure words, and scores **naturalness separately from correctness**. The grader can flag
synonym confusion and recommend demoting **both** words involved (e.g. 面 vs 面条 vs 常常).

`grader_output_json` shape:
```jsonc
{
  "correct": true,                 // semantically acceptable?
  "naturalness": 4,                // 1–5, scored independently of correctness
  "normalized_answer": "我经常加班",
  "feedback": "Correct and natural. 加班 is the right collocation here.",
  "issues": [],                    // e.g. ["wrong_measure_word", "synonym_confusion"]
  "confused_with": null,           // word_id of a confused near-synonym, if any → may demote both
  "accept_for_cache": true         // whether to store in accepted_answers
}
```

Grading routes through the `grader` model purpose. Local cache (`accepted_answers`) is checked
first; the LLM is called only on a novel answer (§5).

---

## 8. Service layer (internal Python, no HTTP)

A thin module (e.g. `services.py`) the NiceGUI UI calls directly. Functions mirror the
endpoint shapes from `architecture.md` but are plain Python.

| Function | Purpose | Returns (design-level) |
|---|---|---|
| `start_session(kind, size=10)` | Pick words, gen/cache cards + questions, persist session + items | session dict with first item |
| `list_sessions(limit=50)` | Dashboard session history | list of `{id, kind, status, created_at, completed_at, size, score}` |
| `load_session(id)` | Resume or review payload | full session + all items (with saved answers/grading) + `cursor` |
| `redrill_session(id, with_variation=False, affect_srs=False)` | Clone a completed session into a `redrill` | new session dict |
| `grade_answer(session_item_id, answer, response_time_ms, hesitated=False)` | Grade (local-first → LLM), persist, advance cursor, update SRS, cache answer | `grader_output_json` + updated SRS summary |
| `due_reviews()` | Count + preview of due SRS items | `{count, words[]}` |
| `get_stats()` | Mastery, weakest words, progression | `{level, mastered, total, weakest[], next_level_progress}` |

---

## 9. UI spec (NiceGUI dashboard + sidebar)

Clean, minimal, calm. One accent color. Lightly themed NiceGUI/Quasar components. Layout must
stay **extensible** — adding views or sidebar items later should not require restructuring.

### Layout
```
┌──────────────┬───────────────────────────────────────────┐
│  汉  Learner │  HOME                                       │
│              │                                             │
│  ▸ Study     │  ┌─ Resume ───────────────────────────┐    │
│  ▸ Sessions  │  │ HSK3 mixed · 6/10 done   [Resume →] │    │
│  ▸ Stats     │  └────────────────────────────────────┘    │
│              │  [ + Start new session ]                    │
│  HSK 3       │                                             │
│  ▓▓▓▓▓▓▓░░░  │  Due reviews: 8        [Review now →]       │
│  142 / 150   │                                             │
│              │  Recent sessions                            │
│  Due: 8      │   • HSK3 new_drop  ✓ completed  9/10        │
│  Streak: 5d  │       [Re-drill] [Review]                   │
│              │   • HSK3 review    ⟳ in progress            │
│              │       [Resume]                              │
└──────────────┴───────────────────────────────────────────┘
```

### Sidebar (`ui.left_drawer`, persistent)
- Nav: **Study / Sessions / Stats**.
- Current HSK level + mastery progress bar (`x / floor`, e.g. 142/150).
- Due-review count. Study streak.
- Designed with headroom for later items (Settings, custom lists, etc.).

### Home / dashboard
Resume-in-progress callout (only when one exists), "Start new session", due-reviews shortcut,
recent-sessions list with per-row actions.

### Study view — two phases
```
MATERIAL (flashcard)                    DRILL
┌────────────────────────┐    →    ┌────────────────────────────┐
│        经常             │         │ Translate:                 │
│      jīngcháng          │         │ "I often work overtime."   │
│   (adv.) often,         │         │ ┌────────────────────────┐ │
│   frequently            │         │ │ 我经常加班_            │ │
│  ─ examples ─           │         │ └────────────────────────┘ │
│  我经常加班。           │         │ ⏱ 14s   [Enter] submit     │
│  ≈ 常常 (more colloq.)  │         │ [H] I had to think hard    │
│        [Start drill →]  │         │                            │
└────────────────────────┘         └────────────────────────────┘
```
- **Material phase:** the rich card (§6) — glosses, examples, synonyms, mistakes all visible.
- **Drill phase:** glosses hidden. Typed-Mandarin `ui.input`; **20s soft timer via
  `ui.timer`** (over → no promotion); **"I had to think hard"** self-demote button (correct,
  no promotion). On submit → grader feedback panel (correctness, naturalness, feedback,
  issues), then next item. Keyboard-first: **Enter** submits, a shortcut triggers self-demote.
  Chinese IME works natively in the browser input.

### Sessions view
List of all sessions with status badges (`in progress` / `completed` / `abandoned`) and
per-row actions: **Resume** (in-progress), **Re-drill** + **Review** (completed).

### Stats view
Mastery counts, weakest words (highest `wrong_count`), and progression toward the next HSK
level (≥95% mastered AND ≥150 mastered at current level → advance).

---

## 10. Progression (unchanged from architecture.md)

Start at HSK 2. Advance a level when **≥95% of current-level words mastered AND ≥150 mastered
at the current level** (the floor stops tiny levels from triggering instant promotion). On
advance, next-level words enter the pool; 30% of reviews continue pulling from lower levels.

---

## 11. Cost & constraints (unchanged)

- **Default cost: $0.** OpenRouter free tier covers ~50 req/day (or ~1000/day after a one-time
  $10+ top-up). A normal session uses 3–5 requests thanks to batching + caching (§5).
- **Migration path:** repoint a `MODEL_BY_PURPOSE` env var to paid DeepSeek (~$0.50/mo) or
  route only the grader to Claude (~$3/mo). No code change.

---

## 12. Verification (build-time checklist)

End-to-end validation of v1:
1. `uv run app.py` → open `localhost:8080` (NiceGUI default).
2. **Start a new session** → confirm rich lesson cards render and questions are typed-Mandarin
   (no multiple choice).
3. **Answer a few items** → grader feedback shows correctness + naturalness; SRS updates.
4. **Close the browser/app mid-session, reopen** → the in-progress session **Resumes at the
   same item** (confirms `sessions.cursor` + per-step persistence).
5. **Re-drill** a completed session → confirm **no LLM call fires** for known answers (watch
   request logs); saved grading is shown after answering. Toggle variation → confirm it's the
   only path that calls the LLM.
6. **Review** a completed session → read-only log shows questions, answers, grading.
7. Inspect SQLite: `sessions.cursor`, `session_items` saved answers/grading, `accepted_answers`
   populated, `srs_state` boxes moved correctly.
8. **Stats view** reflects the SRS changes and progression toward the next level.

---

## Appendix — divergences from architecture.md

| architecture.md | This spec | Reason |
|---|---|---|
| Frontend: vanilla JS + REST `/api/*` | NiceGUI; internal Python service layer | Stateful timed drill + dashboard; less code, no Node build |
| Run with `python app.py`, pip | `uv run app.py`, uv-managed `pyproject.toml` | Reproducible, modern tooling |
| Model: "DeepSeek V4 Flash" (informal) | `deepseek/deepseek-v4-flash:free` (exact slug) | Confirmed OpenRouter slug |
| Sessions described only as a table | Full save/resume/re-drill/review lifecycle (§4) | User requirement |
