# Graph Report - chinese-learner  (2026-06-02)

## Corpus Check
- 23 files · ~15,527 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 328 nodes · 489 edges · 21 communities (15 shown, 6 thin omitted)
- Extraction: 85% EXTRACTED · 15% INFERRED · 0% AMBIGUOUS · INFERRED: 74 edges (avg confidence: 0.84)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `c4261da4`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Database Layer|Database Layer]]
- [[_COMMUNITY_LLM & AI Integration|LLM & AI Integration]]
- [[_COMMUNITY_SRS & Session Management|SRS & Session Management]]
- [[_COMMUNITY_Grading & Cache Pipeline|Grading & Cache Pipeline]]
- [[_COMMUNITY_App Entry & Navigation|App Entry & Navigation]]
- [[_COMMUNITY_Session Service Layer|Session Service Layer]]
- [[_COMMUNITY_Study UI & Lesson Schema|Study UI & Lesson Schema]]
- [[_COMMUNITY_Wordbank Import|Wordbank Import]]
- [[_COMMUNITY_Sessions UI & Redrill|Sessions UI & Redrill]]
- [[_COMMUNITY_Home Page UI|Home Page UI]]
- [[_COMMUNITY_Claude Dev Settings|Claude Dev Settings]]
- [[_COMMUNITY_Claude Permissions|Claude Permissions]]
- [[_COMMUNITY_Question Types & Hard Mode|Question Types & Hard Mode]]
- [[_COMMUNITY_App Configuration|App Configuration]]
- [[_COMMUNITY_Package Init|Package Init]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]

## God Nodes (most connected - your core abstractions)
1. `start_session()` - 20 edges
2. `fetchone()` - 18 edges
3. `Chinese Learning Agent — v1 Spec` - 14 edges
4. `transaction()` - 13 edges
5. `frame()` - 13 edges
6. `grade_answer()` - 12 edges
7. `fetchall()` - 11 edges
8. `load_session()` - 11 edges
9. `redrill_session()` - 11 edges
10. `get_stats()` - 11 edges

## Surprising Connections (you probably didn't know these)
- `LLM Minimization Strategy` --rationale_for--> `_ensure_lesson_card()`  [INFERRED]
  architecture.md → src/learner/services.py
- `Session Lifecycle (create/answer/complete/resume/redrill/review)` --references--> `start_session()`  [INFERRED]
  specs/spec.md → src/learner/services.py
- `Lesson Card JSON Schema` --references--> `generate_lesson_card()`  [INFERRED]
  specs/spec.md → src/learner/llm.py
- `Grader Output JSON Schema` --references--> `grade()`  [INFERRED]
  specs/spec.md → src/learner/llm.py
- `Service Layer (internal Python, no HTTP)` --references--> `start_session()`  [INFERRED]
  specs/spec.md → src/learner/services.py

## Hyperedges (group relationships)
- **LLM Minimization: Cache-First + Batch Strategy** — learner_grading_grade_answer_with_cache, learner_grading_check_cache, learner_grading_store_cache, learner_services_ensure_lesson_card, learner_services_start_session [INFERRED 0.95]
- **Session Persistence: cursor-based save/resume/redrill/review** — learner_services_start_session, learner_services_grade_answer, learner_services_load_session, learner_services_redrill_session, learner_services_get_in_progress_session [EXTRACTED 1.00]
- **Leitner SRS Flow: word selection → answer → promote/demote** — learner_srs_get_mixed_words, learner_srs_update_srs, learner_srs_check_progression, learner_config_box_intervals [INFERRED 0.95]

## Communities (21 total, 6 thin omitted)

### Community 0 - "Database Layer"
Cohesion: 0.07
Nodes (40): Leak-Plugger SRS Rule, Leitner 5-Box SRS Design Decision, BOX_INTERVALS (SRS Box Durations), DB_PATH, execute(), fetchall(), fetchone(), get_conn() (+32 more)

### Community 1 - "LLM & AI Integration"
Cohesion: 0.07
Nodes (39): MODEL_BY_PURPOSE, USE_STUB Flag, _chat(), _chat_json(), _extract_json(), generate_lesson_card(), generate_questions(), _get_client() (+31 more)

### Community 2 - "SRS & Session Management"
Cohesion: 0.10
Nodes (34): get_user_profile(), jload(), add_words_to_bank(), _create_session(), _ensure_lesson_card(), get_word_card(), list_addable_words(), services.py — service layer (spec §8). Plain Python called by NiceGUI UI. No HTT (+26 more)

### Community 3 - "Grading & Cache Pipeline"
Cohesion: 0.28
Nodes (8): LLM Minimization Strategy, check_cache(), grade_answer_with_cache(), normalize(), grading.py — normalize → accepted_answers cache → escalate to llm.grade. Local-g, Trim and strip punctuation from a Mandarin answer., Look up `normalized` in accepted_answers for (word_id, question_type).     Retur, Grade an answer for a question, using cache first, LLM on novelty.      Returns

