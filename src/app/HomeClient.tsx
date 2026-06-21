"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { startSessionAction, redrillSessionAction } from "./actions/session";
import type { Session, SessionSummary, DueReviews } from "@/lib/types";
import { Card, Button, Badge } from "@/components/ui";

function fmtTime(ts: number | null): string {
  if (!ts) return "";
  return new Date(ts * 1000).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusBadgeVariant(status: string) {
  const map: Record<string, "jade" | "ochre" | "muted" | "seal"> = {
    in_progress: "ochre",
    completed: "jade",
    abandoned: "muted",
    redrill: "jade",
  };
  return map[status] ?? "muted";
}

function statusLabel(status: string) {
  const map: Record<string, string> = {
    in_progress: "In progress",
    completed: "Done",
    abandoned: "Abandoned",
    redrill: "Re-drill",
  };
  return map[status] ?? status;
}

const WEEKDAYS_CN = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

const NAV = [
  { cn: "词库", label: "Vocabulary", desc: "Browse the word bank", href: "/vocabulary" },
  { cn: "进度", label: "Stats", desc: "Mastery & streak", href: "/stats" },
  { cn: "记录", label: "Sessions", desc: "Full history", href: "/sessions" },
];

const QUICK = [
  { kind: "new_drop", cn: "新", label: "New words" },
  { kind: "review", cn: "复", label: "Review due" },
  { kind: "mixed", cn: "合", label: "Mixed" },
];

/* The 米字格 practice cell — holds the character for today's state. */
function MiCell({ char }: { char: string }) {
  return (
    <div className="relative w-36 h-36 sm:w-44 sm:h-44 bg-surface rounded-xl border-2 border-seal/60 shadow-sm">
      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full" aria-hidden>
        <g stroke="var(--seal)" strokeOpacity="0.3" strokeWidth="0.6" strokeDasharray="3 3">
          <line x1="50" y1="6" x2="50" y2="94" />
          <line x1="6" y1="50" x2="94" y2="50" />
          <line x1="12" y1="12" x2="88" y2="88" />
          <line x1="88" y1="12" x2="12" y2="88" />
        </g>
      </svg>
      <span
        key={char}
        className="hanzi animate-hanzi-in absolute inset-0 flex items-center justify-center text-6xl sm:text-7xl font-bold text-ink select-none"
      >
        {char}
      </span>
    </div>
  );
}

export default function HomeClient({
  inProgress,
  dueData,
  sessions,
}: {
  inProgress: Session | null;
  dueData: DueReviews;
  sessions: SessionSummary[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const quickStart = async (kind: string) => {
    setLoading(kind);
    try {
      const sess = await startSessionAction(kind);
      router.push(`/study/${sess.session_id}`);
    } catch (e) {
      alert(String(e));
    } finally {
      setLoading(null);
    }
  };

  const doRedrill = async (sessionId: number) => {
    setLoading(`redrill-${sessionId}`);
    try {
      const sess = await redrillSessionAction(sessionId);
      router.push(`/study/${sess.session_id}`);
    } catch (e) {
      alert(String(e));
    } finally {
      setLoading(null);
    }
  };

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "早上好" : hour < 18 ? "下午好" : "晚上好";
  const dateLine = `${WEEKDAYS_CN[now.getDay()]} · ${now.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  })}`;

  const due = dueData.count;
  const inProgressKind = inProgress?.kind.replace("_", " ") ?? "";

  // The day's state drives the grid character, the caption, and the primary call.
  const cell = inProgress
    ? { char: "续", py: "xù", gloss: "continue" }
    : due > 0
      ? { char: "复", py: "fù", gloss: "review" }
      : { char: "学", py: "xué", gloss: "learn" };

  const statusParts = [
    due > 0 ? `${due} review${due !== 1 ? "s" : ""} due` : null,
    inProgress ? `${inProgressKind} session in progress` : null,
  ].filter(Boolean);
  const statusLine = statusParts.length ? statusParts.join(" · ") : "You're all caught up.";

  return (
    <div>
      {/* ── Today's page: the masthead ──────────────────────────────── */}
      <Card variant="elevated" padding="lg" className="mb-6 relative overflow-hidden">
        <span
          aria-hidden
          className="hanzi absolute -right-6 -top-10 text-[11rem] font-bold leading-none select-none pointer-events-none opacity-[0.04] text-ink"
        >
          {greeting}
        </span>

        <div className="relative z-10 grid gap-6 sm:gap-8 sm:grid-cols-[auto_1fr] items-center">
          {/* Adaptive practice cell */}
          <div className="flex flex-col items-center gap-2.5 mx-auto sm:mx-0">
            <MiCell char={cell.char} />
            <p className="font-mono text-xs text-muted">
              <span className="text-seal font-semibold">{cell.py}</span> · {cell.gloss}
            </p>
          </div>

          {/* Greeting + status + actions */}
          <div className="text-center sm:text-left">
            <p className="flex items-center justify-center sm:justify-start gap-2 font-mono text-xs uppercase tracking-[0.2em] text-faint mb-2">
              <span className="hanzi tracking-normal normal-case text-seal/80">主页</span>
              <span>{dateLine}</span>
            </p>
            <h1 className="hanzi text-4xl sm:text-5xl font-bold text-ink leading-tight mb-2">
              {greeting}。
            </h1>
            <p className="text-muted mb-6">{statusLine}</p>

            {/* Primary call — matches the state */}
            <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
              {inProgress ? (
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => router.push(`/study/${inProgress.session_id}`)}
                >
                  Resume {inProgressKind} · {inProgress.cursor}/{inProgress.items.length} →
                </Button>
              ) : due > 0 ? (
                <Button
                  variant="seal"
                  size="lg"
                  onClick={() => quickStart("review")}
                  loading={loading === "review"}
                  disabled={loading !== null}
                >
                  Review {due} now →
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => quickStart("mixed")}
                  loading={loading === "mixed"}
                  disabled={loading !== null}
                >
                  Start a mixed session →
                </Button>
              )}
            </div>

            {/* Full session menu */}
            <div className="mt-5 pt-5 border-t border-border">
              <p className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-faint mb-2.5">
                Or start fresh
              </p>
              <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                {QUICK.map(({ kind, cn, label }) => (
                  <Button
                    key={kind}
                    variant="outline"
                    size="sm"
                    onClick={() => quickStart(kind)}
                    loading={loading === kind}
                    disabled={loading !== null}
                  >
                    <span className="hanzi text-seal/80 mr-1.5">{cn}</span>
                    {label}
                  </Button>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-seal"
                  onClick={() => router.push("/study")}
                >
                  Pick words →
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* ── Notebook index ──────────────────────────────────────────── */}
      <div className="grid sm:grid-cols-3 rounded-2xl border border-border bg-surface overflow-hidden divide-y sm:divide-y-0 sm:divide-x divide-border mb-10">
        {NAV.map((n) => (
          <button
            key={n.href}
            onClick={() => router.push(n.href)}
            className="group flex items-center gap-3 text-left px-5 py-4 hover:bg-surface-2 transition-colors"
          >
            <span className="hanzi text-2xl text-seal/70 shrink-0 w-9 text-center" aria-hidden>
              {n.cn}
            </span>
            <span className="flex-1 min-w-0">
              <span className="block font-display font-semibold text-ink group-hover:text-seal transition-colors">
                {n.label}
              </span>
              <span className="block text-xs text-muted truncate">{n.desc}</span>
            </span>
            <span
              className="text-faint group-hover:text-seal transition-colors shrink-0"
              aria-hidden
            >
              →
            </span>
          </button>
        ))}
      </div>

      {/* ── Practice ledger ─────────────────────────────────────────── */}
      <section>
        <div className="flex items-baseline gap-2 mb-4">
          <span className="hanzi text-seal/80 text-sm" aria-hidden>
            近期
          </span>
          <h2 className="font-display text-xl font-semibold text-ink">Recent practice</h2>
        </div>

        {sessions.length === 0 ? (
          <Card variant="paper" padding="lg">
            <p className="text-muted text-sm text-center">
              No sessions yet — your first one shows up here once you study. Start one above.
            </p>
          </Card>
        ) : (
          <Card variant="paper" padding="none">
            <div className="divide-y divide-border">
              {sessions.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-surface-2 transition-colors"
                >
                  <Badge variant={statusBadgeVariant(s.status)}>{statusLabel(s.status)}</Badge>
                  <span className="text-sm font-medium text-ink capitalize">
                    {s.kind.replace("_", " ")}
                  </span>
                  <span className="font-mono text-xs text-muted">{s.score}</span>
                  <span className="text-xs text-faint hidden sm:block ml-auto">
                    {fmtTime(s.created_at)}
                  </span>
                  <div className="flex gap-1 shrink-0 sm:ml-0 ml-auto">
                    {s.status === "in_progress" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/study/${s.id}`)}
                        className="text-xs"
                      >
                        Resume
                      </Button>
                    )}
                    {s.status === "completed" && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => doRedrill(s.id)}
                          disabled={loading !== null}
                          loading={loading === `redrill-${s.id}`}
                          className="text-xs text-muted"
                        >
                          Re-drill
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/sessions/${s.id}`)}
                          className="text-xs text-ochre"
                        >
                          Review
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </section>
    </div>
  );
}
