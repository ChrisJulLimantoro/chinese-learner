# Chinese Learner — Next.js on Vercel

Mandarin SRS learning app. App Router, TypeScript, Tailwind, Supabase (Auth + Postgres).

## Stack
- **Frontend/Backend**: Next.js 15 (App Router), TypeScript, Tailwind CSS
- **Database/Auth**: Supabase Postgres + Supabase Auth (email + password)
- **AI**: OpenCode Zen (OpenAI-compatible), deterministic stub when `LLM_API_KEY` absent
- **Deploy**: Vercel (Hobby)

## Key directories
- `src/lib/` — domain logic (config.ts, srs.ts, grading.ts, llm.ts, services.ts, types.ts)
- `src/lib/supabase/` — Supabase clients (client.ts, server.ts, admin.ts)
- `src/app/` — App Router pages and Server Actions
- `src/app/actions/` — Server Actions (session.ts, vocabulary.ts, auth.ts)
- `src/components/` — shared UI (Nav.tsx)
- `supabase/migrations/` — SQL schema + RLS (001_initial_schema.sql)
- `scripts/` — one-off scripts (seed-wordbank.ts)

## Environment
Copy `.env.local.example` → `.env.local` and fill in Supabase URL/keys + optional LLM key.

## Dev
```
npm install
npm run dev
```

## Performance notes

### Manual step — enable asymmetric JWT signing keys
`getClaims()` in `src/lib/user.ts` and `src/proxy.ts` verifies JWTs **locally** (zero network round-trips) when asymmetric keys are active. To activate them:
1. Supabase dashboard → Project → Settings → Auth → **Signing Keys**
2. Click **Add a new JWT signing key** and choose ECC (ES256) or RSA (RS256)
3. Set it as the **primary** signing key and rotate. Existing sessions re-sign on next refresh.

Until this is done, `getClaims()` falls back to `getUser()` (one network call per render), but React `cache()` still deduplicates the layout + page calls so you pay at most one call per request instead of three.

### Region alignment
Vercel functions should run in the same region as your Supabase project to minimise DB round-trip latency:
- Supabase region: Dashboard → Project Settings → General → Region
- Vercel region: Project → Settings → Functions (Hobby default `iad1` = US East)
- If they differ, update `vercel.json` → `"regions"` (e.g. `"sin1"` for Singapore).

## Original Python app
Preserved on git branch `local`. Reference with:
```
git show local:src/learner/<file>.py
```

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- ALWAYS read graphify-out/GRAPH_REPORT.md before reading any source files, running grep/glob searches, or answering codebase questions. The graph is your primary map of the codebase.
- IF graphify-out/wiki/index.md EXISTS, navigate it instead of reading raw files
- For cross-module "how does X relate to Y" questions, prefer `graphify query "<question>"`, `graphify path "<A>" "<B>"`, or `graphify explain "<concept>"` over grep — these traverse the graph's EXTRACTED + INFERRED edges instead of scanning files
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
