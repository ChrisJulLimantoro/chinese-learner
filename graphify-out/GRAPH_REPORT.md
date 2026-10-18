# Graph Report - chinese-learner  (2026-10-19)

## Corpus Check
- 139 files · ~132,491 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 885 nodes · 2109 edges · 49 communities (35 shown, 14 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 5 edges (avg confidence: 0.82)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `e99b591e`
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
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]

## God Nodes (most connected - your core abstractions)
1. `getUserContext()` - 53 edges
2. `createAdminClient()` - 27 edges
3. `Button()` - 18 edges
4. `getProfile()` - 18 edges
5. `getProfile()` - 18 edges
6. `submitScramble()` - 16 edges
7. `Question` - 16 edges
8. `Card()` - 15 edges
9. `getUserLlmKey()` - 15 edges
10. `Badge()` - 14 edges

## Surprising Connections (you probably didn't know these)
- `fillBatch()` --calls--> `fillPool()`  [INFERRED]
  scripts/prewarm-questions.ts → src/lib/questionBank.ts
- `SRS Leitner Logic` --implements--> `Supabase Database Schema`  [INFERRED]
  src/lib/srs.ts → supabase/migrations/001_initial_schema.sql
- `Service Layer` --implements--> `Supabase Database Schema`  [INFERRED]
  src/lib/services.ts → supabase/migrations/001_initial_schema.sql
- `withVoicedReadings()` --calls--> `buildSoundIndex()`  [EXTRACTED]
  scripts/wordbank-parse.ts → src/lib/spokenReadings.ts
- `fillBatch()` --calls--> `loadBank()`  [EXTRACTED]
  scripts/prewarm-questions.ts → src/lib/questionBank.ts

## Communities (49 total, 14 thin omitted)

### Community 0 - "UI Client Components"
Cohesion: 0.05
Nodes (55): addWordsToBankAction(), getWordCardAction(), listAddableWordsAction(), listVocabularyAction(), regenerateWordCardAction(), SpeakButtonProps, SpeakWord(), SpokenWord (+47 more)

### Community 1 - "SRS & Stats Logic"
Cohesion: 0.05
Nodes (72): PREFERRED_TYPES_BY_BOX, QUESTION_TYPES, addRows(), Assignment, assignQuestions(), bankedQuestion(), BankQuestion, BankRow (+64 more)

### Community 2 - "App Pages & Routing"
Cohesion: 0.06
Nodes (55): BOX_INTERVALS, outcomeFor(), pickRequeueQuestion(), currentSrsState(), currentSrsState(), ensureItemQuestion(), FinalizedGrade, finalizeGrade() (+47 more)

### Community 3 - "LLM & Grading"
Cohesion: 0.05
Nodes (21): signIn(), signOut(), signUp(), EXTRAS, FEATURES, HSK_LEVELS, STEPS, NAV_LINKS (+13 more)

### Community 4 - "Vocabulary Feature"
Cohesion: 0.09
Nodes (35): removeByokKeyAction(), saveByokKeyAction(), decryptWith(), encryptWith(), parseSecret(), flipped, [iv, tag, body], secret (+27 more)

### Community 5 - "Auth & Layout"
Cohesion: 0.09
Nodes (36): LLM_MAX_RETRIES, LLM_MAX_TOKENS, LLM_TIMEOUT_MS, MAX_TOKENS_BY_PURPOSE, MODEL_BY_PURPOSE, OVER_TIMER_MS_BY_TYPE, q, missingExampleReadings() (+28 more)

### Community 6 - "Architecture Overview"
Cohesion: 0.12
Nodes (33): acceptedTargets(), matchesTarget(), resolveDeterministic(), baseFeedback(), describeWord(), extraLines(), selfGradeVerdict(), templateFeedback() (+25 more)

### Community 7 - "Word Bank Seeding"
Cohesion: 0.1
Nodes (26): alignedPairs(), buildSoundIndex(), homophoneFor(), isPolyphone(), SoundIndex, SoundSource, spokenChar(), spokenText() (+18 more)

### Community 8 - "Word Detail Page"
Cohesion: 0.12
Nodes (31): ensureItemQuestionAction(), generateQuestions(), questionsFrom(), safeGenerateQuestion(), stubQuestions(), applyResult(), advanceCursor(), countSessionItems() (+23 more)

### Community 9 - "Session Proxy"
Cohesion: 0.14
Nodes (23): dueReviewsAction(), getInProgressSessionAction(), gradeAnswerAction(), listSessionsAction(), loadSessionAction(), redrillSessionAction(), reportQuestionAction(), selfGradeAction() (+15 more)

### Community 10 - "Auth Concepts"
Cohesion: 0.11
Nodes (26): applyChanges(), changesAt(), excludedKeys(), joinPinyin(), LOWER_TONE_MARKS, MARKED, markIndex(), otherTones() (+18 more)

### Community 11 - "PostCSS Config"
Cohesion: 0.12
Nodes (16): Badge(), DIFFICULTIES, Difficulty, DIFFICULTY_ORDER, IndexedWord, pointsFor(), FoundWord, IntroCardProps (+8 more)

### Community 12 - "ESLint Config"
Cohesion: 0.16
Nodes (24): recordStudyActivity(), orderCandidates(), pickSeedWords(), shuffleTiles(), applyResults(), buildBoard(), cachedIndexWords, completeRun() (+16 more)

### Community 13 - "Next.js Config"
Cohesion: 0.11
Nodes (20): charCounts(), collectDistractors(), DistractorPools, distractorTiers(), fillFromTier(), fitsBoard(), formableWords(), indexByFirstChar() (+12 more)

