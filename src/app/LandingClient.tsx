"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Seal from "@/components/Seal";
import { FREE_MAX_VOCAB_WORDS, FREE_MAX_SESSIONS } from "@/lib/config";

export default function LandingClient() {
  const curveRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const [stampSeal, setStampSeal] = useState(false);

  // Draw the forgetting curve when it scrolls into view; stamp the seal when
  // the closing section appears. Both are one-shot.
  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    if (curveRef.current) {
      const el = curveRef.current;
      const io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (e.isIntersecting) {
              el.querySelectorAll(".curve-line, .curve-dot").forEach((n) =>
                n.classList.add("is-drawn")
              );
              io.disconnect();
            }
          }
        },
        { threshold: 0.35 }
      );
      io.observe(el);
      observers.push(io);
    }

    if (footerRef.current) {
      const io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (e.isIntersecting) {
              setStampSeal(true);
              io.disconnect();
            }
          }
        },
        { threshold: 0.5 }
      );
      io.observe(footerRef.current);
      observers.push(io);
    }

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  return (
    <div className="min-h-screen bg-paper relative overflow-x-clip">
      {/* Single ambient hanzi watermark — the manuscript's ghost */}
      <span
        aria-hidden
        className="hanzi fixed bottom-[-6rem] right-[-3rem] text-[26rem] font-bold leading-none select-none pointer-events-none opacity-[0.025] text-ink"
      >
        学
      </span>

      {/* ── Nav ─────────────────────────────────────────────────────── */}
      <header className="relative z-20 border-b border-border bg-paper/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Seal size={32} />
            <span className="font-display text-lg font-semibold text-ink leading-none">
              汉字
              <span className="text-muted font-sans font-normal text-sm ml-1.5">
                Learner
              </span>
            </span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-3">
            <Link
              href="/login"
              className="px-3 py-2 text-sm font-medium text-muted hover:text-ink transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 rounded-xl bg-ink text-paper text-sm font-medium hover:bg-ink/90 transition-colors"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero: the practice grid ─────────────────────────────────── */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 pt-16 sm:pt-24 pb-20">
        <div className="grid lg:grid-cols-[auto_1fr] gap-10 lg:gap-16 items-center">
          {/* The 米字格 copybook cell + vertical rubric */}
          <div className="flex items-stretch gap-4 justify-center lg:justify-start animate-fade-up">
            <span
              aria-hidden
              className="v-upright hanzi text-faint text-sm font-medium pt-1 select-none"
            >
              今日一字
            </span>
            <div className="flex flex-col items-center gap-3">
              <PracticeCell char="学" />
              <div className="text-center font-mono text-xs text-muted">
                <span className="text-seal font-semibold">xué</span>
                <span className="mx-1.5 text-faint">·</span>
                to study, to learn
              </div>
            </div>
          </div>

          {/* Headline */}
          <div className="text-center lg:text-left">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-faint mb-5">
              汉字 · HSK 1 → 6 · spaced repetition
            </p>
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-semibold text-ink leading-[1.05] mb-6">
              Learn Mandarin.
              <br />
              <span className="text-seal">Remember it forever.</span>
            </h1>
            <p className="text-lg text-muted max-w-xl lg:max-w-2xl mx-auto lg:mx-0 mb-8 leading-relaxed">
              Most flashcard apps train recognition. This one trains{" "}
              <em className="text-ink not-italic font-medium">recall</em> —
              AI-written lesson cards, production drills, and a Leitner schedule
              that resurfaces each word the moment before you&rsquo;d forget it.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Link
                href="/signup"
                className="px-8 py-3.5 rounded-xl bg-ink text-paper text-base font-medium hover:bg-ink/90 transition-colors shadow-md"
              >
                Start for free
              </Link>
              <Link
                href="/login"
                className="px-8 py-3.5 rounded-xl border border-border bg-surface text-ink text-base font-medium hover:bg-surface-2 transition-colors"
              >
                Sign in
              </Link>
            </div>
            <p className="mt-5 text-sm text-muted">
              Free account ·{" "}
              <span className="text-ink font-medium">{FREE_MAX_VOCAB_WORDS} words</span> and{" "}
              <span className="text-ink font-medium">{FREE_MAX_SESSIONS} sessions</span> to
              try — not monetized, just a project for learning Mandarin.
            </p>
          </div>
        </div>
      </section>

      {/* ── The forgetting curve: the thesis ────────────────────────── */}
      <section className="relative z-10 border-y border-border bg-surface-2/60">
        <div
          ref={curveRef}
          className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-16 grid lg:grid-cols-[1fr_auto] gap-10 lg:gap-16 items-center"
        >
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-faint mb-3">
              记忆 · the science
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-ink mb-4 leading-tight">
              The forgetting curve, defeated.
            </h2>
            <p className="text-muted leading-relaxed max-w-xl mb-6">
              Memory fades on a predictable curve. Spaced repetition catches each
              word right before it slips — at{" "}
              <span className="text-ink font-medium">8 hours</span>, then{" "}
              <span className="text-ink font-medium">1, 3, 7, and 21 days</span>.
              Every review you pass pushes the next one further out.
            </p>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
              <span className="flex items-center gap-2 text-muted">
                <span className="inline-block w-6 h-px bg-faint" /> without review
              </span>
              <span className="flex items-center gap-2 text-ink font-medium">
                <span className="inline-block w-6 h-[2px] bg-seal" /> with spaced repetition
              </span>
            </div>
          </div>
          <ForgettingCurve />
        </div>
      </section>

      {/* ── How it works: a real sequence ───────────────────────────── */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-20">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-faint mb-3">
          流程 · how a session runs
        </p>
        <h2 className="font-display text-3xl sm:text-4xl font-semibold text-ink mb-12 leading-tight max-w-2xl">
          Five steps, every session, from new word to next review.
        </h2>
        <ol className="relative border-l border-border ml-5 sm:ml-7 space-y-10">
          {STEPS.map((s) => (
            <li key={s.cn} className="relative pl-8 sm:pl-12">
              <span
                aria-hidden
                className="hanzi absolute -left-[1.15rem] sm:-left-[1.4rem] top-0 flex items-center justify-center w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-paper border border-seal/40 text-seal text-lg sm:text-xl font-bold"
              >
                {s.cn}
              </span>
              <h3 className="font-display text-xl font-semibold text-ink mb-1">
                {s.title}
              </h3>
              <p className="text-muted leading-relaxed max-w-2xl">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ── Also inside ─────────────────────────────────────────────── */}
      <section className="relative z-10 border-y border-border bg-surface-2/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-16">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-faint mb-8">
            还有 · also inside
          </p>
          <dl className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-8">
            {EXTRAS.map((x) => (
              <div key={x.title} className="flex gap-4">
                <span
                  aria-hidden
                  className="hanzi text-3xl text-seal/70 leading-none shrink-0 w-8 text-center"
                >
                  {x.glyph}
                </span>
                <div>
                  <dt className="font-semibold text-ink mb-1">{x.title}</dt>
                  <dd className="text-sm text-muted leading-relaxed">{x.body}</dd>
                </div>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── HSK ladder: a staircase ─────────────────────────────────── */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-20">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-faint mb-3">
          级 · the climb
        </p>
        <h2 className="font-display text-3xl sm:text-4xl font-semibold text-ink mb-2 leading-tight">
          Climb the HSK ladder.
        </h2>
        <p className="text-muted mb-12 max-w-xl">
          Pick your level at sign-up and change it any time. Each rung roughly
          doubles the vocabulary you command.
        </p>
        <div className="flex items-end gap-2 sm:gap-4 overflow-x-auto pb-2">
          {HSK_LEVELS.map(({ level, words, label, h }) => (
            <div
              key={level}
              className="flex-1 min-w-[4.5rem] flex flex-col items-center gap-3"
            >
              <span className="font-mono text-xs text-faint">~{words}</span>
              <div
                className="w-full rounded-t-lg bg-seal/10 border border-seal/25 border-b-0 flex items-start justify-center pt-2"
                style={{ height: `${h}px` }}
              >
                <span className="font-display text-2xl sm:text-3xl font-bold text-seal">
                  {level}
                </span>
              </div>
              <div className="text-center border-t-2 border-ink pt-2 w-full">
                <p className="text-xs font-semibold text-ink uppercase tracking-wider">
                  HSK {level}
                </p>
                <p className="text-[0.7rem] text-faint">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Open source / self-host ─────────────────────────────────── */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 pb-20">
        <div className="bg-ink text-paper rounded-3xl p-8 sm:p-12 flex flex-col lg:flex-row items-start lg:items-center gap-8">
          <span
            aria-hidden
            className="hanzi text-7xl text-paper/15 leading-none shrink-0 select-none"
          >
            源
          </span>
          <div className="flex-1">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-paper/40 mb-3">
              开源 · open source
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-semibold mb-3">
              Run your own copy.
            </h2>
            <p className="text-paper/70 leading-relaxed mb-2">
              The hosted version is capped to keep AI costs near zero, but the
              whole project is on GitHub. Clone it, plug in your own Supabase
              project and an optional LLM key, and run it locally with no limits.
            </p>
            <p className="text-paper/70 leading-relaxed">
              Want it even lighter? The{" "}
              <code className="font-mono text-paper/90 bg-paper/10 px-1.5 py-0.5 rounded">
                local
              </code>{" "}
              branch is a self-contained Python app — no cloud, no account, just
              one Docker command.
            </p>
          </div>
          <a
            href="https://github.com/ChrisJulLimantoro/chinese-learner"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 px-6 py-3 rounded-xl bg-paper text-ink text-sm font-medium hover:bg-paper/90 transition-colors"
          >
            View on GitHub →
          </a>
        </div>
      </section>

      {/* ── Footer CTA: the stamp ───────────────────────────────────── */}
      <section className="relative z-10 bg-surface border-t border-border">
        <div
          ref={footerRef}
          className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-20 text-center"
        >
          <Seal size={56} stamp={stampSeal} className="mx-auto mb-6" />
          <h2 className="font-display text-3xl sm:text-4xl font-semibold text-ink mb-4">
            Stamp it into memory.
          </h2>
          <p className="text-muted mb-8 max-w-md mx-auto">
            Create a free account and begin your first study session in minutes.
          </p>
          <Link
            href="/signup"
            className="inline-block px-8 py-3.5 rounded-xl bg-ink text-paper text-base font-medium hover:bg-ink/90 transition-colors shadow-md"
          >
            Create free account
          </Link>
        </div>
      </section>
    </div>
  );
}

/* ── The 米字格 practice cell ───────────────────────────────────────── */
function PracticeCell({ char }: { char: string }) {
  return (
    <div className="relative w-44 h-44 sm:w-56 sm:h-56 bg-surface rounded-xl border-2 border-seal/70 shadow-md">
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 w-full h-full"
        aria-hidden
      >
        <g stroke="var(--seal)" strokeOpacity="0.3" strokeWidth="0.6" strokeDasharray="3 3">
          <line x1="50" y1="6" x2="50" y2="94" />
          <line x1="6" y1="50" x2="94" y2="50" />
          <line x1="12" y1="12" x2="88" y2="88" />
          <line x1="88" y1="12" x2="12" y2="88" />
        </g>
      </svg>
      <span className="hanzi animate-hanzi-in absolute inset-0 flex items-center justify-center text-7xl sm:text-8xl font-bold text-ink select-none">
        {char}
      </span>
    </div>
  );
}

/* ── Forgetting-curve SVG ──────────────────────────────────────────── */
function ForgettingCurve() {
  // Review points (memory back to full) along the x-axis. x grows with the
  // widening Leitner intervals; labels mirror the app's real box schedule.
  const reviews = [
    { x: 40, label: "8h" },
    { x: 120, label: "1d" },
    { x: 240, label: "3d" },
    { x: 400, label: "7d" },
    { x: 560, label: "21d" },
  ];

  return (
    <svg
      viewBox="0 0 600 230"
      className="w-full max-w-xl lg:w-[34rem] h-auto"
      role="img"
      aria-label="Memory strength over time: without review it decays toward zero; with spaced repetition each review resets it before it slips."
    >
      {/* axes */}
      <line x1="40" y1="190" x2="590" y2="190" stroke="var(--border)" strokeWidth="1" />
      <line x1="40" y1="10" x2="40" y2="190" stroke="var(--border)" strokeWidth="1" />
      <text x="44" y="20" className="fill-faint" fontSize="10" fontFamily="var(--font-mono)">
        memory
      </text>
      <text x="560" y="205" className="fill-faint" fontSize="10" fontFamily="var(--font-mono)">
        time →
      </text>

      {/* without review — decays away */}
      <path
        className="curve-line"
        pathLength={1}
        d="M40,20 Q 160,150 300,176 T 590,186"
        fill="none"
        stroke="var(--text-faint)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* with SRS — sawtooth that resets at each review, decaying ever shallower */}
      <path
        className="curve-line"
        pathLength={1}
        style={{ animationDelay: "0.3s" }}
        d="M40,20 Q 75,55 110,70 L120,20 Q 180,45 230,60 L240,20 Q 320,42 390,52 L400,20 Q 480,38 550,46 L560,20 Q 580,32 600,40"
        fill="none"
        stroke="var(--seal)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* review stamps */}
      {reviews.map((r, i) => (
        <g key={r.label}>
          <circle
            className="curve-dot"
            style={{ animationDelay: `${1 + i * 0.12}s` }}
            cx={r.x}
            cy={20}
            r={4}
            fill="var(--seal)"
          />
          <text
            x={r.x}
            y={188}
            textAnchor="middle"
            className="fill-muted"
            fontSize="10"
            fontFamily="var(--font-mono)"
          >
            {r.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

const STEPS = [
  {
    cn: "一",
    title: "Choose",
    body: "New words blend with reviews that are due, weighted by frequency so you learn the words you'll actually meet first.",
  },
  {
    cn: "二",
    title: "Learn",
    body: "Each new word gets an AI lesson card: core meanings, example sentences, collocations, character breakdown, and a mnemonic.",
  },
  {
    cn: "三",
    title: "Drill",
    body: "You type the answer — translate EN→ZH, fill the blank, tell near-synonyms apart. Production, not multiple choice.",
  },
  {
    cn: "四",
    title: "Grade",
    body: "The AI reads your free text and grades meaning, not spelling — it accepts synonyms and explains what you missed.",
  },
  {
    cn: "五",
    title: "Schedule",
    body: "Each word's Leitner box moves up or down, setting exactly when it resurfaces — right before you'd forget it.",
  },
];

const EXTRAS = [
  {
    glyph: "析",
    title: "Progress tracking",
    body: "Mastery rates, study streaks, your weakest words, and the SRS box distribution across every HSK level.",
  },
  {
    glyph: "复",
    title: "Re-drill sessions",
    body: "Stumbled on a word? Re-run any completed session with the same or fresh questions to lock it in.",
  },
  {
    glyph: "通",
    title: "Works everywhere",
    body: "Responsive on desktop and mobile, with progress that syncs instantly across your devices.",
  },
];

const HSK_LEVELS = [
  { level: 1, words: 150, label: "Beginner", h: 48 },
  { level: 2, words: 300, label: "Elementary", h: 74 },
  { level: 3, words: 600, label: "Intermediate", h: 100 },
  { level: 4, words: 1200, label: "Upper-int.", h: 126 },
  { level: 5, words: 2500, label: "Advanced", h: 154 },
  { level: 6, words: 5000, label: "Proficiency", h: 180 },
];
