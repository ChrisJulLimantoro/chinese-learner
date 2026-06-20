"use client";

import type { Stats } from "@/lib/types";
import { Card, Badge, ProgressBar, PageHeader, Bento } from "@/components/ui";

/** SVG ring — strokeDashoffset trick */
function MasteryRing({ pct }: { pct: number }) {
  const r = 52;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct / 100);

  return (
    <svg viewBox="0 0 128 128" className="w-32 h-32" aria-hidden>
      {/* Track */}
      <circle cx="64" cy="64" r={r} fill="none" stroke="var(--surface-2)" strokeWidth="10" />
      {/* Fill */}
      <circle
        cx="64"
        cy="64"
        r={r}
        fill="none"
        stroke="var(--jade)"
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        transform="rotate(-90 64 64)"
        style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.22,1,0.36,1)" }}
      />
      {/* Label */}
      <text x="64" y="60" textAnchor="middle" fontSize="22" fontWeight="700" fill="var(--ink)" fontFamily="var(--font-fraunces)">
        {pct}%
      </text>
      <text x="64" y="78" textAnchor="middle" fontSize="9" fill="var(--text-muted)" fontFamily="var(--font-geist-sans)" letterSpacing="1">
        MASTERY
      </text>
    </svg>
  );
}

export default function StatsClient({ stats }: { stats: Stats | null }) {
  if (!stats) {
    return (
      <div>
        <PageHeader eyebrow="Your progress" title="Stats" />
        <Card variant="paper" padding="lg" className="text-center">
          <p className="text-muted">No data yet. Start studying to see your stats!</p>
        </Card>
      </div>
    );
  }

  const masteryPct = stats.mastery_pct;
  const progressPct = Math.min(
    100,
    stats.next_level_progress.total > 0
      ? (stats.next_level_progress.mastered / Math.max(stats.next_level_progress.total, 150)) * 100
      : 0
  );

  return (
    <div>
      <PageHeader eyebrow="Your progress" title="Stats" />

      <Bento className="mb-6">
        {/* ── Mastery hero ── */}
        <div className="col-span-1 sm:col-span-2 lg:col-span-4">
          <Card variant="elevated" padding="lg" className="h-full flex flex-col items-center justify-center gap-3 text-center">
            <MasteryRing pct={masteryPct} />
            <div>
              <p className="font-display text-lg font-semibold text-ink">
                HSK {stats.level} Mastery
              </p>
              <p className="text-sm text-muted mt-0.5">
                {stats.mastered} / {stats.total} words mastered
              </p>
            </div>
          </Card>
        </div>

        {/* ── Stat tiles ── */}
        <div className="col-span-1 sm:col-span-4 lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card variant="paper" padding="md" className="flex flex-col gap-1">
            <p className="text-xs font-semibold uppercase tracking-widest text-faint">Due</p>
            <p className="font-display text-4xl font-semibold text-ochre mt-1">{stats.due_count}</p>
            <p className="text-xs text-muted">reviews waiting</p>
          </Card>

          <Card variant="paper" padding="md" className="flex flex-col gap-1">
            <p className="text-xs font-semibold uppercase tracking-widest text-faint">Streak</p>
            <p className="font-display text-4xl font-semibold text-jade mt-1">{stats.streak_days}d</p>
            <p className="text-xs text-muted">days in a row</p>
          </Card>

          <Card variant="paper" padding="md" className="flex flex-col gap-1">
            <p className="text-xs font-semibold uppercase tracking-widest text-faint">Level</p>
            <p className="font-display text-4xl font-semibold text-ink mt-1">HSK {stats.level}</p>
            <p className="text-xs text-muted">current level</p>
          </Card>

          {/* Progress to next level — spans full width of this 3-col sub-grid */}
          <Card variant="paper" padding="md" className="sm:col-span-3">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-faint">
                  Progress to HSK {stats.level + 1}
                </p>
                <p className="text-sm text-muted mt-0.5">
                  {stats.next_level_progress.mastered} mastered · need 150+
                </p>
              </div>
              {stats.next_level_progress.can_advance && (
                <Badge variant="jade">Ready!</Badge>
              )}
            </div>
            <ProgressBar value={progressPct} max={100} color="jade" height="sm" />
          </Card>
        </div>
      </Bento>

      {/* ── Weakest words ── */}
      {stats.weakest.length > 0 && (
        <Card variant="paper" padding="none">
          <div className="px-5 py-4 border-b border-border">
            <p className="text-xs font-semibold uppercase tracking-widest text-faint">Weakest words</p>
          </div>
          <div className="divide-y divide-border">
            {stats.weakest.map((w, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-3.5">
                <span className="font-mono text-xs text-faint w-4">{i + 1}</span>
                <span className="hanzi text-xl font-bold text-ink">{w.simplified}</span>
                <span className="text-sm text-muted">{w.pinyin}</span>
                <div className="ml-auto flex items-center gap-3">
                  <span className="text-xs text-faint font-mono">box {w.box}</span>
                  <Badge variant="seal">{w.wrong_count} wrong</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