### Community 14 - "Supabase Browser Client"
Cohesion: 0.11
Nodes (18): Architecture, code:bash (# 1. Clone), code:bash (git checkout local), code:bash (git show local:README.md), Deploy on Vercel, Enable asymmetric JWT signing keys (recommended), Environment variables, Getting Started (+10 more)

### Community 15 - "Next Env Types"
Cohesion: 0.23
Nodes (15): getProfileAction(), vocabCountAction(), RootLayout(), assertSessionCapAvailable(), countSessions(), getProfile(), getSessionCap(), getVocabCap() (+7 more)

### Community 16 - "PostCSS (concept)"
Cohesion: 0.12
Nodes (7): NAV, QUICK, WEEKDAYS_CN, Bento(), PageHeader(), DueReviews, Stats

### Community 17 - "ESLint (concept)"
Cohesion: 0.3
Nodes (10): AdminUser, deleteUserAction(), listUsersAction(), requireAdmin(), setUserLimitsAction(), setUserRoleAction(), setUserUnlimitedAction(), Props (+2 more)

### Community 18 - "Next Config (concept)"
Cohesion: 0.16
Nodes (8): BadgeVariant, Button(), ButtonProps, ButtonSize, ButtonVariant, CardProps, SelfGradePanelProps, ToneOptionsProps

### Community 19 - "README"
Cohesion: 0.15
Nodes (9): buildDistractorPools(), index, options, result, Tile, withMeaningOptions(), idleTone(), tileClass() (+1 more)

### Community 20 - "Project Overview"
Cohesion: 0.19
Nodes (7): Profile, HSK_CN, canAccessAdmin(), HSK_LABELS, Props, SettingsClient(), usageCap()

### Community 21 - "Auth Proxy (concept)"
Cohesion: 0.15
Nodes (12): Chinese Learner — Next.js on Vercel, code:block1 (npm install), code:block2 (git show local:src/learner/<file>.py), Dev, Environment, graphify, Key directories, Manual step — enable asymmetric JWT signing keys (+4 more)

### Community 22 - "Domain Types"
Cohesion: 0.15
Nodes (12): Chinese Learner — Next.js on Vercel, code:block1 (npm install), code:block2 (git show local:src/learner/<file>.py), Dev, Environment, graphify, Key directories, Manual step — enable asymmetric JWT signing keys (+4 more)

### Community 23 - "Community 23"
Cohesion: 0.18
Nodes (6): ProgressBar(), TYPE_LABELS, Session, ScrambleTimer(), ScrambleTimerProps, timerColor()

### Community 24 - "Community 24"
Cohesion: 0.29
Nodes (8): fraunces, geistMono, geistSans, metadata, notoSerifSC, getCachedClaims, getOptionalUser(), createClient()

### Community 25 - "Community 25"
Cohesion: 0.32
Nodes (10): buildGlossQuestion(), fallbackQuestion(), lastResortQuestion(), leakFreeMeanings(), shortMeaning(), shuffle(), swap(), toIndexedWord() (+2 more)

### Community 26 - "Community 26"
Cohesion: 0.24
Nodes (6): updateHskLevelAction(), HSK_LEVELS, HskLevelPicker(), persistLevel(), Status, useSaveLevel()

### Community 27 - "Community 27"
Cohesion: 0.29
Nodes (9): BoardWord, buildWordIndex(), levelPools(), ScrambleBoard, charCounts(), fitsTiles(), hasPlayableWord(), makeLookups() (+1 more)

### Community 28 - "Community 28"
Cohesion: 0.27
Nodes (10): Grading & Cache Logic, Home Client Component, Supabase Database Schema, LLM Client (OpenCode Zen), Home Page, Word Bank Seeding Script, Service Layer, Session Server Actions (+2 more)

### Community 30 - "Community 30"
Cohesion: 0.33
Nodes (6): getStatsAction(), dueReviews(), getStats(), checkProgression(), countDue(), StatsPage()

### Community 32 - "Community 32"
Cohesion: 0.4
Nodes (5): startScrambleAction(), submitScrambleAction(), isDifficulty(), WordChoice, WordResult

### Community 34 - "Community 34"
Cohesion: 0.5
Nodes (3): Assets (in this folder), LinkedIn Post — 汉字 Chinese Learner, Post

### Community 36 - "Community 36"
Cohesion: 0.67
Nodes (3): Auth Server Actions, Root Layout, User Context Helper

## Knowledge Gaps
- **165 isolated node(s):** `config`, `eslintConfig`, `nextConfig`, `Reading`, `WordRow` (+160 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **14 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getUserContext()` connect `Session Proxy` to `UI Client Components`, `Community 32`, `Vocabulary Feature`, `Word Detail Page`, `Next Env Types`, `ESLint (concept)`, `Community 24`, `Community 26`, `Community 30`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **Why does `createAdminClient()` connect `ESLint (concept)` to `UI Client Components`, `App Pages & Routing`, `Vocabulary Feature`, `Architecture Overview`, `Word Detail Page`, `ESLint Config`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **Why does `Button()` connect `Next Config (concept)` to `UI Client Components`, `Vocabulary Feature`, `Session Proxy`, `PostCSS Config`, `PostCSS (concept)`, `ESLint (concept)`, `Project Overview`, `Community 23`, `Community 26`, `Community 29`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **What connects `config`, `eslintConfig`, `nextConfig` to the rest of the system?**
  _165 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `UI Client Components` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._
- **Should `SRS & Stats Logic` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._
- **Should `App Pages & Routing` be split into smaller, more focused modules?**
  _Cohesion score 0.06 - nodes in this community are weakly interconnected._