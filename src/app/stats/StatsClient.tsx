"use client";

import type { Stats } from "@/lib/types";
import { Card, Badge, ProgressBar, PageHeader } from "@/components/ui";

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
      <div className="space-y-6">
        <PageHeader rubric="进度" eyebrow="Your progress" title="Stats" />
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
    <div className="space-y-6">
      <PageHeader rubric="进度" eyebrow="Your progress" title="Progress Atlas" />

      {/* Mastery atlas card */}
      <div className="flex rounded-2xl border border-border shadow-sm bg-surface overflow-hidden">
        <div className="w-10 flex-shrink-0 border-r border-border bg-surface-2/50 flex flex-col items-center py-6">
          <span className="hanzi v-rl text-seal/25 text-2xl font-bold select-none leading-none">势</span>
          <span className="v-rl text-faint text-[10px] font-mono mt-auto tracking-widest">ATLAS</span>
        </div>
        <div className="flex-1 min-w-0 p-5">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-center">
            <div className="flex justify-center lg:justify-start">
              <MasteryRing pct={masteryPct} />
            </div>

            <div className="lg:col-span-2 grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-border/70 bg-paper px-3 py-3 text-center">
                <p className="text-[10px] font-mono uppercase tracking-widest text-faint">Due</p>
                <p className="font-display text-3xl text-ochre mt-1">{stats.due_count}</p>
              </div>
              <div className="rounded-xl border border-border/70 bg-paper px-3 py-3 text-center">
                <p className="text-[10px] font-mono uppercase tracking-widest text-faint">Streak</p>
                <p className="font-display text-3xl text-jade mt-1">{stats.streak_days}d</p>
              </div>
              <div className="rounded-xl border border-border/70 bg-paper px-3 py-3 text-center">
                <p className="text-[10px] font-mono uppercase tracking-widest text-faint">Level</p>
                <p className="font-display text-3xl text-ink mt-1">HSK {stats.level}</p>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-border/70 bg-paper px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-[10px] font-mono uppercase tracking-widest text-faint">
                  Toward HSK {stats.level + 1}
                </p>
                <p className="text-sm text-muted mt-0.5">
                  {stats.next_level_progress.mastered} mastered, 150 needed
                </p>
              </div>
              {stats.next_level_progress.can_advance && (
                <Badge variant="jade">Ready</Badge>
              )}
            </div>
            <ProgressBar value={progressPct} max={100} color="jade" height="sm" />
          </div>
        </div>
      </div>

      {/* Weakest words ledger */}
      {stats.weakest.length > 0 && (
        <div className="flex rounded-2xl border border-border shadow-sm bg-surface overflow-hidden">
          <div className="w-10 flex-shrink-0 border-r border-border bg-surface-2/50 flex flex-col items-center py-6">
            <span className="hanzi v-rl text-seal/25 text-2xl font-bold select-none leading-none">弱</span>
            <span className="v-rl text-faint text-[10px] font-mono mt-auto tracking-widest">WEAK</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="px-4 py-3 border-b border-border">
              <p className="text-[10px] font-mono uppercase tracking-widest text-faint">Weakest words</p>
            </div>
            <div className="divide-y divide-border">
              {stats.weakest.map((w, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3.5">
                  <span className="font-mono text-xs text-faint w-4">{i + 1}</span>
                  <span className="hanzi text-xl font-bold text-ink">{w.simplified}</span>
                  <span className="text-sm text-muted">{w.pinyin}</span>
                  <div className="ml-auto flex items-center gap-2">
                    <span className="text-xs text-faint font-mono">box {w.box}</span>
                    <Badge variant="seal">{w.wrong_count} wrong</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
