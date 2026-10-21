# Graph Report - chinese-learner  (2026-10-21)

## Corpus Check
- 145 files · ~133,285 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 919 nodes · 2184 edges · 52 communities (41 shown, 11 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 5 edges (avg confidence: 0.82)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `903a8297`
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
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 51|Community 51]]

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
- `fillBatch()` --calls--> `loadBank()`  [EXTRACTED]
  scripts/prewarm-questions.ts → src/lib/questionBank.ts
- `fillBatch()` --calls--> `fillBank()`  [EXTRACTED]
  scripts/prewarm-questions.ts → src/lib/questionBank.ts
- `SRS Leitner Logic` --implements--> `Supabase Database Schema`  [INFERRED]
  src/lib/srs.ts → supabase/migrations/001_initial_schema.sql
- `Service Layer` --implements--> `Supabase Database Schema`  [INFERRED]
  src/lib/services.ts → supabase/migrations/001_initial_schema.sql

## Communities (52 total, 11 thin omitted)

### Community 0 - "UI Client Components"
Cohesion: 0.05
Nodes (81): getProfileAction(), dueReviewsAction(), ensureItemQuestionAction(), getInProgressSessionAction(), gradeAnswerAction(), listSessionsAction(), loadSessionAction(), redrillSessionAction() (+73 more)

### Community 1 - "SRS & Stats Logic"
Cohesion: 0.05
Nodes (66): addWordsToBankAction(), getWordCardAction(), listAddableWordsAction(), listVocabularyAction(), regenerateWordCardAction(), vocabCountAction(), SpeakWord(), SpokenWord (+58 more)

### Community 2 - "App Pages & Routing"
Cohesion: 0.05
Nodes (63): AdminUser, deleteUserAction(), listUsersAction(), requireAdmin(), setUserLimitsAction(), setUserRoleAction(), setUserUnlimitedAction(), Props (+55 more)

### Community 3 - "LLM & Grading"
Cohesion: 0.09
Nodes (35): removeByokKeyAction(), saveByokKeyAction(), decryptWith(), encryptWith(), parseSecret(), flipped, [iv, tag, body], secret (+27 more)

### Community 4 - "Vocabulary Feature"
Cohesion: 0.06
Nodes (17): signIn(), signOut(), signUp(), EXTRAS, FEATURES, HSK_LEVELS, STEPS, NAV_LINKS (+9 more)

### Community 5 - "Auth & Layout"
Cohesion: 0.12
Nodes (33): acceptedTargets(), matchesTarget(), resolveDeterministic(), baseFeedback(), describeWord(), extraLines(), selfGradeVerdict(), templateFeedback() (+25 more)

### Community 6 - "Architecture Overview"
Cohesion: 0.1
Nodes (29): LLM_MAX_RETRIES, LLM_MAX_TOKENS, LLM_TIMEOUT_MS, MAX_TOKENS_BY_PURPOSE, MODEL_BY_PURPOSE, q, chat(), chatJson() (+21 more)

### Community 7 - "Word Bank Seeding"
Cohesion: 0.1
Nodes (29): QuestionWordInput, addRows(), Assignment, assignQuestions(), BankQuestion, BankRow, BoxByWord, chunked() (+21 more)

### Community 8 - "Word Detail Page"
Cohesion: 0.11
Nodes (26): applyChanges(), changesAt(), excludedKeys(), joinPinyin(), LOWER_TONE_MARKS, MARKED, markIndex(), otherTones() (+18 more)

### Community 9 - "Session Proxy"
Cohesion: 0.13
Nodes (22): alignedPairs(), buildSoundIndex(), homophoneFor(), isPolyphone(), SoundIndex, SoundSource, spokenChar(), spokenText() (+14 more)

### Community 10 - "Auth Concepts"
Cohesion: 0.11
Nodes (21): charCounts(), collectDistractors(), DistractorPools, distractorTiers(), fillFromTier(), fitsBoard(), formableWords(), indexByFirstChar() (+13 more)

### Community 11 - "PostCSS Config"
Cohesion: 0.12
Nodes (8): Button(), OVER_TIMER_MS_BY_TYPE, SessionItem, SelfGradePanelProps, StudySessionClient(), timerSecondsFor(), TYPE_LABELS, ToneOptionsProps

### Community 12 - "ESLint Config"
Cohesion: 0.14
Nodes (9): SegmentProps, SpeakButtonProps, mandarinVoice(), speakMandarin(), speechSupported(), ICON_PROPS, SlowSealIcon(), SpeakerIcon() (+1 more)

### Community 13 - "Next.js Config"
Cohesion: 0.19
Nodes (18): recordStudyActivity(), applyResult(), applyResults(), completeRun(), fetchIndexWords(), fetchResultWords(), fetchScopeWords(), fetchSrsPage() (+10 more)

