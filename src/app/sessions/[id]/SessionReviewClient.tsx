"use client";

import { useRouter } from "next/navigation";
import type { Session, GraderOutput } from "@/lib/types";
import { formatReadingsPinyin, hasMultipleReadings } from "@/lib/readings";
import { Card, Button, Badge, ProgressBar } from "@/components/ui";

const TYPE_LABELS: Record<string, string> = {
  en_to_zh:        "Translate to Mandarin",
  cloze:           "Fill in the blank",
  synonym_discrim: "Synonym discrimination",
  gloss_to_word:   "Gloss to word",
};

function outcomeVariant(outcome: string | null): "jade" | "seal" | "ochre" | "muted" {
  if (outcome === "correct")   return "jade";
  if (outcome === "wrong")     return "seal";
  if (outcome === "hesitated") return "ochre";
  return "muted";
}

function outcomeLabel(outcome: string): string {
  if (outcome === "hesitated") return "Assisted";
  return outcome;
}

export default function SessionReviewClient({ session }: { session: Session }) {
  const router = useRouter();
  const answered = session.items.filter((it) => it.outcome !== null).length;
  const correct  = session.items.filter((it) => it.outcome === "correct").length;
  const assisted = session.items.filter((it) => it.outcome === "hesitated").length;
  const pct      = answered > 0 ? Math.round((correct / answered) * 100) : 0;

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <Button variant="ghost" size="sm" onClick={() => router.back()} className="text-muted -ml-2">
        ← Back
      </Button>

      {/* Summary folio */}
      <div className="flex rounded-2xl border border-border shadow-sm bg-surface overflow-hidden">
        <div className="w-10 flex-shrink-0 border-r border-border bg-surface-2/50 flex flex-col items-center py-6">
          <span className="hanzi v-rl text-seal/25 text-2xl font-bold select-none leading-none">
            复
          </span>
          <span className="v-rl text-faint text-[10px] font-mono mt-auto tracking-widest">
            REVIEW
          </span>
        </div>
        <div className="flex-1 min-w-0 p-5">
          <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-faint mb-1">
                Session review
              </p>
              <h1 className="font-display text-2xl font-semibold text-ink capitalize">
                {session.kind.replace("_", " ")}
              </h1>
              <p className="text-muted text-sm mt-0.5">
                {new Date(session.created_at * 1000).toLocaleString("en-US", {
                  month: "short", day: "numeric",
                  hour: "2-digit", minute: "2-digit",
                })}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="font-display text-4xl font-semibold text-ink">{pct}%</p>
              <p className="text-xs text-faint">{correct}/{answered} correct</p>
              {assisted > 0 && (
                <p className="text-xs text-ochre mt-0.5">{assisted} assisted</p>
              )}
            </div>
          </div>
          <ProgressBar
            value={correct}
            max={answered || 1}
            color={pct >= 80 ? "jade" : pct >= 50 ? "ochre" : "seal"}
            height="sm"
          />
        </div>
      </div>

      {/* Items */}
      <div className="space-y-3">
        {session.items.map((item, i) => {
          const graderOut = item.grader_output_json as GraderOutput | null;
          const borderClass =
            item.outcome === "correct"
              ? "border-jade/30"
              : item.outcome === "wrong"
              ? "border-seal/30"
              : item.outcome === "hesitated"
              ? "border-ochre/30"
              : "border-border";

          return (
            <div key={item.item_id} className="flex rounded-2xl border border-border shadow-sm bg-surface overflow-hidden">
              <div className="w-10 flex-shrink-0 border-r border-border bg-surface-2/50 flex flex-col items-center py-4">
                <span className="v-rl text-faint text-[10px] font-mono tracking-widest">#{i + 1}</span>
                {item.outcome && (
                  <span className="mt-auto mb-0.5">
                    <Badge variant={outcomeVariant(item.outcome)}>
                      {outcomeLabel(item.outcome)}
                    </Badge>
                  </span>
                )}
              </div>
              <Card
                variant="paper"
                padding="md"
                className={`flex-1 rounded-none border-0 border-l-0 ${borderClass}`}
              >
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="hanzi text-2xl font-bold text-ink">
                      {item.word.simplified}
                    </span>
                    <span className="text-sm text-muted truncate">
                      {hasMultipleReadings(item.word.readings)
                        ? formatReadingsPinyin(item.word.readings)
                        : item.word.pinyin}
                    </span>
                  </div>
                </div>

                {item.question_json && (
                  <>
                    <p className="text-[10px] font-mono uppercase tracking-widest text-faint mb-1">
                      {TYPE_LABELS[item.question_json.type] ?? item.question_json.type}
                    </p>
                    <p className="text-sm text-ink/80 leading-relaxed mb-3">
                      {item.question_json.prompt}
                    </p>
                  </>
                )}

                {item.user_answer && (
                  <div className="flex items-baseline gap-2 text-sm">
                    <span className="text-faint shrink-0">Your answer:</span>
                    <span className="font-medium text-ink">{item.user_answer}</span>
                  </div>
                )}

                {graderOut?.feedback && (
                  <p className="text-xs text-muted mt-2 italic leading-relaxed border-l-2 border-border pl-2.5">
                    {graderOut.feedback}
                  </p>
                )}
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}
