"""
theme.py — Midnight Ink design system (single source of truth for look & feel).

Dark, atmospheric theme for focused HSK study:
  - charcoal canvas with dim ambient glow + grain
  - jade (primary / correct / progress), gold (pinyin / level / highlights),
    vermillion (wrong / over-time)
  - Noto Serif SC for hanzi, Fraunces for display, Manrope for body, JetBrains Mono for numbers

Pages call `inject_theme()` once (via layout.frame) then use the semantic CSS
classes defined here (.surface, .headword, .pinyin, .muted, .section-title,
.stat-card, .nav-link, .pill-*) instead of raw colors.
"""
from nicegui import ui

PALETTE = {
    "bg": "#14171C",
    "surface": "#1C2128",
    "surface_2": "#20262E",
    "border": "#2A323C",
    "ink": "#E8EAED",
    "muted": "#9BA3AF",
    "faint": "#6B7280",
    "jade": "#4ADE80",
    "jade_dim": "#2E7D5B",
    "gold": "#E0B341",
    "vermillion": "#EF6F5E",
}

# Named exports + backward-compatible alias
BG = PALETTE["bg"]
JADE = PALETTE["jade"]
GOLD = PALETTE["gold"]
VERMILLION = PALETTE["vermillion"]
ACCENT = JADE  # legacy alias used by older call sites