### Community 4 - "App Entry & Navigation"
Cohesion: 0.06
Nodes (33): page_stats Route, NiceGUI Over vanilla JS Decision, page_home(), page_stats(), page_vocabulary(), app.py — NiceGUI entry point. Page routes: / (home), /study, /sessions, /stats, due_reviews(), get_stats() (+25 more)

### Community 5 - "Session Service Layer"
Cohesion: 0.06
Nodes (32): 10. Progression (unchanged from architecture.md), 11. Cost & constraints (unchanged), 12. Verification (build-time checklist), 1. Scope & philosophy, 2. Stack, 3. Data model, 4. Session lifecycle & saving mechanism (core), 5. LLM-minimization strategy (+24 more)

### Community 6 - "Study UI & Lesson Schema"
Cohesion: 0.11
Nodes (21): page_study Route, page_study(), Grader Output JSON Schema, Lesson Card JSON Schema, build_study(), build_study_builder(), build_study_page(), _custom_start() (+13 more)

### Community 7 - "Wordbank Import"
Cohesion: 0.12
Nodes (15): Chinese Learning Agent — Architecture, code:block1 (Browser (localhost:8000)), Component Map, Cost & Constraints, Data Model (essentials), Decisions, Deployment: local-only web app, Difficulty: hard-mode by default (+7 more)

### Community 8 - "Sessions UI & Redrill"
Cohesion: 0.12
Nodes (21): page_home Route, get_in_progress_session(), load_session(), Load a session + all items (with saved answers/grading) + cursor., Load a session + all items (with saved answers/grading) + cursor., Load a session + all items (with saved answers/grading) + cursor., Clone a completed session into a new redrill session.     Default: reuse saved q, Clone a completed session into a new redrill session.     Default: reuse saved q (+13 more)

### Community 9 - "Home Page UI"
Cohesion: 0.15
Nodes (15): list_vocabulary(), Number of words in the user's bank (have an srs_state row)., All words the user has added (have srs_state), with box / mastery / due info., Number of words in the user's bank (have an srs_state row)., All words the user has added (have srs_state), with box / mastery / due info., vocab_count(), components.py — shared UI building blocks reused across pages., Render a rich lesson card (learning material) — used by study + vocabulary. (+7 more)

### Community 16 - "Community 16"
Cohesion: 0.18
Nodes (10): code:bash (# Install uv (if you don't have it)), code:bash (# 1. Clone the repo), Configuration, Cost, Features, How it works, Makefile targets, Quickstart (+2 more)

### Community 17 - "Community 17"
Cohesion: 0.22
Nodes (12): page_sessions Route, page_sessions(), build_sessions(), _do_redrill(), _fmt_time(), sessions.py — session list with status badges + Resume/Re-drill/Review actions., Inline read-only review of a session's items., Inline read-only review of a session's items. (+4 more)

### Community 19 - "Community 19"
Cohesion: 0.22
Nodes (9): 9. UI spec (NiceGUI dashboard + sidebar), code:block5 (┌──────────────┬───────────────────────────────────────────┐), code:block6 (MATERIAL (flashcard)                    DRILL), Home / dashboard, Layout, Sessions view, Sidebar (`ui.left_drawer`, persistent), Stats view (+1 more)

### Community 20 - "Community 20"
Cohesion: 0.67
Nodes (3): _is_han(), prompt_pinyin(), pinyin_util.py — convert mixed Chinese/Latin text to spaced toned pinyin.  Non-H

## Knowledge Gaps
- **59 isolated node(s):** `Deployment: local-only web app`, `Stack: FastAPI + SQLite + vanilla JS`, `LLM: DeepSeek V4 Flash (free) via OpenRouter`, `Memory model: Leitner 5-box SRS`, `Word bank: drkameleon/complete-hsk-vocabulary` (+54 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `start_session()` connect `SRS & Session Management` to `Database Layer`, `Sessions UI & Redrill`, `Study UI & Lesson Schema`, `LLM & AI Integration`?**
  _High betweenness centrality (0.092) - this node is a cross-community bridge._
- **Why does `generate_questions()` connect `LLM & AI Integration` to `Sessions UI & Redrill`, `SRS & Session Management`?**
  _High betweenness centrality (0.080) - this node is a cross-community bridge._
- **Why does `fetchone()` connect `Database Layer` to `SRS & Session Management`, `Grading & Cache Pipeline`, `App Entry & Navigation`, `Sessions UI & Redrill`, `Home Page UI`?**
  _High betweenness centrality (0.068) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `start_session()` (e.g. with `page_study()` and `transaction()`) actually correct?**
  _`start_session()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **Are the 7 inferred relationships involving `fetchone()` (e.g. with `start_session_with_words()` and `list_sessions()`) actually correct?**
  _`fetchone()` has 7 INFERRED edges - model-reasoned connections that need verification._
- **Are the 4 inferred relationships involving `transaction()` (e.g. with `_ensure_lesson_card()` and `_create_session()`) actually correct?**
  _`transaction()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **Are the 4 inferred relationships involving `frame()` (e.g. with `inject_theme()` and `build_vocabulary()`) actually correct?**
  _`frame()` has 4 INFERRED edges - model-reasoned connections that need verification._