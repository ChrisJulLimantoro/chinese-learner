# 汉 Chinese Learner

A local HSK vocabulary drill app with LLM-generated lesson cards, spaced repetition (Leitner 5-box SRS), and free-text answers graded by an AI.

Runs entirely on your machine — no server, no account needed. Just open a browser tab when you want to study.

---

## Features

- **HSK 2.0 word bank** (~5 000 words, HSK 1–6) imported once on first run
- **LLM lesson cards** — mnemonic, example sentences, usage notes generated on first encounter
- **Hard-mode drills** — production over recognition: translate EN→ZH, write characters, near-synonym discrimination
- **Leitner SRS** — 5-box system (8h → 1d → 3d → 7d → 21d); "I had to think" self-demote button
- **Semantic grading** — free-text answers, not multiple choice; AI accepts synonyms and explains mistakes
- **Level progression** — starts at HSK 2, advances when ≥ 95 % of current-level words are mastered
- **Stub mode** — works completely offline without an API key (deterministic fake responses, useful for testing the UI)

---

## Requirements

- Python 3.12+
- [`uv`](https://docs.astral.sh/uv/getting-started/installation/) (Python package manager)

```bash
# Install uv (if you don't have it)
curl -LsSf https://astral.sh/uv/install.sh | sh
```

---

## Quickstart

```bash
# 1. Clone the repo
git clone <repo-url>
cd chinese-learner

# 2. Install dependencies
make install

# 3. (Optional) Add your OpenCode Zen API key for real LLM grading
cp .env.example .env
# edit .env — paste your OpenCode Zen key

# 4. Run
make run
```

Then open **http://localhost:8080** in your browser.

> **No API key?** The app starts in stub mode automatically — all LLM calls return placeholder responses. You can explore the full UI and SRS flow without any setup.

---

## Configuration

Copy `.env.example` to `.env` and fill in:

| Variable | Required | Default | Description |
|---|---|---|---|
| `OPENCODE_API_KEY` | No | _(stub mode)_ | OpenCode Zen API key. If unset, the app runs in stub mode. |
| `MODEL_LESSON` | No | `deepseek-v4-flash-free` | Model for lesson card generation |
| `MODEL_QUESTION` | No | `deepseek-v4-flash-free` | Model for question generation |
| `MODEL_GRADER` | No | `deepseek-v4-flash-free` | Model for grading answers |
| `LLM_MAX_TOKENS` | No | `4096` | Default output token budget per LLM call |
| `LLM_MAX_RETRIES` | No | `3` | Retries when the model returns empty/truncated/invalid JSON |
| `LLM_MAX_TOKENS_LESSON` | No | `LLM_MAX_TOKENS` | Token budget for lesson cards |
| `LLM_MAX_TOKENS_QUESTION` | No | `256000` | Token budget for batched question generation |
| `LLM_MAX_TOKENS_GRADER` | No | `16384` | Token budget for grading |

Requests go to OpenCode Zen (`https://opencode.ai/zen/v1`). The default model
(DeepSeek V4 Flash free) is a reasoning model, so JSON output is requested explicitly
and retried if the model truncates mid-thought.

---

## Makefile targets

| Command | What it does |
|---|---|
| `make install` | Create `.venv` and install all dependencies |
| `make run` | Start the app at `localhost:8080` |
| `make reset` | Delete your progress DB and start completely fresh |
| `make clean` | `reset` + remove `.venv` and all compiled Python files |

---

## How it works

`progress.db` is created automatically on first `make run` — no manual setup needed. The app creates the SQLite file and all tables at startup, then fetches the HSK word bank from GitHub and stores it locally. That network call only happens once; every subsequent run reads from the local DB.

Each study session:
1. Picks words — new unseen words or SRS-due reviews, blended by frequency rank
2. Generates a lesson card per new word (LLM, cached forever after)
3. Generates drill questions (LLM, one batch call)
4. You answer in free text; the AI grades semantically
5. Your SRS box for each word updates immediately

All progress lives in `progress.db` in the project root. Back it up or delete it with `make reset`.

---

## Cost

At default settings: **$0**. A normal session (10 words, mixed new + review) uses 3–5 LLM requests thanks to lesson card caching and batched question generation, and the default DeepSeek V4 Flash free model is $0 on OpenCode Zen.

If you hit rate limits, set any of the `MODEL_*` env vars to another model available on OpenCode Zen.
