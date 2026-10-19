# Graph Report - chinese-learner  (2026-10-19)

## Corpus Check
- 145 files · ~133,142 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 915 nodes · 2174 edges · 57 communities (44 shown, 13 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 5 edges (avg confidence: 0.82)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `bc19b294`
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
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 53|Community 53]]
- [[_COMMUNITY_Community 54|Community 54]]
- [[_COMMUNITY_Community 55|Community 55]]
- [[_COMMUNITY_Community 56|Community 56]]

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

## Communities (57 total, 13 thin omitted)

### Community 0 - "UI Client Components"
Cohesion: 0.05
Nodes (74): PREFERRED_TYPES_BY_BOX, QUESTION_TYPES, addRows(), Assignment, assignQuestions(), bankedQuestion(), BankQuestion, BankRow (+66 more)

### Community 1 - "SRS & Stats Logic"
Cohesion: 0.06
Nodes (55): gradeAnswerAction(), selfGradeAction(), BOX_INTERVALS, outcomeFor(), currentSrsState(), currentSrsState(), FinalizedGrade, finalizeGrade() (+47 more)

### Community 2 - "App Pages & Routing"
Cohesion: 0.08
Nodes (35): removeByokKeyAction(), saveByokKeyAction(), decryptWith(), encryptWith(), parseSecret(), flipped, [iv, tag, body], secret (+27 more)

### Community 3 - "LLM & Grading"
Cohesion: 0.07
Nodes (41): LLM_MAX_RETRIES, LLM_MAX_TOKENS, LLM_TIMEOUT_MS, MAX_TOKENS_BY_PURPOSE, MODEL_BY_PURPOSE, OVER_TIMER_MS_BY_TYPE, q, Card (+33 more)

### Community 4 - "Vocabulary Feature"
Cohesion: 0.09
Nodes (36): buildGlossQuestion(), fallbackQuestion(), lastResortQuestion(), leakFreeMeanings(), applyChanges(), changesAt(), excludedKeys(), joinPinyin() (+28 more)

### Community 5 - "Auth & Layout"
Cohesion: 0.12
Nodes (33): acceptedTargets(), matchesTarget(), resolveDeterministic(), baseFeedback(), describeWord(), extraLines(), selfGradeVerdict(), templateFeedback() (+25 more)

### Community 6 - "Architecture Overview"
Cohesion: 0.1
Nodes (26): alignedPairs(), buildSoundIndex(), homophoneFor(), isPolyphone(), SoundIndex, SoundSource, spokenChar(), spokenText() (+18 more)

### Community 7 - "Word Bank Seeding"
Cohesion: 0.16
Nodes (23): dueReviewsAction(), ensureItemQuestionAction(), getInProgressSessionAction(), listSessionsAction(), loadSessionAction(), redrillSessionAction(), reportQuestionAction(), HomePage() (+15 more)

### Community 8 - "Word Detail Page"
Cohesion: 0.13
Nodes (28): startSessionWithWordsAction(), generateQuestions(), questionsFrom(), safeGenerateQuestion(), stubQuestions(), applyResult(), advanceCursor(), countSessionItems() (+20 more)

### Community 9 - "Session Proxy"
Cohesion: 0.16
Nodes (24): recordStudyActivity(), orderCandidates(), pickSeedWords(), shuffleTiles(), applyResults(), buildBoard(), cachedIndexWords, completeRun() (+16 more)

### Community 10 - "Auth Concepts"
Cohesion: 0.11
Nodes (20): charCounts(), collectDistractors(), DistractorPools, distractorTiers(), fillFromTier(), fitsBoard(), formableWords(), indexByFirstChar() (+12 more)

### Community 11 - "PostCSS Config"
Cohesion: 0.16
Nodes (19): getProfileAction(), vocabCountAction(), fraunces, geistMono, geistSans, metadata, notoSerifSC, RootLayout() (+11 more)

### Community 12 - "ESLint Config"
Cohesion: 0.16
Nodes (13): startScrambleAction(), submitScrambleAction(), IndexedWord, isDifficulty(), pointsFor(), WordChoice, WordResult, FoundWord (+5 more)

