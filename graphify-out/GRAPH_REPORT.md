# Graph Report - chinese-learner  (2026-05-28)

## Corpus Check
- 22 files · ~14,894 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 296 nodes · 454 edges · 19 communities (13 shown, 6 thin omitted)
- Extraction: 84% EXTRACTED · 16% INFERRED · 0% AMBIGUOUS · INFERRED: 72 edges (avg confidence: 0.84)
- Token cost: 0 input · 0 output

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

## God Nodes (most connected - your core abstractions)
1. `start_session()` - 20 edges
2. `fetchone()` - 18 edges
3. `Chinese Learning Agent — v1 Spec` - 14 edges
4. `transaction()` - 13 edges
5. `frame()` - 12 edges
6. `fetchall()` - 11 edges
7. `_ensure_lesson_card()` - 10 edges
8. `_create_session()` - 10 edges
9. `grade_answer()` - 10 edges
10. `load_session()` - 10 edges

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

## Communities (19 total, 6 thin omitted)

### Community 0 - "Database Layer"
Cohesion: 0.08
Nodes (37): DB_PATH, execute(), fetchall(), fetchone(), get_conn(), get_user_profile(), init_db(), db.py — SQLite connection, schema init, thin query helpers. (+29 more)

### Community 1 - "LLM & AI Integration"
Cohesion: 0.10
Nodes (30): MODEL_BY_PURPOSE, USE_STUB Flag, _chat(), _chat_json(), _extract_json(), generate_lesson_card(), generate_questions(), _get_client() (+22 more)

### Community 2 - "SRS & Session Management"
Cohesion: 0.10
Nodes (35): Leak-Plugger SRS Rule, Leitner 5-Box SRS Design Decision, BOX_INTERVALS (SRS Box Durations), jdump(), jload(), add_words_to_bank(), _create_session(), _ensure_lesson_card() (+27 more)

### Community 3 - "Grading & Cache Pipeline"
Cohesion: 0.24
Nodes (10): LLM Minimization Strategy, check_cache(), grade_answer_with_cache(), normalize(), grading.py — normalize → accepted_answers cache → escalate to llm.grade. Local-g, Trim and strip punctuation from a Mandarin answer., Look up `normalized` in accepted_answers for (word_id, question_type).     Retur, Store a grader verdict in accepted_answers. (+2 more)

### Community 4 - "App Entry & Navigation"
Cohesion: 0.13
Nodes (15): NiceGUI Over vanilla JS Decision, due_reviews(), Return count + preview of due SRS items., Return count + preview of due SRS items., frame(), _nav_link(), layout.py — shared frame: persistent left_drawer sidebar + header. All pages cal, Render the persistent left drawer. (+7 more)

### Community 5 - "Session Service Layer"
Cohesion: 0.05
Nodes (41): 10. Progression (unchanged from architecture.md), 11. Cost & constraints (unchanged), 12. Verification (build-time checklist), 1. Scope & philosophy, 2. Stack, 3. Data model, 4. Session lifecycle & saving mechanism (core), 5. LLM-minimization strategy (+33 more)

### Community 6 - "Study UI & Lesson Schema"
Cohesion: 0.13
Nodes (19): page_study Route, page_study(), Grader Output JSON Schema, Lesson Card JSON Schema, build_study(), build_study_builder(), build_study_page(), _custom_start() (+11 more)

### Community 7 - "Wordbank Import"
Cohesion: 0.12
Nodes (15): Chinese Learning Agent — Architecture, code:block1 (Browser (localhost:8000)), Component Map, Cost & Constraints, Data Model (essentials), Decisions, Deployment: local-only web app, Difficulty: hard-mode by default (+7 more)

### Community 8 - "Sessions UI & Redrill"
Cohesion: 0.09
Nodes (29): page_home Route, page_sessions Route, page_sessions(), get_in_progress_session(), load_session(), Load a session + all items (with saved answers/grading) + cursor., Load a session + all items (with saved answers/grading) + cursor., Clone a completed session into a new redrill session.     Default: reuse saved q (+21 more)

### Community 9 - "Home Page UI"
Cohesion: 0.17
Nodes (13): list_vocabulary(), Number of words in the user's bank (have an srs_state row)., All words the user has added (have srs_state), with box / mastery / due info., vocab_count(), components.py — shared UI building blocks reused across pages., Render a rich lesson card (learning material) — used by study + vocabulary., render_lesson_card(), _add() (+5 more)

### Community 16 - "Community 16"
Cohesion: 0.18
Nodes (10): code:bash (# Install uv (if you don't have it)), code:bash (# 1. Clone the repo), Configuration, Cost, Features, How it works, Makefile targets, Quickstart (+2 more)

### Community 17 - "Community 17"
Cohesion: 0.22
Nodes (7): page_stats Route, page_home(), page_stats(), page_vocabulary(), app.py — NiceGUI entry point. Page routes: / (home), /study, /sessions, /stats, build_stats(), stats.py — mastery counts, weakest words, progression to next level.

## Knowledge Gaps
- **59 isolated node(s):** `Deployment: local-only web app`, `Stack: FastAPI + SQLite + vanilla JS`, `LLM: DeepSeek V4 Flash (free) via OpenRouter`, `Memory model: Leitner 5-box SRS`, `Word bank: drkameleon/complete-hsk-vocabulary` (+54 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `start_session()` connect `SRS & Session Management` to `Database Layer`, `Sessions UI & Redrill`, `Study UI & Lesson Schema`, `LLM & AI Integration`?**
  _High betweenness centrality (0.092) - this node is a cross-community bridge._
- **Why does `fetchone()` connect `Database Layer` to `Sessions UI & Redrill`, `Home Page UI`, `SRS & Session Management`, `Grading & Cache Pipeline`?**
  _High betweenness centrality (0.070) - this node is a cross-community bridge._
- **Why does `generate_questions()` connect `LLM & AI Integration` to `Sessions UI & Redrill`, `SRS & Session Management`?**
  _High betweenness centrality (0.068) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `start_session()` (e.g. with `page_study()` and `transaction()`) actually correct?**
  _`start_session()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **Are the 7 inferred relationships involving `fetchone()` (e.g. with `start_session_with_words()` and `list_sessions()`) actually correct?**
  _`fetchone()` has 7 INFERRED edges - model-reasoned connections that need verification._
- **Are the 4 inferred relationships involving `transaction()` (e.g. with `_ensure_lesson_card()` and `_create_session()`) actually correct?**
  _`transaction()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **Are the 4 inferred relationships involving `frame()` (e.g. with `inject_theme()` and `build_vocabulary()`) actually correct?**
  _`frame()` has 4 INFERRED edges - model-reasoned connections that need verification._