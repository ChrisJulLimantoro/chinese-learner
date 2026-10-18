# Graph Report - chinese-learner  (2026-10-18)

## Corpus Check
- 120 files · ~130,011 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 788 nodes · 1851 edges · 43 communities (30 shown, 13 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 4 edges (avg confidence: 0.82)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `2ba47e5a`
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
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]

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

## Communities (43 total, 13 thin omitted)

### Community 0 - "UI Client Components"
Cohesion: 0.05
Nodes (99): getProfileAction(), getInProgressSessionAction(), listSessionsAction(), loadSessionAction(), addWordsToBankAction(), getStatsAction(), getWordCardAction(), listAddableWordsAction() (+91 more)

### Community 1 - "SRS & Stats Logic"
Cohesion: 0.05
Nodes (75): startScrambleAction(), submitScrambleAction(), recordStudyActivity(), BoardWord, buildDistractorPools(), buildWordIndex(), charCounts(), collectDistractors() (+67 more)

### Community 2 - "App Pages & Routing"
Cohesion: 0.05
Nodes (66): LLM_MAX_RETRIES, LLM_MAX_TOKENS, LLM_TIMEOUT_MS, MAX_TOKENS_BY_PURPOSE, MODEL_BY_PURPOSE, acceptedTargets(), matchesTarget(), resolveDeterministic() (+58 more)

### Community 3 - "LLM & Grading"
Cohesion: 0.06
Nodes (56): PREFERRED_TYPES_BY_BOX, buildGlossQuestion(), fallbackQuestion(), lastResortQuestion(), leakFreeMeanings(), QUESTION_TYPES, QuestionWordInput, addRows() (+48 more)

### Community 4 - "Vocabulary Feature"
Cohesion: 0.09
Nodes (32): dueReviewsAction(), ensureItemQuestionAction(), gradeAnswerAction(), reportQuestionAction(), selfGradeAction(), outcomeFor(), reportQuestion(), currentSrsState() (+24 more)

### Community 5 - "Auth & Layout"
Cohesion: 0.09
Nodes (32): BOX_INTERVALS, currentSrsState(), advanceSrsState(), applyAnswer(), applyLeakPlugger(), computeProgress(), emptySrsState(), fetchSrsRows() (+24 more)

### Community 6 - "Architecture Overview"
Cohesion: 0.1
Nodes (26): alignedPairs(), buildSoundIndex(), homophoneFor(), isPolyphone(), SoundIndex, SoundSource, spokenChar(), spokenText() (+18 more)

### Community 7 - "Word Bank Seeding"
Cohesion: 0.11
Nodes (26): applyChanges(), changesAt(), excludedKeys(), joinPinyin(), LOWER_TONE_MARKS, MARKED, markIndex(), otherTones() (+18 more)

### Community 8 - "Word Detail Page"
Cohesion: 0.11
Nodes (6): redrillSessionAction(), NAV, QUICK, WEEKDAYS_CN, DueReviews, SessionSummary

