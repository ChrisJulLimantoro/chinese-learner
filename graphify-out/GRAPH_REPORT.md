# Graph Report - chinese-learner  (2026-10-21)

## Corpus Check
- 145 files · ~133,238 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 918 nodes · 2183 edges · 51 communities (40 shown, 11 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 5 edges (avg confidence: 0.82)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `f10f2f16`
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
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 50|Community 50]]

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

## Communities (51 total, 11 thin omitted)

### Community 0 - "UI Client Components"
Cohesion: 0.05
Nodes (74): PREFERRED_TYPES_BY_BOX, QUESTION_TYPES, addRows(), Assignment, assignQuestions(), bankedQuestion(), BankQuestion, BankRow (+66 more)

### Community 1 - "SRS & Stats Logic"
Cohesion: 0.06
Nodes (55): SpeakWord(), SpokenWord, TYPE_LABELS, acceptedTargets(), matchesTarget(), resolveDeterministic(), baseFeedback(), describeWord() (+47 more)

### Community 2 - "App Pages & Routing"
Cohesion: 0.06
Nodes (56): gradeAnswerAction(), selfGradeAction(), BOX_INTERVALS, outcomeFor(), currentSrsState(), currentSrsState(), FinalizedGrade, finalizeGrade() (+48 more)

### Community 3 - "LLM & Grading"
Cohesion: 0.09
Nodes (35): removeByokKeyAction(), saveByokKeyAction(), decryptWith(), encryptWith(), parseSecret(), flipped, [iv, tag, body], secret (+27 more)

### Community 4 - "Vocabulary Feature"
Cohesion: 0.06
Nodes (17): signIn(), signOut(), signUp(), EXTRAS, FEATURES, HSK_LEVELS, STEPS, NAV_LINKS (+9 more)

### Community 5 - "Auth & Layout"
Cohesion: 0.08
Nodes (37): LLM_MAX_RETRIES, LLM_MAX_TOKENS, LLM_TIMEOUT_MS, MAX_TOKENS_BY_PURPOSE, MODEL_BY_PURPOSE, OVER_TIMER_MS_BY_TYPE, q, exampleReadings() (+29 more)

### Community 6 - "Architecture Overview"
Cohesion: 0.1
Nodes (26): alignedPairs(), buildSoundIndex(), homophoneFor(), isPolyphone(), SoundIndex, SoundSource, spokenChar(), spokenText() (+18 more)

### Community 7 - "Word Bank Seeding"
Cohesion: 0.11
Nodes (30): getStatsAction(), generateQuestions(), questionsFrom(), safeGenerateQuestion(), stubQuestions(), applyResult(), advanceCursor(), countSessionItems() (+22 more)

### Community 8 - "Word Detail Page"
Cohesion: 0.11
Nodes (26): applyChanges(), changesAt(), excludedKeys(), joinPinyin(), LOWER_TONE_MARKS, MARKED, markIndex(), otherTones() (+18 more)

### Community 9 - "Session Proxy"
Cohesion: 0.14
Nodes (27): recordStudyActivity(), orderCandidates(), pickSeedWords(), shuffle(), shuffleTiles(), SrsSnapshot, swap(), applyResults() (+19 more)

### Community 10 - "Auth Concepts"
Cohesion: 0.14
Nodes (19): dueReviewsAction(), ensureItemQuestionAction(), getInProgressSessionAction(), listSessionsAction(), loadSessionAction(), redrillSessionAction(), reportQuestionAction(), SessionDetailPage() (+11 more)

### Community 11 - "PostCSS Config"
Cohesion: 0.11
Nodes (20): charCounts(), collectDistractors(), DistractorPools, distractorTiers(), fillFromTier(), fitsBoard(), formableWords(), indexByFirstChar() (+12 more)

### Community 12 - "ESLint Config"
Cohesion: 0.17
Nodes (15): Card, hasTaggedExamples(), needsReadingExamples(), readings, ensureSrsState(), addWordsToBank(), ensureLessonCard(), getWordCard() (+7 more)

### Community 13 - "Next.js Config"
Cohesion: 0.19
Nodes (19): getProfileAction(), vocabCountAction(), RootLayout(), assertSessionCapAvailable(), countSessions(), getProfile(), getSessionCap(), getVocabCap() (+11 more)

### Community 14 - "Supabase Browser Client"
Cohesion: 0.13
Nodes (9): BadgeVariant, Button(), ButtonProps, ButtonSize, ButtonVariant, CardProps, Skeleton(), SelfGradePanelProps (+1 more)

### Community 15 - "Next Env Types"
Cohesion: 0.22
Nodes (17): addWordsToBankAction(), listAddableWordsAction(), listVocabularyAction(), regenerateWordCardAction(), addWordsToBank(), ensureLessonCard(), getWordCard(), listAddableWords() (+9 more)

### Community 16 - "PostCSS (concept)"
Cohesion: 0.16
Nodes (13): startScrambleAction(), submitScrambleAction(), Badge(), IndexedWord, isDifficulty(), pointsFor(), WordChoice, WordResult (+5 more)

### Community 17 - "ESLint (concept)"
Cohesion: 0.14
Nodes (9): SegmentProps, SpeakButtonProps, mandarinVoice(), speakMandarin(), speechSupported(), ICON_PROPS, SlowSealIcon(), SpeakerIcon() (+1 more)

