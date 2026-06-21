"use client";

import Link from "next/link";
import Seal from "@/components/Seal";
import { FREE_MAX_VOCAB_WORDS, FREE_MAX_SESSIONS } from "@/lib/config";

export default function LandingClient() {
  return (
    <div className="min-h-screen bg-paper relative overflow-hidden">
      {/* Decorative hanzi watermarks */}
      <span
        aria-hidden
        className="hanzi fixed bottom-[-4rem] right-[-2rem] text-[22rem] font-bold leading-none select-none pointer-events-none opacity-[0.03] text-ink"
      >
        学
      </span>
      <span
        aria-hidden
        className="hanzi fixed top-[-3rem] left-[-2rem] text-[18rem] font-bold leading-none select-none pointer-events-none opacity-[0.025] text-ink"
      >
        汉
      </span>

      {/* Nav bar */}
      <header className="relative z-10 border-b border-border bg-surface/80 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Seal size={32} />
            <span className="font-display text-lg font-semibold text-ink leading-none">
              汉字<span className="text-muted font-sans font-normal text-sm ml-1.5">Learner</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-muted hover:text-ink transition-colors"
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

      {/* Hero */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 pt-20 pb-16 text-center">
        <div className="flex justify-center mb-6">
          <Seal size={72} />
        </div>
        <h1 className="font-display text-5xl sm:text-6xl font-semibold text-ink leading-tight mb-6">
          Learn Mandarin.<br />
          <span className="text-seal">Remember it forever.</span>
        </h1>
        <p className="text-lg text-muted max-w-2xl mx-auto mb-8 leading-relaxed">
          Spaced-repetition flashcards with AI-generated lesson cards, example sentences,
          and adaptive quizzing — built around the official HSK vocabulary curriculum.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
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
      </section>

      {/* Free-tier notice */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 pb-12">
        <div className="bg-ochre/10 border border-ochre/25 rounded-2xl p-5 text-center max-w-xl mx-auto">
          <p className="text-ochre font-medium mb-1">Free & open to try</p>
          <p className="text-sm text-muted leading-relaxed">
            This app runs on a limited AI budget, so each free account gets{" "}
            <strong>{FREE_MAX_VOCAB_WORDS} words</strong> and{" "}
            <strong>{FREE_MAX_SESSIONS} study sessions</strong> (lifetime totals).
            Not monetized — just a project for learning Mandarin.
          </p>
        </div>
      </section>

      {/* Feature grid */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 pb-20">
        <h2 className="font-display text-3xl font-semibold text-ink text-center mb-10">
          How it works
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="bg-surface border border-border rounded-2xl p-6 flex flex-col gap-3"
            >
              <span className="text-3xl leading-none" aria-hidden>{f.icon}</span>
              <h3 className="font-semibold text-ink">{f.title}</h3>
              <p className="text-sm text-muted leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HSK levels overview */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 pb-20">
        <h2 className="font-display text-3xl font-semibold text-ink text-center mb-2">
          Structured around HSK
        </h2>
        <p className="text-center text-muted mb-8">
          Pick your level at sign-up and change it any time.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {HSK_LEVELS.map(({ level, words, label }) => (
            <div
              key={level}
              className="bg-surface border border-border rounded-xl p-4 text-center"
            >
              <p className="font-display text-2xl font-bold text-seal mb-1">{level}</p>
              <p className="text-xs font-semibold text-ink uppercase tracking-wider mb-1">
                HSK {level}
              </p>
              <p className="text-xs text-faint">{label}</p>
              <p className="text-xs text-faint mt-1">~{words} words</p>
            </div>
          ))}
        </div>
      </section>

      {/* Open source / self-host */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 pb-20">
        <div className="bg-ink text-paper rounded-2xl p-8 sm:p-10 flex flex-col lg:flex-row items-start lg:items-center gap-6">
          <span className="text-5xl leading-none shrink-0" aria-hidden>🛠️</span>
          <div className="flex-1">
            <h2 className="font-display text-2xl font-semibold mb-2">
              Open source — run your own copy
            </h2>
            <p className="text-paper/70 text-sm leading-relaxed mb-1">
              The hosted version is capped to keep AI costs near zero, but the whole
              project is on GitHub. Clone it, plug in your own Supabase project and
              (optional) LLM key, and run it locally with no word or session limits.
            </p>
            <p className="text-paper/70 text-sm leading-relaxed">
              Prefer something even lighter? The <code className="font-mono text-paper/90">local</code> branch
              is a self-contained Python app that runs offline with a single command —
              no account or database setup required.
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

      {/* Footer CTA */}
      <section className="relative z-10 bg-surface border-t border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 py-16 text-center">
          <Seal size={48} className="mx-auto mb-4" />
          <h2 className="font-display text-3xl font-semibold text-ink mb-4">
            Ready to start?
          </h2>
          <p className="text-muted mb-8">
            Create a free account and begin your first study session in minutes.
          </p>
          <Link
            href="/signup"
            className="px-8 py-3.5 rounded-xl bg-ink text-paper text-base font-medium hover:bg-ink/90 transition-colors shadow-md"
          >
            Create free account
          </Link>
        </div>
      </section>
    </div>
  );
}

const FEATURES = [
  {
    icon: "🃏",
    title: "Spaced Repetition (SRS)",
    description:
      "Words resurface at the exact moment you're about to forget them. The Leitner system keeps easy words rare and hard words frequent.",
  },
  {
    icon: "✨",
    title: "AI Lesson Cards",
    description:
      "Every word gets a rich card: core meanings, example sentences, collocations, near-synonyms, character breakdowns, and mnemonics.",
  },
  {
    icon: "❓",
    title: "Adaptive Quizzing",
    description:
      "Questions are generated fresh each session — translation, cloze fill-in, synonym discrimination — so you actually recall, not recognize.",
  },
  {
    icon: "📊",
    title: "Progress Tracking",
    description:
      "See mastery rates, study streaks, weakest words, and your SRS box distribution across all HSK levels.",
  },
  {
    icon: "🔁",
    title: "Re-drill Sessions",
    description:
      "Stumbled on a word? Re-drill any completed session with the same or varied questions to lock it in.",
  },
  {
    icon: "📱",
    title: "Works Everywhere",
    description:
      "Responsive design that works equally well on desktop and mobile. Progress syncs instantly across devices.",
  },
];

const HSK_LEVELS = [
  { level: 1, words: 150,  label: "Beginner" },
  { level: 2, words: 300,  label: "Elementary" },
  { level: 3, words: 600,  label: "Intermediate" },
  { level: 4, words: 1200, label: "Upper-int." },
  { level: 5, words: 2500, label: "Advanced" },
  { level: 6, words: 5000, label: "Proficiency" },
];
