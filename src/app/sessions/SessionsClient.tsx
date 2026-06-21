"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { redrillSessionAction } from "../actions/session";
import type { SessionSummary } from "@/lib/types";
import { Card, Button, Badge, PageHeader } from "@/components/ui";

function fmtTime(ts: number | null): string {
  if (!ts) return "";
  return new Date(ts * 1000).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusVariant(status: string): "ochre" | "jade" | "muted" {
  if (status === "in_progress") return "ochre";
  if (status === "completed")   return "jade";
  return "muted";
}

function statusLabel(status: string): string {
  const m: Record<string, string> = {
    in_progress: "In progress",
    completed:   "Done",
    abandoned:   "Abandoned",
  };
  return m[status] ?? status;
}

export default function SessionsClient({ sessions }: { sessions: SessionSummary[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState<number | null>(null);
  const completedCount = sessions.filter((s) => s.status === "completed").length;
  const inProgressCount = sessions.filter((s) => s.status === "in_progress").length;

  const doRedrill = async (id: number) => {
    setLoading(id);
    try {
      const sess = await redrillSessionAction(id);
      router.push(`/study/${sess.session_id}`);
    } catch (e) {
      alert(String(e));
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        rubric="记录"
        eyebrow="History"
        title="Session Ledger"
        actions={
          <Button variant="primary" size="sm" onClick={() => router.push("/study")}>
            New session
          </Button>
        }
      />

      {/* compact summary strip */}
      <div className="rounded-2xl border border-border bg-surface shadow-sm p-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center rounded-xl border border-border/70 bg-paper px-3 py-2.5">
            <p className="text-[10px] font-mono uppercase tracking-widest text-faint">Total</p>
            <p className="font-display text-2xl text-ink mt-1">{sessions.length}</p>
          </div>
          <div className="text-center rounded-xl border border-border/70 bg-paper px-3 py-2.5">
            <p className="text-[10px] font-mono uppercase tracking-widest text-faint">In progress</p>
            <p className="font-display text-2xl text-ochre mt-1">{inProgressCount}</p>
          </div>
          <div className="text-center rounded-xl border border-border/70 bg-paper px-3 py-2.5">
            <p className="text-[10px] font-mono uppercase tracking-widest text-faint">Completed</p>
            <p className="font-display text-2xl text-jade mt-1">{completedCount}</p>
          </div>
        </div>
      </div>

      {sessions.length === 0 ? (
        <Card variant="paper" padding="lg" className="text-center">
          <p className="text-muted mb-5">No sessions yet.</p>
          <Button variant="primary" onClick={() => router.push("/study")}>
            Start a session
          </Button>
        </Card>
      ) : (
        <div className="space-y-2">
          {sessions.map((s) => (
            <div
              key={s.id}
              className="flex rounded-2xl border border-border shadow-sm bg-surface overflow-hidden"
            >
              <div className="w-10 flex-shrink-0 border-r border-border bg-surface-2/50 flex flex-col items-center py-4">
                <span className="hanzi v-rl text-seal/25 text-xl font-bold select-none leading-none">
                  录
                </span>
                <span className="v-rl text-faint text-[10px] font-mono mt-auto tracking-widest">
                  #{s.id}
                </span>
              </div>

              <div className="flex-1 min-w-0 px-4 py-3.5">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <Badge variant={statusVariant(s.status)}>{statusLabel(s.status)}</Badge>
                      <span className="text-sm font-semibold text-ink capitalize">
                        {s.kind.replace("_", " ")}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted font-mono">
                      <span>{s.score}</span>
                      <span>{fmtTime(s.created_at)}</span>
                    </div>
                  </div>

                  <div className="flex gap-1.5 shrink-0">
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
                          disabled={loading === s.id}
                          loading={loading === s.id}
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
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
