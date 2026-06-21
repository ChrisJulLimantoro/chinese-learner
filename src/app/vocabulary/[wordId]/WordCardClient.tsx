"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Word, LessonCard, SrsState } from "@/lib/types";
import { hasMultipleReadings } from "@/lib/readings";
import { Card, Button, Badge, ProgressBar } from "@/components/ui";
import { regenerateWordCardAction } from "@/app/actions/vocabulary";

function fmtNextReview(ts: number | null): string {
  if (!ts) return "Not scheduled";
  const d = new Date(ts * 1000);
  const now = Date.now();
  const diff = d.getTime() - now;
  if (diff < 0) return "Due now";
  const h = Math.floor(diff / 3600000);
  if (h < 24) return `In ${h}h`;
  return `In ${Math.floor(h / 24)}d`;
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2.5">
      <p className="text-[10px] font-mono uppercase tracking-widest text-faint">{label}</p>
      {children}
    </div>
  );
}

function RegenerateModal({
  open,
  regenerating,
  reason,
  onReasonChange,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  regenerating: boolean;
  reason: string;
  onReasonChange: (v: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <Card variant="elevated" padding="lg" className="w-full max-w-md space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-faint mb-1">
            Regenerate lesson card
          </p>
          <p className="text-sm text-muted leading-relaxed">
            Optionally describe what looks wrong — the AI will use this to generate a better card.
            Leave blank to regenerate without guidance.
          </p>
        </div>
        <textarea
          rows={4}
          value={reason}
          onChange={(e) => onReasonChange(e.target.value)}
          placeholder="e.g. The pinyin tones are wrong, and example 2 uses the word incorrectly…"
          className="w-full border border-border rounded-xl px-4 py-3 text-ink text-sm bg-surface focus:outline-none focus:ring-2 focus:ring-seal focus:border-transparent transition-colors placeholder:text-faint resize-none"
          disabled={regenerating}
        />
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" size="sm" onClick={onCancel} disabled={regenerating}>
            Cancel
          </Button>
          <Button variant="outline" size="sm" onClick={onConfirm} loading={regenerating}>
            Regenerate
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default function WordCardClient({
  data,
}: {
  data: { word: Word; lesson_card: LessonCard | null; srs: SrsState | null };
}) {
  const router = useRouter();
  const { word, srs } = data;
  const [card, setCard] = useState<LessonCard | null>(data.lesson_card);
  const [showModal, setShowModal] = useState(false);
  const [reason, setReason] = useState("");
  const [regenerating, setRegenerating] = useState(false);

  const openModal = () => setShowModal(true);
  const closeModal = () => { setShowModal(false); setReason(""); };

  const handleRegenerate = async () => {
    setRegenerating(true);
    try {
      const result = await regenerateWordCardAction(word.id, reason.trim() || undefined);
      setCard(result.lesson_card);
      closeModal();
    } catch (e) {
      alert(String(e));
    } finally {
      setRegenerating(false);
    }
  };

  return (
    <>
      <RegenerateModal
        open={showModal}
        regenerating={regenerating}
        reason={reason}
        onReasonChange={setReason}
        onConfirm={handleRegenerate}
        onCancel={closeModal}
      />
      <div className="max-w-3xl mx-auto space-y-5">
        <div className="flex items-center justify-between -ml-2">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="text-muted">
            ← Back
          </Button>
          <Button variant="outline" size="sm" onClick={openModal}>
            Regenerate card
          </Button>
        </div>

        {/* Word card folio */}
        <div className="flex rounded-2xl border border-border shadow-sm bg-surface overflow-hidden">
          <div className="w-10 flex-shrink-0 border-r border-border bg-surface-2/50 flex flex-col items-center py-6">
            <span className="hanzi v-rl text-seal/25 text-2xl font-bold select-none leading-none">词</span>
            <span className="v-rl text-faint text-[10px] font-mono mt-auto tracking-widest">
              HSK {word.hsk_level}
            </span>
          </div>

          <div className="flex-1 min-w-0 p-6 space-y-5">
            {/* Character hero */}
            <div className="text-center pb-5 border-b border-border/50 animate-hanzi-in">
              <div className="hanzi text-8xl font-bold text-ink leading-none mb-2">{word.simplified}</div>
              {word.traditional && word.traditional !== word.simplified && (
                <div className="hanzi text-xl text-muted mb-1">{word.traditional}</div>
              )}
              {hasMultipleReadings(word.readings) ? (
                <div className="mt-2 space-y-1">
                  {word.readings.map((r, i) => (
                    <div key={i} className="text-center">
                      <span className="text-jade text-base font-medium">{r.pinyin}</span>
                      <span className="text-faint text-xs ml-2">{r.meanings.slice(0, 2).join(", ")}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-jade text-lg font-medium mt-1">
                  {card ? card.pinyin_marked : word.pinyin}
                </div>
              )}
              <div className="flex items-center justify-center gap-2 mt-2">
                {srs?.mastered && <Badge variant="jade">mastered</Badge>}
              </div>
            </div>

            {card ? (
              <div className="space-y-5">
                <Section label="Meanings">
                  <div className="flex flex-wrap gap-2">
                    {card.core_meanings.map((m, i) => (
                      <Badge key={i} variant="muted">{m}</Badge>
                    ))}
                  </div>
                </Section>

                {card.nuance && (
                  <Section label="Nuance">
                    <p className="text-sm text-ink/80 leading-relaxed border-l-2 border-seal/35 pl-3 italic">
                      {card.nuance}
                    </p>
                  </Section>
                )}

                {card.examples.length > 0 && (
                  <Section label="Examples">
                    <div className="space-y-2.5">
                      {card.examples.map((ex, i) => (
                        <div key={i} className="bg-paper rounded-xl p-3.5 border border-border/70">
                          <p className="hanzi text-base font-semibold text-ink">{ex.hanzi}</p>
                          <p className="text-jade text-sm mt-0.5">{ex.pinyin}</p>
                          <p className="text-muted text-sm mt-0.5">{ex.gloss}</p>
                        </div>
                      ))}
                    </div>
                  </Section>
                )}

                {card.character_breakdown.length > 0 && (
                  <Section label="Character breakdown">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {card.character_breakdown.map((c, i) => (
                        <div
                          key={i}
                          className="bg-paper rounded-xl px-3 py-3 text-center border border-border/70"
                        >
                          <div className="hanzi text-2xl font-bold text-ink">{c.char}</div>
                          <div className="text-xs text-muted mt-1">{c.meaning}</div>
                          {c.mnemonic && c.mnemonic !== "(stub)" && (
                            <div className="text-xs text-faint mt-1 italic">{c.mnemonic}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </Section>
                )}

                {card.near_synonyms.length > 0 && (
                  <Section label="Near synonyms">
                    <div className="space-y-2">
                      {card.near_synonyms.map((s, i) => (
                        <div key={i} className="rounded-xl border border-border/70 bg-paper px-3 py-2.5">
                          <div className="flex items-center gap-2 text-sm mb-1">
                            <span className="hanzi font-semibold text-ink shrink-0">{s.word}</span>
                            <span className="text-muted">{s.pinyin}</span>
                          </div>
                          <p className="text-xs text-faint leading-relaxed">{s.distinction}</p>
                        </div>
                      ))}
                    </div>
                  </Section>
                )}

                {card.common_mistakes.length > 0 && (
                  <Section label="Common mistakes">
                    <ul className="space-y-1.5">
                      {card.common_mistakes.map((m, i) => (
                        <li key={i} className="text-sm text-ink/80 flex gap-2 leading-relaxed">
                          <span className="text-seal shrink-0">•</span>
                          {m}
                        </li>
                      ))}
                    </ul>
                  </Section>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {hasMultipleReadings(word.readings) ? (
                  word.readings.map((r, i) => (
                    <div key={i} className="flex flex-wrap items-center gap-2">
                      <span className="text-jade text-sm font-medium shrink-0">{r.pinyin}</span>
                      {r.meanings.map((m, j) => (
                        <Badge key={j} variant="muted">{m}</Badge>
                      ))}
                    </div>
                  ))
                ) : (
                  (word.meanings ?? []).map((m, i) => (
                    <Badge key={i} variant="muted">{m}</Badge>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* SRS status folio */}
        {srs && (
          <div className="flex rounded-2xl border border-border shadow-sm bg-surface overflow-hidden">
            <div className="w-10 flex-shrink-0 border-r border-border bg-surface-2/50 flex flex-col items-center py-6">
              <span className="hanzi v-rl text-seal/25 text-2xl font-bold select-none leading-none">记</span>
              <span className="v-rl text-faint text-[10px] font-mono mt-auto tracking-widest">MEMORY</span>
            </div>
            <div className="flex-1 min-w-0 p-5 space-y-4">
              <p className="text-[10px] font-mono uppercase tracking-widest text-faint">
                Memory status
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <p className="text-[10px] text-faint uppercase tracking-wide font-mono">Box</p>
                  <p className="font-display text-2xl font-semibold text-ink mt-1">{srs.box} / 5</p>
                </div>
                <div>
                  <p className="text-[10px] text-faint uppercase tracking-wide font-mono">Correct</p>
                  <p className="font-display text-2xl font-semibold text-jade mt-1">{srs.correct_count}</p>
                </div>
                <div>
                  <p className="text-[10px] text-faint uppercase tracking-wide font-mono">Wrong</p>
                  <p className="font-display text-2xl font-semibold text-seal mt-1">{srs.wrong_count}</p>
                </div>
                <div>
                  <p className="text-[10px] text-faint uppercase tracking-wide font-mono">Next review</p>
                  <p className="text-sm font-medium text-ink mt-1">{fmtNextReview(srs.next_review_at)}</p>
                </div>
              </div>
              <ProgressBar value={srs.box} max={5} color="jade" height="xs" />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
