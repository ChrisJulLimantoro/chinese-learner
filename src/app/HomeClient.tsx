"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { startSessionAction, redrillSessionAction } from "./actions/session";
import type { Session, SessionSummary, DueReviews } from "@/lib/types";
import { Card, Button, Badge, PageHeader, Bento } from "@/components/ui";
import Seal from "@/components/Seal";

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
    completed:   "jade",
    abandoned:   "muted",
    redrill:     "jade",
  };
  return map[status] ?? "muted";
}

function statusLabel(status: string) {
  const map: Record<string, string> = {
    in_progress: "In progress",
    completed:   "Done",
    abandoned:   "Abandoned",
    redrill:     "Re-drill",
  };
  return map[status] ?? status;
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

  const todayHour = new Date().getHours();
  const greeting =
    todayHour < 12 ? "早上好" : todayHour < 18 ? "下午好" : "晚上好";

  return (
    <div>
      <PageHeader eyebrow="Dashboard" title="Good day" />

      <Bento className="mb-8">
        {/* ── Today focus card ── col-span-8 lg */}
        <div className="col-span-1 sm:col-span-6 lg:col-span-8">
          <Card variant="elevated" padding="lg" className="h-full relative overflow-hidden">
            {/* Decorative hanzi watermark */}
            <span
              aria-hidden
              className="hanzi absolute -right-4 -top-8 text-[10rem] font-bold leading-none select-none pointer-events-none opacity-[0.04] text-ink"
            >
              {greeting}
            </span>

            <div className="relative z-10 flex flex-col h-full gap-5">
              <div>
                <p className="hanzi text-4xl font-bold text-ink mb-1">{greeting}</p>
                <p className="text-muted text-sm">Ready to study today?</p>
              </div>

              {dueData.count > 0 && (
                <div className="flex items-center gap-3 bg-ochre/10 rounded-xl px-4 py-3 border border-ochre/20">
                  <span className="text-xl text-ochre" aria-hidden>◷</span>
                  <div>
                    <p className="text-sm font-semibold text-ochre">
                      {dueData.count} review{dueData.count !== 1 ? "s" : ""} due
                    </p>
                    <p className="text-xs text-muted">Don&apos;t let them pile up</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="ml-auto border-ochre/40 text-ochre hover:bg-ochre/10"
                    onClick={() => quickStart("review")}
                    loading={loading === "review"}
                    disabled={loading !== null}
                  >
                    Review now
                  </Button>
                </div>
              )}

              {inProgress ? (
                <div className="flex items-center justify-between gap-4 bg-jade/10 border border-jade/20 rounded-xl px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-jade">Resume session</p>
                    <p className="text-xs text-muted mt-0.5">
                      {inProgress.kind} · {inProgress.cursor}/{inProgress.items.length} done
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => router.push(`/study/${inProgress.session_id}`)}
                  >
                    Resume →
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm text-muted mr-1">Quick start:</p>
                  {[
                    { kind: "new_drop", label: "New words" },
                    { kind: "review",   label: "Review due" },
                    { kind: "mixed",    label: "Mixed" },
                  ].map(({ kind, label }) => (
                    <Button
                      key={kind}
                      variant={kind === "mixed" ? "primary" : "outline"}
                      size="sm"
                      onClick={() => quickStart(kind)}
                      loading={loading === kind}
                      disabled={loading !== null}
                    >
                      {label}
                    </Button>
                  ))}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push("/study")}
                    className="ml-auto text-seal"
                  >
                    Custom →
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* ── Quick start tile ── col-span-4 lg */}
        <div className="col-span-1 sm:col-span-3 lg:col-span-4">
          <Card variant="paper" padding="md" className="h-full flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Seal size={24} />
              <p className="font-semibold text-ink text-sm">Start a session</p>
            </div>
            <div className="flex flex-col gap-2 flex-1">
              {[
                { kind: "new_drop", label: "＋ New words",   desc: "Learn something fresh" },
                { kind: "review",   label: "↻ Review due",  desc: "Reinforce what you know" },
                { kind: "mixed",    label: "⚡ Mixed",        desc: "Best of both worlds" },
              ].map(({ kind, label, desc }) => (
                <button
                  key={kind}
                  onClick={() => quickStart(kind)}
                  disabled={loading !== null}
                  className="flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-xl hover:bg-surface-2 transition-colors disabled:opacity-40 group"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink group-hover:text-seal transition-colors">{label}</p>
                    <p className="text-xs text-muted truncate">{desc}</p>
                  </div>
                  {loading === kind && <span className="text-xs text-muted">…</span>}
                </button>
              ))}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-seal text-xs"
              onClick={() => router.push("/study")}
            >
              Pick specific words →
            </Button>
          </Card>
        </div>

        {/* ── Vocabulary shortcut ── col-span-4 */}
        <button
          onClick={() => router.push("/vocabulary")}
          className="col-span-1 sm:col-span-3 lg:col-span-4 text-left group"
        >
          <Card variant="paper" padding="md" className="h-full hover:border-seal/40 transition-colors">
            <p className="text-xs font-semibold uppercase tracking-widest text-faint mb-2">Vocabulary</p>
            <p className="font-display text-2xl font-semibold text-ink mb-1 group-hover:text-seal transition-colors">
              Word bank
            </p>
            <p className="text-sm text-muted">Browse words, view lesson cards, add new ones.</p>
            <p className="text-seal text-sm font-medium mt-4">Open →</p>
          </Card>
        </button>

        {/* ── Stats shortcut ── col-span-4 */}
        <button
          onClick={() => router.push("/stats")}
          className="col-span-1 sm:col-span-3 lg:col-span-4 text-left group"
        >
          <Card variant="paper" padding="md" className="h-full hover:border-jade/40 transition-colors">
            <p className="text-xs font-semibold uppercase tracking-widest text-faint mb-2">Progress</p>
            <p className="font-display text-2xl font-semibold text-ink mb-1 group-hover:text-jade transition-colors">
              Stats
            </p>
            <p className="text-sm text-muted">Mastery, streak, weakest words, and level progress.</p>
            <p className="text-jade text-sm font-medium mt-4">View →</p>
          </Card>
        </button>

        {/* ── Sessions shortcut ── col-span-4 */}
        <button
          onClick={() => router.push("/sessions")}
          className="col-span-1 sm:col-span-6 lg:col-span-4 text-left group"
        >
          <Card variant="paper" padding="md" className="h-full hover:border-border transition-colors">
            <p className="text-xs font-semibold uppercase tracking-widest text-faint mb-2">History</p>
            <p className="font-display text-2xl font-semibold text-ink mb-1">Sessions</p>
            <p className="text-sm text-muted">Review past sessions, re-drill, and track progress.</p>
            <p className="text-muted text-sm font-medium mt-4">View all →</p>
          </Card>
        </button>
      </Bento>

      {/* ── Recent sessions list ──────────────────────────────────── */}
      <section>
        <h2 className="font-display text-xl font-semibold text-ink mb-4">Recent sessions</h2>
        {sessions.length === 0 ? (
          <Card variant="paper" padding="md">
            <p className="text-muted text-sm text-center py-4">No sessions yet. Start one above!</p>
          </Card>
        ) : (
          <Card variant="paper" padding="none">
            <div className="divide-y divide-border">
              {sessions.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-surface-2 transition-colors"
                >
                  <Badge variant={statusBadgeVariant(s.status)}>
                    {statusLabel(s.status)}
                  </Badge>
                  <span className="text-sm font-medium text-ink capitalize">{s.kind.replace("_", " ")}</span>
                  <span className="font-mono text-xs text-muted">{s.score}</span>
                  <span className="text-xs text-faint hidden sm:block ml-auto">{fmtTime(s.created_at)}</span>
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
