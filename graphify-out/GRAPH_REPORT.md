# Graph Report - chinese-learner  (2026-10-18)

## Corpus Check
- 116 files · ~129,393 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 761 nodes · 1804 edges · 47 communities (32 shown, 15 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 4 edges (avg confidence: 0.82)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `b4942400`
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
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]

## God Nodes (most connected - your core abstractions)
1. `getUserContext()` - 50 edges
2. `createAdminClient()` - 23 edges
3. `getProfile()` - 18 edges
4. `getProfile()` - 18 edges
5. `submitScramble()` - 16 edges
6. `Card()` - 15 edges
7. `Button()` - 15 edges
8. `Word` - 14 edges
9. `Question` - 14 edges
10. `gradeAnswerWithCache()` - 14 edges

## Surprising Connections (you probably didn't know these)
- `fillBatch()` --calls--> `loadBank()`  [EXTRACTED]
  scripts/prewarm-questions.ts → src/lib/questionBank.ts
- `fillBatch()` --calls--> `fillBank()`  [EXTRACTED]
  scripts/prewarm-questions.ts → src/lib/questionBank.ts
- `SRS Leitner Logic` --implements--> `Supabase Database Schema`  [INFERRED]
  src/lib/srs.ts → supabase/migrations/001_initial_schema.sql
- `Service Layer` --implements--> `Supabase Database Schema`  [INFERRED]
  src/lib/services.ts → supabase/migrations/001_initial_schema.sql
- `withVoicedReadings()` --calls--> `buildSoundIndex()`  [EXTRACTED]
  scripts/wordbank-parse.ts → src/lib/spokenReadings.ts

## Communities (47 total, 15 thin omitted)

### Community 0 - "UI Client Components"
Cohesion: 0.05
Nodes (99): getProfileAction(), updateHskLevelAction(), dueReviewsAction(), getInProgressSessionAction(), listSessionsAction(), loadSessionAction(), redrillSessionAction(), reportQuestionAction() (+91 more)

### Community 1 - "SRS & Stats Logic"
Cohesion: 0.06
Nodes (57): ensureItemQuestionAction(), gradeAnswerAction(), selfGradeAction(), BOX_INTERVALS, outcomeFor(), pickRequeueQuestion(), currentSrsState(), ensureItemQuestion() (+49 more)

### Community 2 - "App Pages & Routing"
Cohesion: 0.09
Nodes (41): AdminUser, deleteUserAction(), listUsersAction(), requireAdmin(), setUserLimitsAction(), setUserRoleAction(), setUserUnlimitedAction(), Props (+33 more)

### Community 3 - "LLM & Grading"
Cohesion: 0.06
Nodes (17): signIn(), signOut(), signUp(), EXTRAS, FEATURES, HSK_LEVELS, STEPS, NAV_LINKS (+9 more)

### Community 4 - "Vocabulary Feature"
Cohesion: 0.07
Nodes (34): Card, exampleReadings(), hasTaggedExamples(), missingExampleReadings(), needsReadingExamples(), readings, coversReadings(), missingReadingsNote() (+26 more)

### Community 5 - "Auth & Layout"
Cohesion: 0.1
Nodes (26): alignedPairs(), buildSoundIndex(), homophoneFor(), isPolyphone(), SoundIndex, SoundSource, spokenChar(), spokenText() (+18 more)

### Community 6 - "Architecture Overview"
Cohesion: 0.11
Nodes (25): LLM_MAX_RETRIES, LLM_MAX_TOKENS, LLM_TIMEOUT_MS, MAX_TOKENS_BY_PURPOSE, MODEL_BY_PURPOSE, PREFERRED_TYPES_BY_BOX, q, chat() (+17 more)

### Community 7 - "Word Bank Seeding"
Cohesion: 0.15
Nodes (26): recordStudyActivity(), orderCandidates(), pickSeedWords(), shuffleTiles(), applyResult(), applyResults(), buildBoard(), cachedIndexWords (+18 more)

### Community 8 - "Word Detail Page"
Cohesion: 0.13
Nodes (23): Assignment, bankedQuestion(), BankQuestion, BankRow, bankSize(), BoxByWord, cleanAnswers(), countByType() (+15 more)

### Community 9 - "Session Proxy"
Cohesion: 0.11
Nodes (20): charCounts(), collectDistractors(), DistractorPools, distractorTiers(), fillFromTier(), fitsBoard(), formableWords(), indexByFirstChar() (+12 more)

### Community 10 - "Auth Concepts"
Cohesion: 0.12
Nodes (16): BadgeVariant, Bento(), ButtonProps, ButtonSize, ButtonVariant, Card(), CardProps, InkLoader() (+8 more)

