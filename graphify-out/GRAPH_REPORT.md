# Graph Report - chinese-learner  (2026-10-18)

## Corpus Check
- 120 files · ~130,055 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 791 nodes · 1855 edges · 53 communities (40 shown, 13 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 4 edges (avg confidence: 0.82)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `9804b2fb`
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
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 52|Community 52]]

## God Nodes (most connected - your core abstractions)
1. `getUserContext()` - 50 edges
2. `createAdminClient()` - 23 edges
3. `getProfile()` - 18 edges
4. `getProfile()` - 18 edges
5. `Button()` - 16 edges
6. `submitScramble()` - 16 edges
7. `Card()` - 15 edges
8. `Badge()` - 14 edges
9. `Word` - 14 edges
10. `Question` - 14 edges

## Surprising Connections (you probably didn't know these)
- `SRS Leitner Logic` --implements--> `Supabase Database Schema`  [INFERRED]
  src/lib/srs.ts → supabase/migrations/001_initial_schema.sql
- `Service Layer` --implements--> `Supabase Database Schema`  [INFERRED]
  src/lib/services.ts → supabase/migrations/001_initial_schema.sql
- `withVoicedReadings()` --calls--> `buildSoundIndex()`  [EXTRACTED]
  scripts/wordbank-parse.ts → src/lib/spokenReadings.ts
- `fillBatch()` --calls--> `loadBank()`  [EXTRACTED]
  scripts/prewarm-questions.ts → src/lib/questionBank.ts
- `fillBatch()` --calls--> `wordsNeedingQuestions()`  [EXTRACTED]
  scripts/prewarm-questions.ts → src/lib/questionBank.ts

## Communities (53 total, 13 thin omitted)

### Community 0 - "UI Client Components"
Cohesion: 0.06
Nodes (55): gradeAnswerAction(), selfGradeAction(), BOX_INTERVALS, outcomeFor(), pickRequeueQuestion(), currentSrsState(), FinalizedGrade, finalizeGrade() (+47 more)

### Community 1 - "SRS & Stats Logic"
Cohesion: 0.07
Nodes (47): PREFERRED_TYPES_BY_BOX, QUESTION_TYPES, QuestionWordInput, addRows(), Assignment, assignQuestions(), bankedQuestion(), BankQuestion (+39 more)

### Community 2 - "App Pages & Routing"
Cohesion: 0.12
Nodes (34): acceptedTargets(), matchesTarget(), resolveDeterministic(), baseFeedback(), describeWord(), extraLines(), selfGradeVerdict(), templateFeedback() (+26 more)

### Community 3 - "LLM & Grading"
Cohesion: 0.09
Nodes (36): buildGlossQuestion(), fallbackQuestion(), lastResortQuestion(), leakFreeMeanings(), applyChanges(), changesAt(), excludedKeys(), joinPinyin() (+28 more)

### Community 4 - "Vocabulary Feature"
Cohesion: 0.07
Nodes (17): signIn(), signOut(), signUp(), EXTRAS, FEATURES, HSK_LEVELS, STEPS, NAV_LINKS (+9 more)

### Community 5 - "Auth & Layout"
Cohesion: 0.12
Nodes (32): startSessionAction(), generateQuestions(), questionsFrom(), safeGenerateQuestion(), stubQuestions(), advanceCursor(), countSessionItems(), createSession() (+24 more)

### Community 6 - "Architecture Overview"
Cohesion: 0.1
Nodes (26): alignedPairs(), buildSoundIndex(), homophoneFor(), isPolyphone(), SoundIndex, SoundSource, spokenChar(), spokenText() (+18 more)

### Community 7 - "Word Bank Seeding"
Cohesion: 0.16
Nodes (23): dueReviewsAction(), ensureItemQuestionAction(), getInProgressSessionAction(), listSessionsAction(), loadSessionAction(), redrillSessionAction(), reportQuestionAction(), HomePage() (+15 more)

### Community 8 - "Word Detail Page"
Cohesion: 0.16
Nodes (24): recordStudyActivity(), orderCandidates(), pickSeedWords(), shuffleTiles(), applyResult(), applyResults(), buildBoard(), cachedIndexWords (+16 more)