_THEME_HTML = """
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Manrope:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&family=Noto+Serif+SC:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  :root {
    --bg: #14171C;
    --surface: #1C2128;
    --surface-2: #20262E;
    --border: #2A323C;
    --ink: #E8EAED;
    --muted: #9BA3AF;
    --faint: #6B7280;
    --jade: #4ADE80;
    --jade-dim: #2E7D5B;
    --gold: #E0B341;
    --vermillion: #EF6F5E;
    --font-hanzi: 'Noto Serif SC', serif;
    --font-display: 'Fraunces', Georgia, serif;
    --font-body: 'Manrope', -apple-system, sans-serif;
    --font-mono: 'JetBrains Mono', monospace;
  }

  /* ---- canvas + atmosphere ---- */
  html, body, .q-page-container, .nicegui-content {
    background: var(--bg) !important;
    color: var(--ink);
    font-family: var(--font-body);
  }
  body::before {
    content: "";
    position: fixed;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    background:
      radial-gradient(900px 600px at 12% -5%, rgba(74,222,128,0.10), transparent 60%),
      radial-gradient(900px 600px at 105% 110%, rgba(224,179,65,0.08), transparent 60%);
  }
  /* faint grain overlay */
  body::after {
    content: "";
    position: fixed;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    opacity: 0.035;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  }
  .nicegui-content { position: relative; z-index: 1; }

  /* ---- typography helpers ---- */
  .font-display { font-family: var(--font-display); }
  .font-mono { font-family: var(--font-mono); }
  .headword {
    font-family: var(--font-hanzi);
    color: var(--ink);
    line-height: 1.05;
    text-shadow: 0 0 28px rgba(224,179,65,0.28), 0 0 6px rgba(224,179,65,0.18);
  }
  .pinyin { font-family: var(--font-mono); color: var(--gold); letter-spacing: 0.02em; }
  .muted { color: var(--muted); }
  .faint { color: var(--faint); }
  .ink { color: var(--ink); }
  .accent-jade { color: var(--jade); }
  .accent-gold { color: var(--gold); }
  .accent-vermillion { color: var(--vermillion); }

  .section-title {
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.18em;
    color: var(--faint);
    font-weight: 600;
  }

  /* ---- surfaces ---- */
  .surface, .q-card {
    background: var(--surface) !important;
    border: 1px solid var(--border) !important;
    border-radius: 14px !important;
    box-shadow: 0 8px 28px rgba(0,0,0,0.35) !important;
    color: var(--ink);
  }
  .surface-flat {
    background: var(--surface-2);
    border: 1px solid var(--border);
    border-radius: 12px;
  }

  .stat-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 1.1rem 1.25rem;
    min-width: 132px;
    text-align: center;
    transition: transform .18s ease, border-color .18s ease;
  }
  .stat-card:hover { transform: translateY(-3px); border-color: var(--jade-dim); }
  .stat-num { font-family: var(--font-display); font-size: 1.9rem; font-weight: 600; line-height: 1; }

  /* ---- nav ---- */
  .nav-link {
    display: block;
    padding: 0.55rem 0.85rem;
    border-radius: 10px;
    font-size: 0.9rem;
    font-weight: 500;
    color: var(--muted);
    text-decoration: none;
    border: 1px solid transparent;
    transition: all .15s ease;
  }
  .nav-link:hover { color: var(--ink); background: var(--surface-2); }
  .nav-link.active {
    color: var(--jade);
    background: rgba(74,222,128,0.08);
    border-color: rgba(74,222,128,0.25);
  }

  /* ---- pills / badges ---- */
  .pill {
    display: inline-flex; align-items: center;
    font-size: 0.7rem; font-weight: 600;
    padding: 0.15rem 0.6rem; border-radius: 999px;
    border: 1px solid transparent; letter-spacing: 0.02em;
  }
  .pill-jade { color: var(--jade); background: rgba(74,222,128,0.10); border-color: rgba(74,222,128,0.30); }
  .pill-gold { color: var(--gold); background: rgba(224,179,65,0.10); border-color: rgba(224,179,65,0.30); }
  .pill-red { color: var(--vermillion); background: rgba(239,111,94,0.10); border-color: rgba(239,111,94,0.30); }
  .pill-muted { color: var(--muted); background: var(--surface-2); border-color: var(--border); }

  /* ---- buttons ---- */
  .btn-jade.q-btn {
    background: var(--jade) !important; color: #0B130E !important;
    font-weight: 700 !important; border-radius: 10px !important;
    box-shadow: 0 0 0 rgba(74,222,128,0); transition: all .18s ease;
  }
  .btn-jade.q-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(74,222,128,0.35); }
  .btn-ghost.q-btn {
    color: var(--gold) !important; border: 1px solid var(--border) !important;
    border-radius: 10px !important; background: transparent !important;
    transition: all .18s ease;
  }
  .btn-ghost.q-btn:hover { border-color: var(--gold) !important; background: rgba(224,179,65,0.06) !important; }

  /* ---- pinyin hint buttons ---- */
  .hint-btn.q-btn {
    color: var(--muted) !important;
    border: 1px dashed var(--border) !important;
    border-radius: 999px !important;
    background: transparent !important;
    font-size: 0.72rem !important;
    padding: 0.15rem 0.65rem !important;
    min-height: 0 !important;
    transition: all .15s ease;
  }
  .hint-btn.q-btn:hover {
    color: var(--gold) !important;
    border-color: var(--gold) !important;
    background: rgba(224,179,65,0.05) !important;
  }
  .hint-btn.used.q-btn {
    color: var(--gold) !important;
    border-color: var(--gold) !important;
    background: rgba(224,179,65,0.08) !important;
  }
  .hint-text {
    font-family: var(--font-mono);
    color: var(--gold);
    font-size: 0.85rem;
    letter-spacing: 0.02em;
  }

  /* ---- inputs (drill answer) ---- */
  .answer-input .q-field__control {
    background: var(--surface-2) !important;
    border-radius: 12px !important;
    transition: box-shadow .18s ease;
  }
  .answer-input .q-field__control:before { border-color: var(--border) !important; }
  .answer-input.q-field--focused .q-field__control {
    box-shadow: 0 0 0 2px var(--jade), 0 0 22px rgba(74,222,128,0.30) !important;
  }
  .answer-input .q-field__native, .answer-input input { color: var(--ink) !important; font-size: 1.15rem; }

  /* progress bar */
  .q-linear-progress { color: var(--jade) !important; border-radius: 999px; }

  .q-drawer { box-shadow: none !important; background: var(--surface) !important; }
  .q-drawer * { box-sizing: border-box; }
  .nicegui-content { padding: 0 !important; }
  .q-separator { background: var(--border) !important; }

  /* zero NiceGUI's default drawer padding/gap so section dividers span full width */
  .q-drawer .q-drawer__content,
  .q-drawer .nicegui-column,
  .q-drawer > .nicegui-content {
    padding: 0 !important;
    gap: 0 !important;
    width: 100% !important;
  }
  .q-drawer .nav-link,
  .q-drawer .nicegui-link { display: block; width: 100%; }

  /* segmented control / phase tabs for the session builder + run header */
  .seg {
    display: inline-flex; gap: 0.25rem; padding: 0.25rem;
    background: var(--surface-2); border: 1px solid var(--border); border-radius: 12px;
  }
  .seg-item {
    padding: 0.4rem 0.9rem; border-radius: 9px; font-size: 0.85rem; font-weight: 600;
    color: var(--muted); cursor: pointer; transition: all .15s ease; border: 1px solid transparent;
  }
  .seg-item:hover { color: var(--ink); }
  .seg-item.active {
    color: var(--jade); background: rgba(74,222,128,0.10); border-color: rgba(74,222,128,0.30);
  }

  /* ---- motion ---- */
  @keyframes fadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
  .fade-up { opacity: 0; animation: fadeUp .5s cubic-bezier(.2,.7,.3,1) forwards; }
  .d1 { animation-delay: .05s; } .d2 { animation-delay: .12s; }
  .d3 { animation-delay: .19s; } .d4 { animation-delay: .26s; } .d5 { animation-delay: .33s; }

  @keyframes jadePulse {
    0% { box-shadow: 0 0 0 0 rgba(74,222,128,0.45); }
    100% { box-shadow: 0 0 0 16px rgba(74,222,128,0); }
  }
  .pulse-jade { animation: jadePulse .7s ease-out; }
  @keyframes shake {
    10%,90% { transform: translateX(-1px); } 20%,80% { transform: translateX(2px); }
    30%,50%,70% { transform: translateX(-4px); } 40%,60% { transform: translateX(4px); }
  }
  .shake { animation: shake .5s; }
  @keyframes timerPulse { 0%,100% { opacity: 1; } 50% { opacity: 0.55; } }
  .timer-over { animation: timerPulse 1s infinite; }
</style>
"""


def inject_theme() -> None:
    """Emit the Midnight Ink stylesheet + fonts into the page head (call once per page)."""
    ui.add_head_html(_THEME_HTML)
