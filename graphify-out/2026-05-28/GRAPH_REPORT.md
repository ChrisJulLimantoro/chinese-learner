# Graph Report - .  (2026-05-27)

## Corpus Check
- Corpus is ~11,506 words - fits in a single context window. You may not need a graph.

## Summary
- 169 nodes · 287 edges · 16 communities (11 shown, 5 thin omitted)
- Extraction: 84% EXTRACTED · 16% INFERRED · 0% AMBIGUOUS · INFERRED: 46 edges (avg confidence: 0.86)
- Token cost: 18,500 input · 5,800 output

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

## God Nodes (most connected - your core abstractions)
1. `start_session()` - 18 edges
2. `fetchone()` - 15 edges
3. `transaction()` - 12 edges
4. `fetchall()` - 10 edges
5. `grade_answer()` - 9 edges
6. `load_session()` - 9 edges
7. `redrill_session()` - 9 edges
8. `get_stats()` - 9 edges
9. `update_srs()` - 9 edges
10. `build_home()` - 9 edges

## Surprising Connections (you probably didn't know these)
- `Session Lifecycle (create/answer/complete/resume/redrill/review)` --references--> `start_session()`  [INFERRED]
  specs/spec.md → src/learner/services.py
- `Lesson Card JSON Schema` --references--> `generate_lesson_card()`  [INFERRED]
  specs/spec.md → src/learner/llm.py
- `Grader Output JSON Schema` --references--> `grade()`  [INFERRED]
  specs/spec.md → src/learner/llm.py
- `LLM Minimization Strategy` --rationale_for--> `_ensure_lesson_card()`  [INFERRED]
  architecture.md → src/learner/services.py
- `Service Layer (internal Python, no HTTP)` --references--> `start_session()`  [INFERRED]
  specs/spec.md → src/learner/services.py

## Hyperedges (group relationships)
- **LLM Minimization: Cache-First + Batch Strategy** — learner_grading_grade_answer_with_cache, learner_grading_check_cache, learner_grading_store_cache, learner_services_ensure_lesson_card, learner_services_start_session [INFERRED 0.95]
- **Session Persistence: cursor-based save/resume/redrill/review** — learner_services_start_session, learner_services_grade_answer, learner_services_load_session, learner_services_redrill_session, learner_services_get_in_progress_session [EXTRACTED 1.00]
- **Leitner SRS Flow: word selection → answer → promote/demote** — learner_srs_get_mixed_words, learner_srs_update_srs, learner_srs_check_progression, learner_config_box_intervals [INFERRED 0.95]

## Communities (16 total, 5 thin omitted)

### Community 0 - "Database Layer"
Cohesion: 0.16
Nodes (21): DB_PATH, execute(), fetchall(), fetchone(), get_conn(), get_user_profile(), init_db(), db.py — SQLite connection, schema init, thin query helpers. (+13 more)

### Community 1 - "LLM & AI Integration"
Cohesion: 0.15
Nodes (20): MODEL_BY_PURPOSE, USE_STUB Flag, _chat(), _extract_json(), generate_lesson_card(), generate_questions(), _get_client(), grade() (+12 more)

### Community 2 - "SRS & Session Management"
Cohesion: 0.15
Nodes (18): Leak-Plugger SRS Rule, Leitner 5-Box SRS Design Decision, BOX_INTERVALS (SRS Box Durations), Pick words, gen/cache lesson cards + questions, persist session + items.     Ret, start_session(), _current_level(), ensure_srs_state(), get_due_words() (+10 more)

### Community 3 - "Grading & Cache Pipeline"
Cohesion: 0.16
Nodes (16): LLM Minimization Strategy, jdump(), jload(), check_cache(), grade_answer_with_cache(), normalize(), grading.py — normalize → accepted_answers cache → escalate to llm.grade. Local-g, Trim and strip punctuation from a Mandarin answer. (+8 more)

### Community 4 - "App Entry & Navigation"
Cohesion: 0.13
Nodes (14): page_stats Route, NiceGUI Over vanilla JS Decision, page_home(), page_sessions(), page_stats(), app.py — NiceGUI entry point. Page routes: / (home), /study, /sessions, /stats, frame(), _nav_link() (+6 more)

### Community 5 - "Session Service Layer"
Cohesion: 0.16
Nodes (13): get_in_progress_session(), list_sessions(), load_session(), services.py — service layer (spec §8). Plain Python called by NiceGUI UI. No HTT, Load a session + all items (with saved answers/grading) + cursor., Return recent sessions with basic stats., Returns (correct_count, total_answered) for a session., Clone a completed session into a new redrill session.     Default: reuse saved q (+5 more)

### Community 6 - "Study UI & Lesson Schema"
Cohesion: 0.17
Nodes (14): page_study Route, page_study(), Grader Output JSON Schema, Lesson Card JSON Schema, build_study(), build_study_page(), study.py — two-phase study view: material flashcard → drill phase. Material phas, Render the full study view for a session. (+6 more)

### Community 7 - "Wordbank Import"
Cohesion: 0.24
Nodes (10): words_table_empty(), ensure_wordbank(), _fetch_raw(), import_wordbank(), _parse_level(), wordbank.py — fetch complete.json from drkameleon/complete-hsk-vocabulary, parse, Called at app startup: import if empty., Fetch complete.json, trying master branch first, then main. (+2 more)

### Community 8 - "Sessions UI & Redrill"
Cohesion: 0.31
Nodes (9): page_sessions Route, build_sessions(), _do_redrill(), _fmt_time(), sessions.py — session list with status badges + Resume/Re-drill/Review actions., Inline read-only review of a session's items., _render_review_page(), _session_card() (+1 more)

### Community 9 - "Home Page UI"
Cohesion: 0.36
Nodes (8): page_home Route, build_home(), _do_redrill(), _fmt_time(), home.py — dashboard: resume callout, start session, due reviews, recent sessions, _session_row(), _start_new(), _status_badge()

## Knowledge Gaps
- **10 isolated node(s):** `PreToolUse`, `allow`, `page_home Route`, `page_sessions Route`, `page_stats Route` (+5 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `start_session()` connect `SRS & Session Management` to `Database Layer`, `LLM & AI Integration`, `Grading & Cache Pipeline`, `Session Service Layer`, `Study UI & Lesson Schema`, `Home Page UI`?**
  _High betweenness centrality (0.180) - this node is a cross-community bridge._
- **Why does `fetchone()` connect `Database Layer` to `SRS & Session Management`, `Grading & Cache Pipeline`, `Session Service Layer`, `Wordbank Import`?**
  _High betweenness centrality (0.125) - this node is a cross-community bridge._
- **Why does `transaction()` connect `Database Layer` to `SRS & Session Management`, `Grading & Cache Pipeline`, `Session Service Layer`, `Wordbank Import`?**
  _High betweenness centrality (0.115) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `start_session()` (e.g. with `page_study()` and `transaction()`) actually correct?**
  _`start_session()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **Are the 4 inferred relationships involving `fetchone()` (e.g. with `list_sessions()` and `get_stats()`) actually correct?**
  _`fetchone()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **Are the 3 inferred relationships involving `transaction()` (e.g. with `_ensure_lesson_card()` and `start_session()`) actually correct?**
  _`transaction()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Are the 3 inferred relationships involving `fetchall()` (e.g. with `_session_score()` and `due_reviews()`) actually correct?**
  _`fetchall()` has 3 INFERRED edges - model-reasoned connections that need verification._