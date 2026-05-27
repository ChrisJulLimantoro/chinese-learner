# Chinese Learning Agent — Architecture

A local web app that drills HSK vocabulary with LLM-generated questions and tracks progression through HSK 2→6.

---

## Decisions

### Deployment: local-only web app
Runs on your laptop, `python app.py`, open `localhost:8000`. No VPS, no cron, no public IP, no Telegram. Triggered manually when you want to study.

**Why:** the original Telegram + cron + VPS plan added deployment overhead for no learning benefit. A browser tab gives better UX (Chinese IME, rich layout, hover tooltips), and "open when ready" matches how you'll actually study.

### Stack: FastAPI + SQLite + vanilla JS
- Backend: FastAPI (async, OpenAI SDK works cleanly).
- Persistence: SQLite single file (`progress.db`). All progress, SRS state, cached lesson cards.
- Frontend: plain HTML + fetch + vanilla JS. No framework.

**Why:** single-user, single-machine, zero ops. A framework would be more code than features.

### LLM: DeepSeek V4 Flash (free) via OpenRouter
OpenAI-compatible API, $0 within rate limits, Chinese-native model.

**Why:** cheapest credible option, strong on Chinese pedagogy (better than Claude/GPT at near-synonym distinctions), 1M context. Free tier covers personal use.

**Pluggable by purpose.** Three LLM call sites — lesson cards, question generation, grading — each routed through one `MODEL_BY_PURPOSE` dict. Swap any of them (e.g. send grader to Claude Sonnet later) via env var, no code change.

### Memory model: Leitner 5-box SRS
Five boxes, fixed intervals (8h → 1d → 3d → 7d → 21d). Correct answer promotes one box; wrong demotes one box. Mastery = box 5 + 3 more correct.

**Why over Anki's SM-2:** simpler to debug. You can read the DB and immediately know why a word is showing up. SM-2's added precision doesn't matter at single-user scale.

**Leak-plugger:** `times_wrong >= 2` forces back to box 1 regardless of recent correctness. Without this, you can fake mastery on words you only half-know.

### Word bank: drkameleon/complete-hsk-vocabulary
HSK 2.0 + 3.0 in clean JSON: simplified, pinyin, level, frequency rank, parts of speech, meanings. Imported once into the `words` SQLite table.

**Why:** clean structure, frequency ranks (so we serve most-common words first), maintained.

### Difficulty: hard-mode by default
Production over recognition. Key rules:
- English glosses visible on lesson card, hidden during drill.
- Question mix biased to sentence production, translation EN→ZH, and near-synonym discrimination — not multiple choice.
- "I had to think hard" self-demote button (correct answer, no promotion).
- 20-second soft timer; over → no promotion.
- Mastery threshold 95% (not the usual 85%).
- 30% of reviews pull from older HSK levels.

**Why:** flashcard apps default to recognition because it feels productive. Production is what builds fluency.

### LLM as grader, not string matcher
Free-text answers graded semantically: accepts synonyms, ignores punctuation, flags wrong measure words, scores naturalness separately from correctness. Can flag synonym confusion and demote *both* words involved.

**Why:** 我经常吃面 vs 我经常吃面条 vs 我常常吃面 are all "kind of right" in different ways. String matching can't grade Chinese.

---

## Component Map

```
Browser (localhost:8000)
        │
        ▼
   FastAPI app
   ├── /api/session/new      → pick 10 unseen words, return lesson cards + questions
   ├── /api/session/review   → pull due SRS items
   ├── /api/answer           → grade via LLM, update SRS
   └── /api/stats            → progress, mastery, weakest words
        │
        ├── SQLite (progress.db)
        │     words, srs_state, sessions, attempts, user_profile
        │
        └── OpenRouter API
              lesson | question | grader  (purpose-routed model)
```

---

## Data Model (essentials)

- `words` — HSK word bank + cached lesson card JSON per word.
- `srs_state` — one row per introduced word: box, next_review_at, correct/wrong/hesitated counts.
- `sessions` — one row per study session, kind = new_drop | review | mixed.
- `attempts` — every question asked, with user answer, grader output, response time.
- `user_profile` — current HSK level, mastery counts.

Lesson cards are cached on first generation and never regenerated — biggest single saver against rate limits.

---

## Progression

Start at HSK 2 (your level). Advance when:
- ≥95% of current-level words mastered, AND
- ≥150 mastered at the current level (floor prevents tiny levels triggering instant promotion).

On advance: new words from the next level get added to the pool. Old words don't get a free pass — 30% of reviews continue to pull from lower levels.

---

## Cost & Constraints

- **Cost at default config:** $0. OpenRouter free tier covers ~50 req/day (or ~1000/day if you've ever topped up $10+). A normal study session uses 3-5 requests thanks to batching + cached lesson cards.
- **Migration path:** if free tier becomes a bottleneck, change one env var to paid DeepSeek (~$0.50/mo) or route only the grader to Claude (~$3/mo). No code change.

---

## What's deferred

Audio (Edge TTS), handwriting/stroke order (Hanzi Writer), Anki export, multi-device sync (Turso), custom word lists, sentence mining — all accommodated by the architecture but not in v1.