### Community 14 - "Supabase Browser Client"
Cohesion: 0.11
Nodes (18): Architecture, code:bash (# 1. Clone), code:bash (git checkout local), code:bash (git show local:README.md), Deploy on Vercel, Enable asymmetric JWT signing keys (recommended), Environment variables, Getting Started (+10 more)

### Community 15 - "Next Env Types"
Cohesion: 0.12
Nodes (7): NAV, QUICK, WEEKDAYS_CN, Bento(), PageHeader(), DueReviews, Stats

### Community 16 - "PostCSS (concept)"
Cohesion: 0.16
Nodes (8): BadgeVariant, ButtonProps, ButtonSize, ButtonVariant, CardProps, InkLoader(), Skeleton(), CardStatus

### Community 17 - "ESLint (concept)"
Cohesion: 0.2
Nodes (12): QuestionBank, wordsNeedingQuestions(), PoolByWord, PoolRow, chunk(), createAdmin(), fetchWordPage(), fetchWords() (+4 more)

### Community 18 - "Next Config (concept)"
Cohesion: 0.14
Nodes (10): IndexedWord, sumPoints(), index, options, result, Tile, weightedScore(), idleTone() (+2 more)

### Community 19 - "README"
Cohesion: 0.19
Nodes (7): Profile, HSK_CN, canAccessAdmin(), HSK_LABELS, Props, SettingsClient(), usageCap()

### Community 20 - "Project Overview"
Cohesion: 0.18
Nodes (8): DIFFICULTIES, Difficulty, DIFFICULTY_ORDER, IntroCardProps, ScrambleClient(), selectionText(), Miss, useScrambleGame()

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
Cohesion: 0.17
Nodes (3): Card(), SessionSummary, MeaningPickerProps

### Community 25 - "Community 25"
Cohesion: 0.24
Nodes (10): QUESTION_TYPES, LLM_TYPES, needsGeneration(), nextRequiredType(), PoolStats, requiredTypes(), rotation(), stats (+2 more)

### Community 26 - "Community 26"
Cohesion: 0.22
Nodes (4): LedgerHeading(), capLabel(), Usage, UsageMeter()

### Community 27 - "Community 27"
Cohesion: 0.36
Nodes (9): buildGlossQuestion(), fallbackQuestion(), lastResortQuestion(), leakFreeMeanings(), questionFor(), shortMeaning(), toIndexedWord(), buildToneQuestion() (+1 more)

### Community 28 - "Community 28"
Cohesion: 0.25
Nodes (11): buildDistractorPools(), orderCandidates(), pickSeedWords(), shuffle(), shuffleTiles(), swap(), withMeaningOptions(), buildBoard() (+3 more)

### Community 29 - "Community 29"
Cohesion: 0.27
Nodes (8): startScrambleAction(), submitScrambleAction(), isDifficulty(), pointsFor(), WordChoice, WordResult, Phase, PickerState

### Community 30 - "Community 30"
Cohesion: 0.24
Nodes (6): updateHskLevelAction(), HSK_LEVELS, HskLevelPicker(), persistLevel(), Status, useSaveLevel()

### Community 31 - "Community 31"
Cohesion: 0.24
Nodes (10): bankSize(), countByType(), preferredTypes(), requestsFor(), requiredType(), requiredTypes(), rotatingType(), shouldTryTone() (+2 more)

### Community 32 - "Community 32"
Cohesion: 0.33
Nodes (8): PREFERRED_TYPES_BY_BOX, BoxByWord, preferredTypes(), QuestionType, boxesOf(), pickParams(), pickRows(), Question

### Community 33 - "Community 33"
Cohesion: 0.29
Nodes (9): BoardWord, buildWordIndex(), levelPools(), ScrambleBoard, charCounts(), fitsTiles(), hasPlayableWord(), makeLookups() (+1 more)

### Community 34 - "Community 34"
Cohesion: 0.27
Nodes (10): Grading & Cache Logic, Home Client Component, Supabase Database Schema, LLM Client (OpenCode Zen), Home Page, Word Bank Seeding Script, Service Layer, Session Server Actions (+2 more)

### Community 35 - "Community 35"
Cohesion: 0.32
Nodes (4): Badge(), FoundWord, FoundWord, ScrambleSummaryProps

### Community 36 - "Community 36"
Cohesion: 0.29
Nodes (7): bankedQuestion(), ofPreferredTypes(), pickQuestion(), pickRequeueQuestion(), toBankQuestion(), requeueQuestionFor(), shouldRequeue()

### Community 37 - "Community 37"
Cohesion: 0.5
Nodes (3): Assets (in this folder), LinkedIn Post — 汉字 Chinese Learner, Post

### Community 39 - "Community 39"
Cohesion: 0.67
Nodes (3): Auth Server Actions, Root Layout, User Context Helper

## Knowledge Gaps
- **168 isolated node(s):** `config`, `eslintConfig`, `nextConfig`, `Reading`, `WordRow` (+163 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getUserContext()` connect `UI Client Components` to `SRS & Stats Logic`, `App Pages & Routing`, `LLM & Grading`, `Community 29`, `Community 30`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **Why does `Button()` connect `PostCSS Config` to `SRS & Stats Logic`, `App Pages & Routing`, `LLM & Grading`, `Community 35`, `ESLint Config`, `Next Env Types`, `PostCSS (concept)`, `README`, `Project Overview`, `Community 23`, `Community 24`, `Community 30`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **Why does `createAdminClient()` connect `App Pages & Routing` to `UI Client Components`, `SRS & Stats Logic`, `LLM & Grading`, `Auth & Layout`, `Next.js Config`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **What connects `config`, `eslintConfig`, `nextConfig` to the rest of the system?**
  _168 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `UI Client Components` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._
- **Should `SRS & Stats Logic` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._
- **Should `App Pages & Routing` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._