"use client";

import { useRouter } from "next/navigation";
import type { Word, LessonCard, SrsState } from "@/lib/types";
import { Card, Button, Badge } from "@/components/ui";

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
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest text-faint mb-2">{label}</p>
      {children}
    </div>
  );
}

export default function WordCardClient({
  data,
}: {
  data: { word: Word; lesson_card: LessonCard | null; srs: SrsState | null };
}) {
  const router = useRouter();
  const { word, lesson_card: card, srs } = data;

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <Button variant="ghost" size="sm" onClick={() => router.back()} className="text-muted -ml-2">
        ← Back
      </Button>

      {/* Hero card */}
      <Card variant="elevated" padding="lg">
        {/* Character hero */}
        <div className="text-center py-6 bg-paper rounded-xl border border-border mb-6 animate-hanzi-in">
          <div className="hanzi text-7xl font-bold text-ink leading-none mb-2">{word.simplified}</div>
          {word.traditional && word.traditional !== word.simplified && (
            <div className="hanzi text-2xl text-muted mb-1">{word.traditional}</div>
          )}
          <div className="text-jade text-lg font-medium mt-1">
            {card ? card.pinyin_marked : word.pinyin}
          </div>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="text-xs text-faint font-mono">HSK {word.hsk_level}</span>
            {srs?.mastered && <Badge variant="jade">Mastered</Badge>}
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
                <p className="text-sm text-ink/80 leading-relaxed">{card.nuance}</p>
              </Section>
            )}

            {card.examples.length > 0 && (
              <Section label="Examples">
                <div className="space-y-2.5">
                  {card.examples.map((ex, i) => (
                    <div key={i} className="bg-surface-2 rounded-xl p-3.5 border border-border">
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
                <div className="flex flex-wrap gap-3">
                  {card.character_breakdown.map((c, i) => (
                    <div
                      key={i}
                      className="bg-surface-2 rounded-xl px-3 py-2.5 text-center min-w-[64px] border border-border"
                    >
                      <div className="hanzi text-2xl font-bold text-ink">{c.char}</div>
                      <div className="text-xs text-muted mt-1">{c.meaning}</div>
                      {c.mnemonic && c.mnemonic !== "(stub)" && (
                        <div className="text-xs text-faint mt-0.5 italic">{c.mnemonic}</div>
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
                    <div key={i} className="flex items-start gap-3 text-sm">
                      <span className="hanzi font-semibold text-ink shrink-0">{s.word}</span>
                      <span className="text-muted">{s.pinyin}</span>
                      <span className="text-faint text-xs leading-relaxed">{s.distinction}</span>
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
          <div className="flex flex-wrap gap-2">
            {(word.meanings ?? []).map((m, i) => (
              <Badge key={i} variant="muted">{m}</Badge>
            ))}
          </div>
        )}
      </Card>

      {/* SRS status */}
      {srs && (
        <Card variant="paper" padding="md">
          <p className="text-xs font-semibold uppercase tracking-widest text-faint mb-4">
            Memory status
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-faint uppercase tracking-wide">Box</p>
              <p className="font-display text-2xl font-semibold text-ink mt-1">{srs.box} / 5</p>
            </div>
            <div>
              <p className="text-xs text-faint uppercase tracking-wide">Correct</p>
              <p className="font-display text-2xl font-semibold text-jade mt-1">{srs.correct_count}</p>
            </div>
            <div>
              <p className="text-xs text-faint uppercase tracking-wide">Wrong</p>
              <p className="font-display text-2xl font-semibold text-seal mt-1">{srs.wrong_count}</p>
            </div>
            <div>
              <p className="text-xs text-faint uppercase tracking-wide">Next review</p>
              <p className="text-sm font-medium text-ink mt-1">{fmtNextReview(srs.next_review_at)}</p>
            </div>
          </div>
          {/* Box progress */}
          <div className="mt-4 flex gap-1.5">
            {Array.from({ length: 5 }, (_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  i < srs.box ? "bg-jade" : "bg-surface-2"
                }`}
              />
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
