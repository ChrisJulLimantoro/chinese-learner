# Graph Report - chinese-learner  (2026-10-18)

## Corpus Check
- 108 files · ~127,934 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 687 nodes · 1651 edges · 42 communities (31 shown, 11 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 4 edges (avg confidence: 0.82)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `fc9255f3`
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
- [[_COMMUNITY_Domain Types|Domain Types]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]

## God Nodes (most connected - your core abstractions)
1. `getUserContext()` - 50 edges
2. `createAdminClient()` - 23 edges
3. `getProfile()` - 18 edges
4. `getProfile()` - 18 edges
5. `submitScramble()` - 16 edges
6. `Button()` - 15 edges
7. `Card()` - 14 edges
8. `Question` - 14 edges
9. `gradeAnswerWithCache()` - 14 edges
10. `startScramble()` - 13 edges

## Surprising Connections (you probably didn't know these)
- `SRS Leitner Logic` --implements--> `Supabase Database Schema`  [INFERRED]
  src/lib/srs.ts → supabase/migrations/001_initial_schema.sql
- `Service Layer` --implements--> `Supabase Database Schema`  [INFERRED]
  src/lib/services.ts → supabase/migrations/001_initial_schema.sql
- `fillBatch()` --calls--> `loadBank()`  [EXTRACTED]
  scripts/prewarm-questions.ts → src/lib/questionBank.ts
- `fillBatch()` --calls--> `wordsNeedingQuestions()`  [EXTRACTED]
  scripts/prewarm-questions.ts → src/lib/questionBank.ts
- `fillBatch()` --calls--> `fillBank()`  [EXTRACTED]
  scripts/prewarm-questions.ts → src/lib/questionBank.ts

## Communities (42 total, 11 thin omitted)

### Community 0 - "UI Client Components"
Cohesion: 0.05
Nodes (71): startScrambleAction(), submitScrambleAction(), recordStudyActivity(), BoardWord, buildDistractorPools(), buildWordIndex(), charCounts(), collectDistractors() (+63 more)

### Community 1 - "SRS & Stats Logic"
Cohesion: 0.06
Nodes (55): gradeAnswerAction(), selfGradeAction(), BOX_INTERVALS, outcomeFor(), currentSrsState(), currentSrsState(), FinalizedGrade, finalizeGrade() (+47 more)

### Community 2 - "App Pages & Routing"
Cohesion: 0.06
Nodes (55): PREFERRED_TYPES_BY_BOX, buildGlossQuestion(), fallbackQuestion(), lastResortQuestion(), leakFreeMeanings(), QUESTION_TYPES, QuestionWordInput, addRows() (+47 more)

### Community 3 - "LLM & Grading"
Cohesion: 0.12
Nodes (34): acceptedTargets(), matchesTarget(), resolveDeterministic(), baseFeedback(), describeWord(), extraLines(), selfGradeVerdict(), templateFeedback() (+26 more)

### Community 4 - "Vocabulary Feature"
Cohesion: 0.12
Nodes (33): generateQuestions(), safeGenerateQuestion(), stubQuestions(), assignQuestions(), applyResult(), advanceCursor(), countSessionItems(), createSession() (+25 more)

### Community 5 - "Auth & Layout"
Cohesion: 0.11
Nodes (26): applyChanges(), changesAt(), excludedKeys(), joinPinyin(), LOWER_TONE_MARKS, MARKED, markIndex(), otherTones() (+18 more)

### Community 6 - "Architecture Overview"
Cohesion: 0.1
Nodes (10): signIn(), signOut(), signUp(), EXTRAS, FEATURES, HSK_LEVELS, STEPS, NAV_LINKS (+2 more)

### Community 7 - "Word Bank Seeding"
Cohesion: 0.14
Nodes (18): LLM_MAX_RETRIES, LLM_MAX_TOKENS, LLM_TIMEOUT_MS, MAX_TOKENS_BY_PURPOSE, MODEL_BY_PURPOSE, q, chat(), chatJson() (+10 more)

### Community 8 - "Word Detail Page"
Cohesion: 0.22
Nodes (19): addWordsToBankAction(), getWordCardAction(), regenerateWordCardAction(), vocabCountAction(), generateLessonCard(), addWordsToBank(), ensureLessonCard(), getWordCard() (+11 more)

### Community 9 - "Session Proxy"
Cohesion: 0.15
Nodes (15): getProfileAction(), updateHskLevelAction(), loadSessionAction(), getStatsAction(), SessionDetailPage(), getStats(), loadSession(), checkProgression() (+7 more)

### Community 10 - "Auth Concepts"
Cohesion: 0.13
Nodes (14): BadgeVariant, Bento(), ButtonProps, ButtonSize, ButtonVariant, CardProps, InkLoader(), PageHeader() (+6 more)

### Community 11 - "PostCSS Config"
Cohesion: 0.11
Nodes (6): redrillSessionAction(), NAV, QUICK, WEEKDAYS_CN, DueReviews, SessionSummary

### Community 12 - "ESLint Config"
Cohesion: 0.11
Nodes (18): Architecture, code:bash (# 1. Clone), code:bash (git checkout local), code:bash (git show local:README.md), Deploy on Vercel, Enable asymmetric JWT signing keys (recommended), Environment variables, Getting Started (+10 more)

### Community 13 - "Next.js Config"
Cohesion: 0.19
Nodes (14): listSessionsAction(), fraunces, geistMono, geistSans, metadata, notoSerifSC, RootLayout(), HomePage() (+6 more)

### Community 14 - "Supabase Browser Client"
Cohesion: 0.14
Nodes (8): Button(), OVER_TIMER_MS_BY_TYPE, SelfGradePanelProps, CardLoadingSkeleton(), StudySessionClient(), timerSecondsFor(), TYPE_LABELS, ToneOptionsProps

### Community 15 - "Next Env Types"
Cohesion: 0.17
Nodes (9): TYPE_LABELS, GraderOutput, LessonCard, Outcome, Reading, Session, SessionItem, Supabase (+1 more)

### Community 16 - "PostCSS (concept)"
Cohesion: 0.15
Nodes (12): dueReviewsAction(), ensureItemQuestionAction(), getInProgressSessionAction(), reportQuestionAction(), dueReviews(), getInProgressSession(), reportQuestion(), ensureItemQuestion() (+4 more)

### Community 17 - "ESLint (concept)"
Cohesion: 0.3
Nodes (10): AdminUser, deleteUserAction(), listUsersAction(), requireAdmin(), setUserLimitsAction(), setUserRoleAction(), setUserUnlimitedAction(), Props (+2 more)

### Community 18 - "Next Config (concept)"
Cohesion: 0.14
Nodes (8): startSessionAction(), startSessionWithWordsAction(), Badge(), Card(), MeaningPickerProps, FoundWord, ScrambleSummaryProps, VocabWord

### Community 19 - "README"
Cohesion: 0.26
Nodes (11): main(), fetchRaw(), main(), parseLevel(), Reading, WordRow, fetchRaw(), parseLevel() (+3 more)

### Community 20 - "Project Overview"
Cohesion: 0.22
Nodes (8): formatReadingsPinyin(), hasMultipleReadings(), HSK_FILTER_LABELS, hskBadgeVariant(), VocabWord, wordBadgeLabel(), wordBadgeVariant(), WordRow()

### Community 21 - "Auth Proxy (concept)"
Cohesion: 0.15
Nodes (12): Chinese Learner — Next.js on Vercel, code:block1 (npm install), code:block2 (git show local:src/learner/<file>.py), Dev, Environment, graphify, Key directories, Manual step — enable asymmetric JWT signing keys (+4 more)

### Community 22 - "Domain Types"
Cohesion: 0.15
Nodes (12): Chinese Learner — Next.js on Vercel, code:block1 (npm install), code:block2 (git show local:src/learner/<file>.py), Dev, Environment, graphify, Key directories, Manual step — enable asymmetric JWT signing keys (+4 more)

### Community 23 - "Community 23"
Cohesion: 0.18
Nodes (3): SrsState, fmtNextReview(), WordCardClient()

### Community 24 - "Community 24"
Cohesion: 0.4
Nodes (8): listAddableWordsAction(), listVocabularyAction(), listAddableWords(), listVocabulary(), listAddableWords(), listVocabulary(), StudyPage(), VocabularyPage()

### Community 25 - "Community 25"
Cohesion: 0.27
Nodes (10): Grading & Cache Logic, Home Client Component, Supabase Database Schema, LLM Client (OpenCode Zen), Home Page, Word Bank Seeding Script, Service Layer, Session Server Actions (+2 more)

### Community 26 - "Community 26"
Cohesion: 0.52
Nodes (6): assertSessionCapAvailable(), countSessions(), getSessionCap(), getVocabCap(), isUnlimited(), sessionLimitMessage()

### Community 27 - "Community 27"
Cohesion: 0.5
Nodes (3): Assets (in this folder), LinkedIn Post — 汉字 Chinese Learner, Post

### Community 29 - "Community 29"
Cohesion: 0.67
Nodes (3): Auth Server Actions, Root Layout, User Context Helper

## Knowledge Gaps
- **139 isolated node(s):** `config`, `eslintConfig`, `nextConfig`, `Reading`, `WordRow` (+134 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getUserContext()` connect `Session Proxy` to `UI Client Components`, `SRS & Stats Logic`, `Word Detail Page`, `PostCSS Config`, `Next.js Config`, `PostCSS (concept)`, `ESLint (concept)`, `Next Config (concept)`, `Community 24`?**
  _High betweenness centrality (0.034) - this node is a cross-community bridge._
- **Why does `Question` connect `LLM & Grading` to `SRS & Stats Logic`, `App Pages & Routing`, `Vocabulary Feature`, `Word Bank Seeding`, `Supabase Browser Client`, `Next Env Types`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **Why does `Word` connect `Next Env Types` to `SRS & Stats Logic`, `App Pages & Routing`, `LLM & Grading`, `Vocabulary Feature`, `Word Detail Page`, `Next Config (concept)`, `Project Overview`, `Community 23`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **What connects `config`, `eslintConfig`, `nextConfig` to the rest of the system?**
  _139 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `UI Client Components` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._
- **Should `SRS & Stats Logic` be split into smaller, more focused modules?**
  _Cohesion score 0.06 - nodes in this community are weakly interconnected._
- **Should `App Pages & Routing` be split into smaller, more focused modules?**
  _Cohesion score 0.06 - nodes in this community are weakly interconnected._