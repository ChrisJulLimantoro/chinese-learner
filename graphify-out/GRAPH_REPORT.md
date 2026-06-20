# Graph Report - .  (2026-06-20)

## Corpus Check
- Corpus is ~14,506 words - fits in a single context window. You may not need a graph.

## Summary
- 184 nodes · 397 edges · 23 communities (12 shown, 11 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 4 edges (avg confidence: 0.82)
- Token cost: 44,000 input · 2,247 output

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
- [[_COMMUNITY_PostCSS (concept)|PostCSS (concept)]]
- [[_COMMUNITY_ESLint (concept)|ESLint (concept)]]
- [[_COMMUNITY_Next Config (concept)|Next Config (concept)]]
- [[_COMMUNITY_README|README]]
- [[_COMMUNITY_Project Overview|Project Overview]]
- [[_COMMUNITY_Auth Proxy (concept)|Auth Proxy (concept)]]
- [[_COMMUNITY_Domain Types|Domain Types]]

## God Nodes (most connected - your core abstractions)
1. `getUserContext()` - 33 edges
2. `loadSession()` - 9 edges
3. `startSession()` - 8 edges
4. `getStats()` - 8 edges
5. `getWordCard()` - 8 edges
6. `addWordsToBank()` - 8 edges
7. `gradeAnswerWithCache()` - 7 edges
8. `getProfile()` - 7 edges
9. `listSessions()` - 7 edges
10. `listVocabulary()` - 7 edges

## Surprising Connections (you probably didn't know these)
- `SRS Leitner Logic` --implements--> `Supabase Database Schema`  [INFERRED]
  src/lib/srs.ts → supabase/migrations/001_initial_schema.sql
- `Service Layer` --implements--> `Supabase Database Schema`  [INFERRED]
  src/lib/services.ts → supabase/migrations/001_initial_schema.sql
- `Word Bank Seeding Script` --references--> `Supabase Database Schema`  [EXTRACTED]
  scripts/seed-wordbank.ts → supabase/migrations/001_initial_schema.sql
- `StudyPage()` --calls--> `getUserContext()`  [EXTRACTED]
  src/app/study/page.tsx → src/lib/user.ts
- `listVocabularyAction()` --calls--> `getUserContext()`  [EXTRACTED]
  src/app/actions/vocabulary.ts → src/lib/user.ts

## Communities (23 total, 11 thin omitted)

### Community 0 - "UI Client Components"
Cohesion: 0.08
Nodes (17): gradeAnswerAction(), redrillSessionAction(), TYPE_LABELS, DueReviews, GraderOutput, LessonCard, Outcome, Profile (+9 more)

### Community 1 - "SRS & Stats Logic"
Cohesion: 0.18
Nodes (22): getStatsAction(), BOX_INTERVALS, generateQuestions(), addWordsToBank(), createSession(), dueReviews(), ensureLessonCard(), getProfile() (+14 more)

### Community 2 - "App Pages & Routing"
Cohesion: 0.19
Nodes (16): dueReviewsAction(), getInProgressSessionAction(), listSessionsAction(), loadSessionAction(), startSessionAction(), startSessionWithWordsAction(), HomePage(), SessionDetailPage() (+8 more)

### Community 3 - "LLM & Grading"
Cohesion: 0.16
Nodes (19): LLM_MAX_RETRIES, LLM_MAX_TOKENS, MAX_TOKENS_BY_PURPOSE, MODEL_BY_PURPOSE, checkCache(), gradeAnswerWithCache(), normalize(), storeCache() (+11 more)

### Community 4 - "Vocabulary Feature"
Cohesion: 0.18
Nodes (11): addWordsToBankAction(), listAddableWordsAction(), listVocabularyAction(), vocabCountAction(), listAddableWords(), listVocabulary(), vocabCount(), Word (+3 more)

### Community 5 - "Auth & Layout"
Cohesion: 0.17
Nodes (8): signIn(), signOut(), signUp(), geistMono, geistSans, metadata, NAV_LINKS, createClient()

### Community 6 - "Architecture Overview"
Cohesion: 0.27
Nodes (10): Grading & Cache Logic, Home Client Component, Supabase Database Schema, LLM Client (OpenCode Zen), Home Page, Word Bank Seeding Script, Service Layer, Session Server Actions (+2 more)

### Community 7 - "Word Bank Seeding"
Cohesion: 0.6
Nodes (4): fetchRaw(), main(), parseLevel(), WordRow

### Community 8 - "Word Detail Page"
Cohesion: 0.67
Nodes (3): getWordCardAction(), getWordCard(), WordDetailPage()

### Community 10 - "Auth Concepts"
Cohesion: 0.67
Nodes (3): Auth Server Actions, Root Layout, User Context Helper

## Knowledge Gaps
- **25 isolated node(s):** `config`, `eslintConfig`, `nextConfig`, `WordRow`, `config` (+20 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getUserContext()` connect `App Pages & Routing` to `Word Detail Page`, `SRS & Stats Logic`, `Vocabulary Feature`, `UI Client Components`?**
  _High betweenness centrality (0.068) - this node is a cross-community bridge._
- **Why does `createClient()` connect `Auth & Layout` to `App Pages & Routing`?**
  _High betweenness centrality (0.056) - this node is a cross-community bridge._
- **Why does `gradeAnswerWithCache()` connect `LLM & Grading` to `SRS & Stats Logic`?**
  _High betweenness centrality (0.009) - this node is a cross-community bridge._
- **What connects `config`, `eslintConfig`, `nextConfig` to the rest of the system?**
  _25 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `UI Client Components` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._