### Community 9 - "Session Proxy"
Cohesion: 0.11
Nodes (18): Architecture, code:bash (# 1. Clone), code:bash (git checkout local), code:bash (git show local:README.md), Deploy on Vercel, Enable asymmetric JWT signing keys (recommended), Environment variables, Getting Started (+10 more)

### Community 10 - "Auth Concepts"
Cohesion: 0.14
Nodes (10): Badge(), Profile, FoundWord, ScrambleSummaryProps, HSK_CN, canAccessAdmin(), HSK_LABELS, Props (+2 more)

### Community 11 - "PostCSS Config"
Cohesion: 0.15
Nodes (11): SpeakWord(), SpokenWord, InkLoader(), Skeleton(), OVER_TIMER_MS_BY_TYPE, hasMultipleReadings(), SessionItem, CardLoadingSkeleton() (+3 more)

### Community 12 - "ESLint Config"
Cohesion: 0.14
Nodes (9): Card(), DIFFICULTIES, DIFFICULTY_ORDER, MeaningPickerProps, IntroCardProps, ScrambleClient(), selectionText(), Miss (+1 more)

### Community 13 - "Next.js Config"
Cohesion: 0.15
Nodes (12): BadgeVariant, Bento(), ButtonProps, ButtonSize, ButtonVariant, CardProps, PageHeader(), ProgressBar() (+4 more)

### Community 14 - "Supabase Browser Client"
Cohesion: 0.17
Nodes (8): NAV_LINKS, SidebarFooter(), isLinkActive(), ME_LINK, NavItem, PRIMARY_LINKS, PROGRESS_LINKS, TAB_LINKS

### Community 15 - "Next Env Types"
Cohesion: 0.3
Nodes (10): AdminUser, deleteUserAction(), listUsersAction(), requireAdmin(), setUserLimitsAction(), setUserRoleAction(), setUserUnlimitedAction(), Props (+2 more)

### Community 16 - "PostCSS (concept)"
Cohesion: 0.15
Nodes (6): startSessionAction(), startSessionWithWordsAction(), TYPE_LABELS, formatReadingsPinyin(), Session, VocabWord

### Community 17 - "ESLint (concept)"
Cohesion: 0.15
Nodes (12): Chinese Learner — Next.js on Vercel, code:block1 (npm install), code:block2 (git show local:src/learner/<file>.py), Dev, Environment, graphify, Key directories, Manual step — enable asymmetric JWT signing keys (+4 more)

### Community 18 - "Next Config (concept)"
Cohesion: 0.15
Nodes (12): Chinese Learner — Next.js on Vercel, code:block1 (npm install), code:block2 (git show local:src/learner/<file>.py), Dev, Environment, graphify, Key directories, Manual step — enable asymmetric JWT signing keys (+4 more)

### Community 19 - "README"
Cohesion: 0.25
Nodes (4): signIn(), signUp(), SealProps, HSK_LEVELS

### Community 20 - "Project Overview"
Cohesion: 0.22
Nodes (4): LedgerHeading(), capLabel(), Usage, UsageMeter()

### Community 21 - "Auth Proxy (concept)"
Cohesion: 0.27
Nodes (6): HSK_FILTER_LABELS, hskBadgeVariant(), VocabWord, wordBadgeLabel(), wordBadgeVariant(), WordRow()

### Community 22 - "Domain Types"
Cohesion: 0.24
Nodes (6): updateHskLevelAction(), HSK_LEVELS, HskLevelPicker(), persistLevel(), Status, useSaveLevel()

### Community 23 - "Community 23"
Cohesion: 0.27
Nodes (10): Grading & Cache Logic, Home Client Component, Supabase Database Schema, LLM Client (OpenCode Zen), Home Page, Word Bank Seeding Script, Service Layer, Session Server Actions (+2 more)

### Community 25 - "Community 25"
Cohesion: 0.25
Nodes (4): EXTRAS, FEATURES, HSK_LEVELS, STEPS

### Community 26 - "Community 26"
Cohesion: 0.29
Nodes (3): Button(), SelfGradePanelProps, ToneOptionsProps

### Community 28 - "Community 28"
Cohesion: 0.5
Nodes (3): Assets (in this folder), LinkedIn Post — 汉字 Chinese Learner, Post

### Community 30 - "Community 30"
Cohesion: 0.67
Nodes (3): Auth Server Actions, Root Layout, User Context Helper

## Knowledge Gaps
- **154 isolated node(s):** `config`, `eslintConfig`, `nextConfig`, `Reading`, `WordRow` (+149 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **13 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getUserContext()` connect `UI Client Components` to `SRS & Stats Logic`, `Vocabulary Feature`, `Word Detail Page`, `Next Env Types`, `PostCSS (concept)`, `Domain Types`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **Why does `Word` connect `LLM & Grading` to `UI Client Components`, `App Pages & Routing`, `Auth & Layout`, `PostCSS Config`, `PostCSS (concept)`, `Auth Proxy (concept)`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **Why does `Question` connect `App Pages & Routing` to `LLM & Grading`, `UI Client Components`, `PostCSS Config`, `Vocabulary Feature`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **What connects `config`, `eslintConfig`, `nextConfig` to the rest of the system?**
  _154 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `UI Client Components` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._
- **Should `SRS & Stats Logic` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._
- **Should `App Pages & Routing` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._