### Community 18 - "Next Config (concept)"
Cohesion: 0.11
Nodes (18): Architecture, code:bash (# 1. Clone), code:bash (git checkout local), code:bash (git show local:README.md), Deploy on Vercel, Enable asymmetric JWT signing keys (recommended), Environment variables, Getting Started (+10 more)

### Community 19 - "README"
Cohesion: 0.12
Nodes (8): startSessionAction(), startSessionWithWordsAction(), NAV, QUICK, WEEKDAYS_CN, PageHeader(), DueReviews, VocabWord

### Community 20 - "Project Overview"
Cohesion: 0.18
Nodes (9): getWordCardAction(), InkLoader(), SrsState, WordDetail, CardStatus, fetchCard(), useLessonCard(), fmtNextReview() (+1 more)

### Community 21 - "Auth Proxy (concept)"
Cohesion: 0.3
Nodes (10): AdminUser, deleteUserAction(), listUsersAction(), requireAdmin(), setUserLimitsAction(), setUserRoleAction(), setUserUnlimitedAction(), Props (+2 more)

### Community 22 - "Domain Types"
Cohesion: 0.23
Nodes (11): fraunces, geistMono, geistSans, metadata, notoSerifSC, HomePage(), listSessions(), getCachedClaims (+3 more)

### Community 23 - "Community 23"
Cohesion: 0.19
Nodes (7): Profile, HSK_CN, canAccessAdmin(), HSK_LABELS, Props, SettingsClient(), usageCap()

### Community 24 - "Community 24"
Cohesion: 0.18
Nodes (8): DIFFICULTIES, Difficulty, DIFFICULTY_ORDER, IntroCardProps, ScrambleClient(), selectionText(), Miss, useScrambleGame()

### Community 25 - "Community 25"
Cohesion: 0.15
Nodes (12): Chinese Learner — Next.js on Vercel, code:block1 (npm install), code:block2 (git show local:src/learner/<file>.py), Dev, Environment, graphify, Key directories, Manual step — enable asymmetric JWT signing keys (+4 more)

### Community 26 - "Community 26"
Cohesion: 0.15
Nodes (12): Chinese Learner — Next.js on Vercel, code:block1 (npm install), code:block2 (git show local:src/learner/<file>.py), Dev, Environment, graphify, Key directories, Manual step — enable asymmetric JWT signing keys (+4 more)

### Community 27 - "Community 27"
Cohesion: 0.17
Nodes (3): Card(), SessionSummary, MeaningPickerProps

### Community 28 - "Community 28"
Cohesion: 0.22
Nodes (4): LedgerHeading(), capLabel(), Usage, UsageMeter()

### Community 29 - "Community 29"
Cohesion: 0.22
Nodes (6): Bento(), ProgressBar(), Stats, ScrambleTimer(), ScrambleTimerProps, timerColor()

### Community 30 - "Community 30"
Cohesion: 0.24
Nodes (6): updateHskLevelAction(), HSK_LEVELS, HskLevelPicker(), persistLevel(), Status, useSaveLevel()

### Community 31 - "Community 31"
Cohesion: 0.29
Nodes (9): BoardWord, buildWordIndex(), levelPools(), ScrambleBoard, charCounts(), fitsTiles(), hasPlayableWord(), makeLookups() (+1 more)

### Community 32 - "Community 32"
Cohesion: 0.2
Nodes (7): buildDistractorPools(), sumPoints(), index, options, result, weightedScore(), withMeaningOptions()

### Community 33 - "Community 33"
Cohesion: 0.4
Nodes (8): buildGlossQuestion(), fallbackQuestion(), lastResortQuestion(), leakFreeMeanings(), shortMeaning(), toIndexedWord(), buildToneQuestion(), toneQuestionOf()

### Community 34 - "Community 34"
Cohesion: 0.27
Nodes (10): Grading & Cache Logic, Home Client Component, Supabase Database Schema, LLM Client (OpenCode Zen), Home Page, Word Bank Seeding Script, Service Layer, Session Server Actions (+2 more)

### Community 35 - "Community 35"
Cohesion: 0.4
Nodes (4): Tile, idleTone(), tileClass(), TileGridProps

### Community 36 - "Community 36"
Cohesion: 0.5
Nodes (3): Assets (in this folder), LinkedIn Post — 汉字 Chinese Learner, Post

### Community 38 - "Community 38"
Cohesion: 0.67
Nodes (3): Auth Server Actions, Root Layout, User Context Helper

## Knowledge Gaps
- **168 isolated node(s):** `config`, `eslintConfig`, `nextConfig`, `Reading`, `WordRow` (+163 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getUserContext()` connect `Auth Concepts` to `App Pages & Routing`, `LLM & Grading`, `Word Bank Seeding`, `ESLint Config`, `Next.js Config`, `Next Env Types`, `PostCSS (concept)`, `README`, `Project Overview`, `Auth Proxy (concept)`, `Domain Types`, `Community 30`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **Why does `Button()` connect `Supabase Browser Client` to `SRS & Stats Logic`, `LLM & Grading`, `PostCSS (concept)`, `ESLint (concept)`, `README`, `Project Overview`, `Auth Proxy (concept)`, `Community 23`, `Community 24`, `Community 27`, `Community 30`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **Why does `createAdminClient()` connect `Auth Proxy (concept)` to `UI Client Components`, `SRS & Stats Logic`, `App Pages & Routing`, `LLM & Grading`, `Word Bank Seeding`, `Session Proxy`, `Auth Concepts`, `ESLint Config`, `Next Env Types`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **What connects `config`, `eslintConfig`, `nextConfig` to the rest of the system?**
  _168 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `UI Client Components` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._
- **Should `SRS & Stats Logic` be split into smaller, more focused modules?**
  _Cohesion score 0.06 - nodes in this community are weakly interconnected._
- **Should `App Pages & Routing` be split into smaller, more focused modules?**
  _Cohesion score 0.06 - nodes in this community are weakly interconnected._