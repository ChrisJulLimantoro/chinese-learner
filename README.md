# 中文 Chinese Learner

## What this is

A Mandarin HSK vocabulary trainer designed to make words actually *stick*. It
combines three things most flashcard apps don't:

- **LLM-generated lesson cards** — meanings, example sentences, character
  breakdowns, and mnemonics, generated the first time you meet a word.
- **Spaced repetition (Leitner 5-box SRS)** — words resurface right before you'd
  forget them; easy words go quiet, hard words come back often.
- **AI-graded free-text answers** — you *produce* the answer instead of picking
  from choices, and the AI grades it semantically (accepts synonyms, explains
  mistakes).

The goal is recall, not recognition — built around the official HSK curriculum.

## Two ways to run it

This project ships in two flavours on two git branches. Pick based on how much
setup you want:

| | **`main` branch** (this one) | **`local` branch** |
|---|---|---|
| Form | Full web app, multi-user, deployable | Single-machine app, just for you |
| Stack | Next.js + Supabase, hosted on Vercel | Python, all local |
| Storage | Supabase Postgres (cloud) | SQLite file on disk |
| Accounts | Email + password auth | None — no login |
| External services | **Requires a Supabase project** (+ optional LLM key) | **None.** No Supabase, no cloud signup — just Docker (or Python) and an optional LLM key |
| Best for | Hosting it for others / learning the web stack | Trying it in 2 minutes with zero commercial setup |

> **Just want to try it fast?** Jump to
> [**the `local` branch**](#the-local-branch--zero-cloud-just-docker) — no
> Supabase account, no database wiring, one Docker command.

The rest of this README covers the **`main` (Next.js)** branch.

---

## Architecture

| Layer | Tech |
|---|---|
| Frontend / Backend | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4 |
| Database & Auth | Supabase Postgres + Supabase Auth (email + password) |
| Server logic | Next.js Server Actions (`src/app/actions/`) |
| AI | OpenCode Zen (OpenAI-compatible API); deterministic stub when `LLM_API_KEY` is absent |
| Deploy | Vercel (Hobby) |

Key directories:

- `src/lib/` — domain logic (`config.ts`, `srs.ts`, `grading.ts`, `llm.ts`, `services.ts`, `types.ts`)
- `src/lib/supabase/` — Supabase clients (`client.ts`, `server.ts`, `admin.ts`)
- `src/app/` — App Router pages and Server Actions
- `src/components/` — shared UI
- `supabase/migrations/` — SQL schema + RLS policies
- `scripts/` — one-off scripts (`seed-wordbank.ts`)

---

## Prerequisites

- **Node.js 20+** and npm
- A **Supabase project** (free tier is fine) — for Postgres + Auth
- *(Optional)* an **OpenCode Zen API key** for real LLM lesson cards and grading.
  Without one the app runs in stub mode (deterministic placeholder responses).

---

## Quick start

```bash
# 1. Clone
git clone https://github.com/ChrisJulLimantoro/chinese-learner.git
cd chinese-learner

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.local.example .env.local
# edit .env.local — fill in your Supabase URL/keys (+ optional LLM key)

# 4. Apply the database schema
#    Run the SQL files in supabase/migrations/ in order via the Supabase
#    dashboard SQL editor, or with `supabase db push`.

# 5. Seed the HSK word bank
npm run seed

# 6. Run the dev server
npm run dev
```

Open **http://localhost:3000** and create an account.

### Environment variables

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Service-role key (server-side admin actions, seeding) |
| `LLM_API_KEY` | No | OpenCode Zen key. If unset, the app runs in stub mode. |
| `MODEL_LESSON` / `MODEL_QUESTION` / `MODEL_GRADER` | No | Override the model per purpose (default `deepseek-v4-flash-free`) |
| `LLM_MAX_TOKENS` and `LLM_MAX_TOKENS_*` | No | Per-call output token budgets |
| `LLM_MAX_RETRIES` | No | Retries on empty/invalid JSON (default `3`) |

### npm scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server at `localhost:3000` |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |
| `npm run seed` | Import the HSK word bank into Supabase |

---

## The `local` branch — zero cloud, just Docker

The original version of this project lives on the **`local`** git branch, and
it's the fastest way to try everything. There is **no Supabase, no cloud account,
and no commercial service of any kind** — progress is stored in a plain SQLite
file on your machine and there's no login. All you need is **Docker**.

```bash
git checkout local

# (Optional) real LLM grading — otherwise it runs offline in stub mode
cp .env.example .env        # then paste an OpenCode Zen key into .env

make docker-up              # build + start the container (localhost:8080)
```

Open **http://localhost:8080** — that's it. Useful container commands:

| Command | What it does |
|---|---|
| `make docker-up` | Build and start the app at `localhost:8080` |
| `make docker-logs` | Tail the container logs |
| `make docker-down` | Stop the container |

Your SQLite DB persists in `./data` between runs.

**Prefer Python directly (no Docker)?** Install [`uv`](https://docs.astral.sh/uv/)
and run `make install && make run`. Either way it starts in stub mode and works
fully offline without an API key.

See that branch's own `README.md` for full details (configuration, SRS internals,
and all Makefile targets). You can also peek at files without switching branches:

```bash
git show local:README.md
git show local:src/learner/srs.py
```

---

## Performance notes

### Enable asymmetric JWT signing keys (recommended)

`getClaims()` in `src/lib/user.ts` verifies JWTs **locally** (no network
round-trip) when asymmetric signing keys are active:

1. Supabase dashboard → Project → Settings → Auth → **Signing Keys**
2. **Add a new JWT signing key** (ECC/ES256 or RSA/RS256)
3. Set it as **primary** and rotate — existing sessions re-sign on next refresh.

Until then `getClaims()` falls back to `getUser()` (one network call per render),
deduplicated per request via React `cache()`.

### Region alignment

Run Vercel functions in the same region as your Supabase project to minimise
DB latency. If they differ, set `vercel.json` → `"regions"` (e.g. `"sin1"`
for Singapore; Vercel Hobby defaults to `iad1` / US East).