### Community 11 - "PostCSS Config"
Cohesion: 0.11
Nodes (18): Architecture, code:bash (# 1. Clone), code:bash (git checkout local), code:bash (git show local:README.md), Deploy on Vercel, Enable asymmetric JWT signing keys (recommended), Environment variables, Getting Started (+10 more)

### Community 12 - "ESLint Config"
Cohesion: 0.22
Nodes (10): SpeakWord(), SpokenWord, hasMultipleReadings(), LessonCard, Reading, SrsState, Supabase, Word (+2 more)

### Community 13 - "Next.js Config"
Cohesion: 0.13
Nodes (9): Button(), OVER_TIMER_MS_BY_TYPE, SessionItem, SelfGradePanelProps, CardLoadingSkeleton(), StudySessionClient(), timerSecondsFor(), TYPE_LABELS (+1 more)

### Community 14 - "Supabase Browser Client"
Cohesion: 0.18
Nodes (16): generateQuestions(), safeGenerateQuestion(), stubQuestions(), addRows(), assignQuestions(), chunked(), fillBank(), fillBankQuietly() (+8 more)

### Community 15 - "Next Env Types"
Cohesion: 0.27
Nodes (12): buildGlossQuestion(), fallbackQuestion(), lastResortQuestion(), leakFreeMeanings(), questionFor(), shortMeaning(), shuffle(), swap() (+4 more)

### Community 16 - "PostCSS (concept)"
Cohesion: 0.15
Nodes (9): buildDistractorPools(), index, options, result, Tile, withMeaningOptions(), idleTone(), tileClass() (+1 more)

### Community 17 - "ESLint (concept)"
Cohesion: 0.18
Nodes (8): DIFFICULTIES, Difficulty, DIFFICULTY_ORDER, IntroCardProps, ScrambleClient(), selectionText(), Miss, useScrambleGame()

### Community 18 - "Next Config (concept)"
Cohesion: 0.15
Nodes (12): Chinese Learner — Next.js on Vercel, code:block1 (npm install), code:block2 (git show local:src/learner/<file>.py), Dev, Environment, graphify, Key directories, Manual step — enable asymmetric JWT signing keys (+4 more)

### Community 19 - "README"
Cohesion: 0.15
Nodes (12): Chinese Learner — Next.js on Vercel, code:block1 (npm install), code:block2 (git show local:src/learner/<file>.py), Dev, Environment, graphify, Key directories, Manual step — enable asymmetric JWT signing keys (+4 more)

### Community 20 - "Project Overview"
Cohesion: 0.2
Nodes (5): IndexedWord, FoundWord, MeaningPickerProps, FoundWord, ScrambleSummaryProps

### Community 21 - "Auth Proxy (concept)"
Cohesion: 0.25
Nodes (7): formatReadingsPinyin(), HSK_FILTER_LABELS, hskBadgeVariant(), VocabWord, wordBadgeLabel(), wordBadgeVariant(), WordRow()

### Community 22 - "Domain Types"
Cohesion: 0.18
Nodes (4): NAV, QUICK, WEEKDAYS_CN, DueReviews

### Community 23 - "Community 23"
Cohesion: 0.27
Nodes (8): startScrambleAction(), submitScrambleAction(), isDifficulty(), pointsFor(), WordChoice, WordResult, Phase, PickerState

### Community 24 - "Community 24"
Cohesion: 0.33
Nodes (9): QuestionBank, wordsNeedingQuestions(), chunk(), createAdmin(), fetchWordPage(), fetchWords(), fillBatch(), main() (+1 more)

### Community 25 - "Community 25"
Cohesion: 0.29
Nodes (9): BoardWord, buildWordIndex(), levelPools(), ScrambleBoard, charCounts(), fitsTiles(), hasPlayableWord(), makeLookups() (+1 more)

### Community 26 - "Community 26"
Cohesion: 0.27
Nodes (10): Grading & Cache Logic, Home Client Component, Supabase Database Schema, LLM Client (OpenCode Zen), Home Page, Word Bank Seeding Script, Service Layer, Session Server Actions (+2 more)

### Community 30 - "Community 30"
Cohesion: 0.33
Nodes (6): Badge(), Profile, canAccessAdmin(), HSK_LABELS, Props, SettingsClient()

### Community 32 - "Community 32"
Cohesion: 0.5
Nodes (3): Assets (in this folder), LinkedIn Post — 汉字 Chinese Learner, Post

### Community 34 - "Community 34"
Cohesion: 0.67
Nodes (3): Auth Server Actions, Root Layout, User Context Helper

## Knowledge Gaps
- **150 isolated node(s):** `config`, `eslintConfig`, `nextConfig`, `Reading`, `WordRow` (+145 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **15 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getUserContext()` connect `UI Client Components` to `SRS & Stats Logic`, `App Pages & Routing`, `Community 23`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **Why does `Word` connect `ESLint Config` to `UI Client Components`, `SRS & Stats Logic`, `App Pages & Routing`, `Word Detail Page`, `Auth Concepts`, `Next Env Types`, `Auth Proxy (concept)`, `Community 24`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **Why does `Question` connect `Next Env Types` to `UI Client Components`, `SRS & Stats Logic`, `App Pages & Routing`, `Architecture Overview`, `Word Detail Page`, `ESLint Config`, `Next.js Config`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **What connects `config`, `eslintConfig`, `nextConfig` to the rest of the system?**
  _150 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `UI Client Components` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._
- **Should `SRS & Stats Logic` be split into smaller, more focused modules?**
  _Cohesion score 0.06 - nodes in this community are weakly interconnected._
- **Should `App Pages & Routing` be split into smaller, more focused modules?**
  _Cohesion score 0.09 - nodes in this community are weakly interconnected._