# Graph Report - chinese-learner  (2026-06-21)

## Corpus Check
- 54 files · ~21,803 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 272 nodes · 622 edges · 25 communities (14 shown, 11 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 4 edges (avg confidence: 0.82)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `93e37122`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_UI Client Components|UI Client Components]]
- [[_COMMUNITY_SRS & Stats Logic|SRS & Stats Logic]]
- [[_COMMUNITY_App Pages & Routing|App Pages & Routing]]
- [[_COMMUNITY_LLM & Grading|LLM & Grading]]
- [[_COMMUNITY_Vocabulary Feature|Vocabulary Feature]]
- [[_COMMUNITY_Auth & Layout|Auth & Layout]]
- [[_COMMUNITY_Architecture Overview|Architecture Overview]]
- [[_COMMUNITY_Word Bank Seeding|Word Bank Seeding]]
- [[_COMMUNITY_Word Detail Page|Word Detail Page]]
- [[_COMMUNITY_Session Proxy|Session Proxy]]
- [[_COMMUNITY_Auth Concepts|Auth Concepts]]
- [[_COMMUNITY_PostCSS Config|PostCSS Config]]
- [[_COMMUNITY_ESLint Config|ESLint Config]]
- [[_COMMUNITY_Next.js Config|Next.js Config]]
- [[_COMMUNITY_Supabase Browser Client|Supabase Browser Client]]
- [[_COMMUNITY_Next Env Types|Next Env Types]]
- [[_COMMUNITY_Next Config (concept)|Next Config (concept)]]
- [[_COMMUNITY_README|README]]
- [[_COMMUNITY_Project Overview|Project Overview]]
- [[_COMMUNITY_Auth Proxy (concept)|Auth Proxy (concept)]]
- [[_COMMUNITY_Domain Types|Domain Types]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]

## God Nodes (most connected - your core abstractions)
1. `getUserContext()` - 42 edges
2. `getProfile()` - 15 edges
3. `createAdminClient()` - 12 edges
4. `Card()` - 11 edges
5. `Badge()` - 11 edges
6. `requireAdmin()` - 10 edges
7. `Button()` - 10 edges
8. `addWordsToBank()` - 10 edges
9. `startSession()` - 9 edges
10. `loadSession()` - 9 edges

## Surprising Connections (you probably didn't know these)
- `SRS Leitner Logic` --implements--> `Supabase Database Schema`  [INFERRED]
  src/lib/srs.ts → supabase/migrations/001_initial_schema.sql
- `Service Layer` --implements--> `Supabase Database Schema`  [INFERRED]
  src/lib/services.ts → supabase/migrations/001_initial_schema.sql
- `Word Bank Seeding Script` --references--> `Supabase Database Schema`  [EXTRACTED]
  scripts/seed-wordbank.ts → supabase/migrations/001_initial_schema.sql
- `SettingsPage()` --calls--> `vocabCount()`  [EXTRACTED]
  src/app/settings/page.tsx → src/lib/services.ts
- `getWordCardAction()` --calls--> `getUserContext()`  [EXTRACTED]
  src/app/actions/vocabulary.ts → src/lib/user.ts

## Communities (25 total, 11 thin omitted)

### Community 0 - "UI Client Components"
Cohesion: 0.06
Nodes (32): startSessionWithWordsAction(), regenerateWordCardAction(), Badge(), BadgeVariant, Bento(), Button(), ButtonProps, ButtonSize (+24 more)

### Community 1 - "SRS & Stats Logic"
Cohesion: 0.1
Nodes (36): getProfileAction(), updateHskLevelAction(), dueReviewsAction(), getInProgressSessionAction(), gradeAnswerAction(), listSessionsAction(), loadSessionAction(), redrillSessionAction() (+28 more)

### Community 2 - "App Pages & Routing"
Cohesion: 0.12
Nodes (30): startSessionAction(), addWordsToBankAction(), getStatsAction(), getWordCardAction(), vocabCountAction(), generateLessonCard(), stubLessonCard(), addWordsToBank() (+22 more)

### Community 3 - "LLM & Grading"
Cohesion: 0.12
Nodes (8): signIn(), signOut(), signUp(), FEATURES, HSK_LEVELS, NAV_LINKS, SealProps, HSK_LEVELS

### Community 4 - "Vocabulary Feature"
Cohesion: 0.17
Nodes (18): BOX_INTERVALS, LLM_MAX_RETRIES, LLM_MAX_TOKENS, MAX_TOKENS_BY_PURPOSE, MODEL_BY_PURPOSE, checkCache(), gradeAnswerWithCache(), normalize() (+10 more)

### Community 5 - "Auth & Layout"
Cohesion: 0.3
Nodes (10): AdminUser, deleteUserAction(), listUsersAction(), requireAdmin(), setUserLimitsAction(), setUserRoleAction(), setUserUnlimitedAction(), Props (+2 more)

### Community 6 - "Architecture Overview"
Cohesion: 0.15
Nodes (12): Chinese Learner — Next.js on Vercel, code:block1 (npm install), code:block2 (git show local:src/learner/<file>.py), Dev, Environment, graphify, Key directories, Manual step — enable asymmetric JWT signing keys (+4 more)

### Community 7 - "Word Bank Seeding"
Cohesion: 0.27
Nodes (6): HSK_FILTER_LABELS, hskBadgeVariant(), VocabWord, wordBadgeLabel(), wordBadgeVariant(), WordRow()

### Community 8 - "Word Detail Page"
Cohesion: 0.27
Nodes (10): Grading & Cache Logic, Home Client Component, Supabase Database Schema, LLM Client (OpenCode Zen), Home Page, Word Bank Seeding Script, Service Layer, Session Server Actions (+2 more)

### Community 9 - "Session Proxy"
Cohesion: 0.6
Nodes (4): fetchRaw(), main(), parseLevel(), WordRow

### Community 10 - "Auth Concepts"
Cohesion: 0.4
Nodes (4): code:bash (npm run dev), Deploy on Vercel, Getting Started, Learn More

### Community 12 - "ESLint Config"
Cohesion: 0.67
Nodes (3): Auth Server Actions, Root Layout, User Context Helper

## Knowledge Gaps
- **51 isolated node(s):** `config`, `eslintConfig`, `nextConfig`, `WordRow`, `config` (+46 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getUserContext()` connect `SRS & Stats Logic` to `UI Client Components`, `App Pages & Routing`, `Auth & Layout`?**
  _High betweenness centrality (0.069) - this node is a cross-community bridge._
- **Why does `Card()` connect `UI Client Components` to `Auth & Layout`, `Word Bank Seeding`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **Why does `Badge()` connect `UI Client Components` to `Auth & Layout`, `Word Bank Seeding`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **What connects `config`, `eslintConfig`, `nextConfig` to the rest of the system?**
  _51 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `UI Client Components` be split into smaller, more focused modules?**
  _Cohesion score 0.06 - nodes in this community are weakly interconnected._
- **Should `SRS & Stats Logic` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._
- **Should `App Pages & Routing` be split into smaller, more focused modules?**
  _Cohesion score 0.12 - nodes in this community are weakly interconnected._