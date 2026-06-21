# Graph Report - chinese-learner  (2026-06-21)

## Corpus Check
- 60 files · ~114,577 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 320 nodes · 716 edges · 31 communities (20 shown, 11 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 4 edges (avg confidence: 0.82)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `60dae998`
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
- [[_COMMUNITY_PostCSS (concept)|PostCSS (concept)]]
- [[_COMMUNITY_ESLint (concept)|ESLint (concept)]]
- [[_COMMUNITY_Next Config (concept)|Next Config (concept)]]
- [[_COMMUNITY_README|README]]
- [[_COMMUNITY_Project Overview|Project Overview]]
- [[_COMMUNITY_Auth Proxy (concept)|Auth Proxy (concept)]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]

## God Nodes (most connected - your core abstractions)
1. `getUserContext()` - 43 edges
2. `getProfile()` - 15 edges
3. `createAdminClient()` - 12 edges
4. `Card()` - 11 edges
5. `Badge()` - 11 edges
6. `requireAdmin()` - 10 edges
7. `Button()` - 10 edges
8. `hasMultipleReadings()` - 10 edges
9. `addWordsToBank()` - 10 edges
10. `startSession()` - 9 edges

## Surprising Connections (you probably didn't know these)
- `SRS Leitner Logic` --implements--> `Supabase Database Schema`  [INFERRED]
  src/lib/srs.ts → supabase/migrations/001_initial_schema.sql
- `Service Layer` --implements--> `Supabase Database Schema`  [INFERRED]
  src/lib/services.ts → supabase/migrations/001_initial_schema.sql
- `Word Bank Seeding Script` --references--> `Supabase Database Schema`  [EXTRACTED]
  scripts/seed-wordbank.ts → supabase/migrations/001_initial_schema.sql
- `RootLayout()` --calls--> `getProfile()`  [EXTRACTED]
  src/app/layout.tsx → src/lib/services.ts
- `SettingsPage()` --calls--> `getProfile()`  [EXTRACTED]
  src/app/settings/page.tsx → src/lib/services.ts

## Communities (31 total, 11 thin omitted)

### Community 0 - "UI Client Components"
Cohesion: 0.08
Nodes (43): getProfileAction(), updateHskLevelAction(), dueReviewsAction(), ensureItemQuestionAction(), getInProgressSessionAction(), gradeAnswerAction(), listSessionsAction(), loadSessionAction() (+35 more)

### Community 1 - "SRS & Stats Logic"
Cohesion: 0.13
Nodes (31): getStatsAction(), generateLessonCard(), generateQuestions(), safeGenerateQuestion(), stubQuestions(), addWordsToBank(), createSession(), ensureItemQuestion() (+23 more)

### Community 2 - "App Pages & Routing"
Cohesion: 0.1
Nodes (10): signIn(), signOut(), signUp(), EXTRAS, FEATURES, HSK_LEVELS, STEPS, NAV_LINKS (+2 more)

### Community 3 - "LLM & Grading"
Cohesion: 0.18
Nodes (17): BOX_INTERVALS, LLM_MAX_RETRIES, LLM_MAX_TOKENS, MAX_TOKENS_BY_PURPOSE, MODEL_BY_PURPOSE, checkCache(), gradeAnswerWithCache(), normalize() (+9 more)

### Community 4 - "Vocabulary Feature"
Cohesion: 0.11
Nodes (18): Architecture, code:bash (# 1. Clone), code:bash (git checkout local), code:bash (git show local:README.md), Deploy on Vercel, Enable asymmetric JWT signing keys (recommended), Environment variables, Getting Started (+10 more)

### Community 5 - "Auth & Layout"
Cohesion: 0.14
Nodes (8): Button(), Card(), PageHeader(), Profile, SessionSummary, HSK_LABELS, Props, VocabWord

### Community 6 - "Architecture Overview"
Cohesion: 0.3
Nodes (10): AdminUser, deleteUserAction(), listUsersAction(), requireAdmin(), setUserLimitsAction(), setUserRoleAction(), setUserUnlimitedAction(), Props (+2 more)

### Community 7 - "Word Bank Seeding"
Cohesion: 0.26
Nodes (11): main(), fetchRaw(), main(), parseLevel(), Reading, WordRow, fetchRaw(), parseLevel() (+3 more)

### Community 8 - "Word Detail Page"
Cohesion: 0.18
Nodes (9): BadgeVariant, Bento(), ButtonProps, ButtonSize, ButtonVariant, CardProps, InkLoader(), ProgressBar() (+1 more)

### Community 9 - "Session Proxy"
Cohesion: 0.22
Nodes (7): formatReadingsPinyin(), HSK_FILTER_LABELS, hskBadgeVariant(), VocabWord, wordBadgeLabel(), wordBadgeVariant(), WordRow()

### Community 10 - "Auth Concepts"
Cohesion: 0.15
Nodes (12): Chinese Learner — Next.js on Vercel, code:block1 (npm install), code:block2 (git show local:src/learner/<file>.py), Dev, Environment, graphify, Key directories, Manual step — enable asymmetric JWT signing keys (+4 more)

### Community 11 - "PostCSS Config"
Cohesion: 0.2
Nodes (7): TYPE_LABELS, DueReviews, GraderOutput, LessonCard, Session, SessionItem, Supabase

### Community 12 - "ESLint Config"
Cohesion: 0.24
Nodes (5): Skeleton(), hasMultipleReadings(), CardLoadingSkeleton(), StudySessionClient(), TYPE_LABELS

### Community 13 - "Next.js Config"
Cohesion: 0.2
Nodes (3): NAV, QUICK, WEEKDAYS_CN

### Community 14 - "Supabase Browser Client"
Cohesion: 0.27
Nodes (10): Grading & Cache Logic, Home Client Component, Supabase Database Schema, LLM Client (OpenCode Zen), Home Page, Word Bank Seeding Script, Service Layer, Session Server Actions (+2 more)

### Community 15 - "Next Env Types"
Cohesion: 0.29
Nodes (5): regenerateWordCardAction(), Badge(), SrsState, fmtNextReview(), WordCardClient()

### Community 16 - "PostCSS (concept)"
Cohesion: 0.5
Nodes (3): Assets (in this folder), LinkedIn Post — 汉字 Chinese Learner, Post

### Community 18 - "Next Config (concept)"
Cohesion: 0.67
Nodes (3): Auth Server Actions, Root Layout, User Context Helper

## Knowledge Gaps
- **70 isolated node(s):** `config`, `eslintConfig`, `nextConfig`, `Reading`, `WordRow` (+65 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getUserContext()` connect `UI Client Components` to `SRS & Stats Logic`, `Architecture Overview`, `Next Env Types`?**
  _High betweenness centrality (0.054) - this node is a cross-community bridge._
- **Why does `Card()` connect `Auth & Layout` to `Architecture Overview`, `Word Detail Page`, `Session Proxy`, `PostCSS Config`, `ESLint Config`, `Next.js Config`, `Next Env Types`?**
  _High betweenness centrality (0.010) - this node is a cross-community bridge._
- **Why does `Badge()` connect `Next Env Types` to `Auth & Layout`, `Architecture Overview`, `Word Detail Page`, `Session Proxy`, `PostCSS Config`, `ESLint Config`, `Next.js Config`?**
  _High betweenness centrality (0.010) - this node is a cross-community bridge._
- **What connects `config`, `eslintConfig`, `nextConfig` to the rest of the system?**
  _70 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `UI Client Components` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._
- **Should `SRS & Stats Logic` be split into smaller, more focused modules?**
  _Cohesion score 0.13 - nodes in this community are weakly interconnected._
- **Should `App Pages & Routing` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._