### Community 13 - "Next.js Config"
Cohesion: 0.14
Nodes (9): SegmentProps, SpeakButtonProps, mandarinVoice(), speakMandarin(), speechSupported(), ICON_PROPS, SlowSealIcon(), SpeakerIcon() (+1 more)

### Community 14 - "Supabase Browser Client"
Cohesion: 0.11
Nodes (18): Architecture, code:bash (# 1. Clone), code:bash (git checkout local), code:bash (git show local:README.md), Deploy on Vercel, Enable asymmetric JWT signing keys (recommended), Environment variables, Getting Started (+10 more)

### Community 15 - "Next Env Types"
Cohesion: 0.17
Nodes (8): NAV_LINKS, SidebarFooter(), isLinkActive(), ME_LINK, NavItem, PRIMARY_LINKS, PROGRESS_LINKS, TAB_LINKS

### Community 16 - "PostCSS (concept)"
Cohesion: 0.15
Nodes (10): DIFFICULTIES, Difficulty, DIFFICULTY_ORDER, IntroCardProps, ScrambleClient(), selectionText(), ScrambleTimer(), ScrambleTimerProps (+2 more)

### Community 17 - "ESLint (concept)"
Cohesion: 0.3
Nodes (10): AdminUser, deleteUserAction(), listUsersAction(), requireAdmin(), setUserLimitsAction(), setUserRoleAction(), setUserUnlimitedAction(), Props (+2 more)

### Community 18 - "Next Config (concept)"
Cohesion: 0.18
Nodes (8): SpeakWord(), SpokenWord, hasMultipleReadings(), SessionItem, CardLoadingSkeleton(), StudySessionClient(), timerSecondsFor(), TYPE_LABELS

### Community 19 - "README"
Cohesion: 0.16
Nodes (8): BadgeVariant, ButtonProps, ButtonSize, ButtonVariant, CardProps, InkLoader(), Skeleton(), CardStatus

### Community 20 - "Project Overview"
Cohesion: 0.18
Nodes (8): TYPE_LABELS, GraderOutput, LessonCard, Outcome, Reading, Session, Supabase, Word

### Community 21 - "Auth Proxy (concept)"
Cohesion: 0.29
Nodes (13): needsReadingExamples(), getWordCard(), ensureSrsState(), addWordsToBank(), ensureLessonCard(), getWordCard(), getWordDetail(), isCardPending() (+5 more)

### Community 22 - "Domain Types"
Cohesion: 0.15
Nodes (7): Bento(), Card(), PageHeader(), ProgressBar(), Stats, MeaningPickerProps, VocabWord

### Community 23 - "Community 23"
Cohesion: 0.15
Nodes (9): buildDistractorPools(), index, options, result, Tile, withMeaningOptions(), idleTone(), tileClass() (+1 more)

### Community 24 - "Community 24"
Cohesion: 0.14
Nodes (4): Button(), SessionSummary, SelfGradePanelProps, ToneOptionsProps

### Community 25 - "Community 25"
Cohesion: 0.19
Nodes (8): Badge(), Profile, HSK_CN, canAccessAdmin(), HSK_LABELS, Props, SettingsClient(), usageCap()

### Community 26 - "Community 26"
Cohesion: 0.32
Nodes (11): listAddableWordsAction(), listVocabularyAction(), regenerateWordCardAction(), listAddableWords(), listVocabulary(), regenerateWordCard(), listAddableWords(), listVocabulary() (+3 more)

### Community 27 - "Community 27"
Cohesion: 0.15
Nodes (12): Chinese Learner — Next.js on Vercel, code:block1 (npm install), code:block2 (git show local:src/learner/<file>.py), Dev, Environment, graphify, Key directories, Manual step — enable asymmetric JWT signing keys (+4 more)

### Community 28 - "Community 28"
Cohesion: 0.15
Nodes (12): Chinese Learner — Next.js on Vercel, code:block1 (npm install), code:block2 (git show local:src/learner/<file>.py), Dev, Environment, graphify, Key directories, Manual step — enable asymmetric JWT signing keys (+4 more)

### Community 29 - "Community 29"
Cohesion: 0.25
Nodes (4): signIn(), signUp(), SealProps, HSK_LEVELS

### Community 30 - "Community 30"
Cohesion: 0.22
Nodes (4): LedgerHeading(), capLabel(), Usage, UsageMeter()

### Community 31 - "Community 31"
Cohesion: 0.25
Nodes (7): formatReadingsPinyin(), HSK_FILTER_LABELS, hskBadgeVariant(), VocabWord, wordBadgeLabel(), wordBadgeVariant(), WordRow()

### Community 32 - "Community 32"
Cohesion: 0.27
Nodes (7): getWordCardAction(), SrsState, WordDetail, fetchCard(), useLessonCard(), fmtNextReview(), WordCardClient()

### Community 33 - "Community 33"
Cohesion: 0.18
Nodes (4): NAV, QUICK, WEEKDAYS_CN, DueReviews

### Community 34 - "Community 34"
Cohesion: 0.24
Nodes (6): updateHskLevelAction(), HSK_LEVELS, HskLevelPicker(), persistLevel(), Status, useSaveLevel()

### Community 35 - "Community 35"
Cohesion: 0.29
Nodes (9): BoardWord, buildWordIndex(), levelPools(), ScrambleBoard, charCounts(), fitsTiles(), hasPlayableWord(), makeLookups() (+1 more)

### Community 36 - "Community 36"
Cohesion: 0.27
Nodes (10): Grading & Cache Logic, Home Client Component, Supabase Database Schema, LLM Client (OpenCode Zen), Home Page, Word Bank Seeding Script, Service Layer, Session Server Actions (+2 more)

### Community 37 - "Community 37"
Cohesion: 0.25
Nodes (4): EXTRAS, FEATURES, HSK_LEVELS, STEPS

### Community 39 - "Community 39"
Cohesion: 0.38
Nodes (7): startSessionAction(), addWordsToBankAction(), addWordsToBank(), startSession(), getDueWords(), getMixedWords(), getUnseenWords()

### Community 40 - "Community 40"
Cohesion: 0.33
Nodes (6): getStatsAction(), dueReviews(), getStats(), checkProgression(), countDue(), StatsPage()

### Community 42 - "Community 42"
Cohesion: 0.5
Nodes (3): Assets (in this folder), LinkedIn Post — 汉字 Chinese Learner, Post

### Community 44 - "Community 44"
Cohesion: 0.67
Nodes (3): Auth Server Actions, Root Layout, User Context Helper

## Knowledge Gaps
- **167 isolated node(s):** `config`, `eslintConfig`, `nextConfig`, `Reading`, `WordRow` (+162 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **13 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getUserContext()` connect `Word Bank Seeding` to `Community 32`, `SRS & Stats Logic`, `App Pages & Routing`, `Community 34`, `Community 39`, `Community 40`, `Word Detail Page`, `PostCSS Config`, `ESLint Config`, `ESLint (concept)`, `Auth Proxy (concept)`, `Community 26`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **Why does `Button()` connect `Community 24` to `Community 32`, `Community 33`, `App Pages & Routing`, `Community 34`, `ESLint Config`, `Next.js Config`, `PostCSS (concept)`, `ESLint (concept)`, `Next Config (concept)`, `README`, `Project Overview`, `Domain Types`, `Community 25`, `Community 31`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **Why does `createAdminClient()` connect `ESLint (concept)` to `UI Client Components`, `SRS & Stats Logic`, `App Pages & Routing`, `LLM & Grading`, `Auth & Layout`, `Word Bank Seeding`, `Word Detail Page`, `Session Proxy`, `Auth Proxy (concept)`, `Community 26`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **What connects `config`, `eslintConfig`, `nextConfig` to the rest of the system?**
  _167 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `UI Client Components` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._
- **Should `SRS & Stats Logic` be split into smaller, more focused modules?**
  _Cohesion score 0.06 - nodes in this community are weakly interconnected._
- **Should `App Pages & Routing` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._