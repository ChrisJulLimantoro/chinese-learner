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
    <div>
      <PageHeader
        rubric="记录"
        eyebrow="History"
        title="Sessions"
        actions={
          <Button variant="primary" size="sm" onClick={() => router.push("/study")}>
            New session
          </Button>
        }
      />

      {sessions.length === 0 ? (
        <Card variant="paper" padding="lg" className="text-center">
          <p className="text-muted mb-5">No sessions yet.</p>
          <Button variant="primary" onClick={() => router.push("/study")}>
            Start a session
          </Button>
        </Card>
      ) : (
        <Card variant="paper" padding="none">
          <div className="divide-y divide-border">
            {sessions.map((s) => (
              <div
                key={s.id}
                className="flex items-center gap-3 px-5 py-3.5 hover:bg-surface-2 transition-colors"
              >
                <Badge variant={statusVariant(s.status)}>{statusLabel(s.status)}</Badge>
                <span className="text-sm font-medium text-ink capitalize">
                  {s.kind.replace("_", " ")}
                </span>
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
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