### Community 9 - "Session Proxy"
Cohesion: 0.11
Nodes (20): charCounts(), collectDistractors(), DistractorPools, distractorTiers(), fillFromTier(), fitsBoard(), formableWords(), indexByFirstChar() (+12 more)

### Community 10 - "Auth Concepts"
Cohesion: 0.16
Nodes (20): getProfileAction(), vocabCountAction(), fraunces, geistMono, geistSans, metadata, notoSerifSC, RootLayout() (+12 more)

### Community 11 - "PostCSS Config"
Cohesion: 0.14
Nodes (19): LLM_MAX_RETRIES, LLM_MAX_TOKENS, LLM_TIMEOUT_MS, MAX_TOKENS_BY_PURPOSE, MODEL_BY_PURPOSE, q, chat(), chatJson() (+11 more)

### Community 12 - "ESLint Config"
Cohesion: 0.2
Nodes (19): addWordsToBankAction(), getWordCardAction(), regenerateWordCardAction(), exampleRule(), generateLessonCard(), stubLessonCard(), addWordsToBank(), ensureLessonCard() (+11 more)

### Community 13 - "Next.js Config"
Cohesion: 0.12
Nodes (15): startSessionWithWordsAction(), BadgeVariant, Bento(), ButtonProps, ButtonSize, ButtonVariant, CardProps, InkLoader() (+7 more)

### Community 14 - "Supabase Browser Client"
Cohesion: 0.12
Nodes (10): updateHskLevelAction(), HSK_LEVELS, HskLevelPicker(), persistLevel(), Status, useSaveLevel(), LedgerHeading(), capLabel() (+2 more)

### Community 15 - "Next Env Types"
Cohesion: 0.13
Nodes (8): Card(), Profile, HSK_CN, canAccessAdmin(), HSK_LABELS, Props, SettingsClient(), usageCap()

### Community 16 - "PostCSS (concept)"
Cohesion: 0.11
Nodes (18): Architecture, code:bash (# 1. Clone), code:bash (git checkout local), code:bash (git show local:README.md), Deploy on Vercel, Enable asymmetric JWT signing keys (recommended), Environment variables, Getting Started (+10 more)

### Community 17 - "ESLint (concept)"
Cohesion: 0.3
Nodes (10): AdminUser, deleteUserAction(), listUsersAction(), requireAdmin(), setUserLimitsAction(), setUserRoleAction(), setUserUnlimitedAction(), Props (+2 more)

### Community 18 - "Next Config (concept)"
Cohesion: 0.19
Nodes (10): Card, exampleReadings(), hasTaggedExamples(), missingExampleReadings(), needsReadingExamples(), readings, coversReadings(), missingReadingsNote() (+2 more)

### Community 19 - "README"
Cohesion: 0.18
Nodes (9): SpeakWord(), SpokenWord, Skeleton(), OVER_TIMER_MS_BY_TYPE, hasMultipleReadings(), CardLoadingSkeleton(), StudySessionClient(), timerSecondsFor() (+1 more)

### Community 20 - "Project Overview"
Cohesion: 0.16
Nodes (7): ContextHelper, DueReviews, GraderOutput, Outcome, SessionItem, SessionSummary, Supabase

### Community 21 - "Auth Proxy (concept)"
Cohesion: 0.15
Nodes (7): buildDistractorPools(), IndexedWord, index, options, result, withMeaningOptions(), MeaningPickerProps

### Community 22 - "Domain Types"
Cohesion: 0.17
Nodes (4): SpeakButtonProps, SrsState, fmtNextReview(), WordCardClient()

### Community 23 - "Community 23"
Cohesion: 0.22
Nodes (7): formatReadingsPinyin(), HSK_FILTER_LABELS, hskBadgeVariant(), VocabWord, wordBadgeLabel(), wordBadgeVariant(), WordRow()

### Community 24 - "Community 24"
Cohesion: 0.15
Nodes (12): Chinese Learner — Next.js on Vercel, code:block1 (npm install), code:block2 (git show local:src/learner/<file>.py), Dev, Environment, graphify, Key directories, Manual step — enable asymmetric JWT signing keys (+4 more)

### Community 25 - "Community 25"
Cohesion: 0.15
Nodes (12): Chinese Learner — Next.js on Vercel, code:block1 (npm install), code:block2 (git show local:src/learner/<file>.py), Dev, Environment, graphify, Key directories, Manual step — enable asymmetric JWT signing keys (+4 more)

### Community 26 - "Community 26"
Cohesion: 0.24
Nodes (9): startScrambleAction(), submitScrambleAction(), Difficulty, isDifficulty(), pointsFor(), WordChoice, WordResult, Phase (+1 more)

### Community 27 - "Community 27"
Cohesion: 0.2
Nodes (7): DIFFICULTIES, DIFFICULTY_ORDER, IntroCardProps, ScrambleClient(), selectionText(), Miss, useScrambleGame()

### Community 28 - "Community 28"
Cohesion: 0.29
Nodes (9): BoardWord, buildWordIndex(), levelPools(), ScrambleBoard, charCounts(), fitsTiles(), hasPlayableWord(), makeLookups() (+1 more)

### Community 29 - "Community 29"
Cohesion: 0.4
Nodes (8): listAddableWordsAction(), listVocabularyAction(), listAddableWords(), listVocabulary(), listAddableWords(), listVocabulary(), StudyPage(), VocabularyPage()

### Community 30 - "Community 30"
Cohesion: 0.2
Nodes (3): NAV, QUICK, WEEKDAYS_CN

### Community 31 - "Community 31"
Cohesion: 0.27
Nodes (10): Grading & Cache Logic, Home Client Component, Supabase Database Schema, LLM Client (OpenCode Zen), Home Page, Word Bank Seeding Script, Service Layer, Session Server Actions (+2 more)

### Community 32 - "Community 32"
Cohesion: 0.32
Nodes (4): Badge(), FoundWord, FoundWord, ScrambleSummaryProps

### Community 33 - "Community 33"
Cohesion: 0.33
Nodes (6): getStatsAction(), dueReviews(), getStats(), checkProgression(), countDue(), StatsPage()

### Community 34 - "Community 34"
Cohesion: 0.29
Nodes (3): Button(), SelfGradePanelProps, ToneOptionsProps

### Community 36 - "Community 36"
Cohesion: 0.4
Nodes (4): Tile, idleTone(), tileClass(), TileGridProps

### Community 38 - "Community 38"
Cohesion: 0.5
Nodes (3): Assets (in this folder), LinkedIn Post — 汉字 Chinese Learner, Post

### Community 40 - "Community 40"
Cohesion: 0.67
Nodes (3): Auth Server Actions, Root Layout, User Context Helper

## Knowledge Gaps
- **156 isolated node(s):** `config`, `eslintConfig`, `nextConfig`, `Reading`, `WordRow` (+151 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **13 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getUserContext()` connect `Word Bank Seeding` to `UI Client Components`, `Community 33`, `Auth & Layout`, `Auth Concepts`, `ESLint Config`, `Next.js Config`, `Supabase Browser Client`, `ESLint (concept)`, `Community 26`, `Community 29`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **Why does `Question` connect `App Pages & Routing` to `UI Client Components`, `SRS & Stats Logic`, `LLM & Grading`, `Auth & Layout`, `PostCSS Config`, `README`, `Project Overview`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **Why does `Word` connect `ESLint Config` to `UI Client Components`, `SRS & Stats Logic`, `App Pages & Routing`, `LLM & Grading`, `Auth & Layout`, `Next.js Config`, `README`, `Project Overview`, `Domain Types`, `Community 23`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **What connects `config`, `eslintConfig`, `nextConfig` to the rest of the system?**
  _156 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `UI Client Components` be split into smaller, more focused modules?**
  _Cohesion score 0.06 - nodes in this community are weakly interconnected._
- **Should `SRS & Stats Logic` be split into smaller, more focused modules?**
  _Cohesion score 0.07 - nodes in this community are weakly interconnected._
- **Should `App Pages & Routing` be split into smaller, more focused modules?**
  _Cohesion score 0.12 - nodes in this community are weakly interconnected._