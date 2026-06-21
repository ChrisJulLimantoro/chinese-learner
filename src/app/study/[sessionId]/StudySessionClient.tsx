"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { gradeAnswerAction, ensureItemQuestionAction } from "../../actions/session";
import { getWordCardAction } from "../../actions/vocabulary";
import type { Session, LessonCard, GraderOutput, Outcome, Question } from "@/lib/types";
import { hasMultipleReadings } from "@/lib/readings";
import { Button, Badge, ProgressBar, Skeleton, InkLoader } from "@/components/ui";
import Seal from "@/components/Seal";

const TIMER_SECONDS = 120;
const TYPE_LABELS: Record<string, string> = {
  en_to_zh:        "Translate to Mandarin",
  cloze:           "Fill in the blank",
  synonym_discrim: "Synonym discrimination",
  gloss_to_word:   "Gloss to word",
};

// ─── PracticeCell (米字格) ──────────────────────────────────────────────────

function PracticeCell({ char }: { char: string }) {
  return (
    <div className="relative w-32 h-32 sm:w-40 sm:h-40 bg-paper rounded-xl border-2 border-seal/50 shadow-sm mx-auto">
      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full" aria-hidden>
        <g stroke="var(--seal)" strokeOpacity="0.22" strokeWidth="0.7" strokeDasharray="3 3">
          <line x1="50" y1="8" x2="50" y2="92" />
          <line x1="8" y1="50" x2="92" y2="50" />
          <line x1="14" y1="14" x2="86" y2="86" />
          <line x1="86" y1="14" x2="14" y2="86" />
        </g>
      </svg>
      <span className="hanzi animate-hanzi-in absolute inset-0 flex items-center justify-center text-5xl sm:text-6xl font-bold text-ink select-none">
        {char}
      </span>
    </div>
  );
}

// ─── Lesson card ───────────────────────────────────────────────────────────

function LessonCardView({ card }: { card: LessonCard }) {
  return (
    <div className="space-y-5">
      {/* Character hero — full-bleed, no nested panel */}
      <div className="text-center pb-5 border-b border-border/50 animate-hanzi-in">
        <div className="hanzi text-8xl font-bold text-ink mb-2.5 leading-none">
          {card.simplified}
        </div>
        {card.traditional && card.traditional !== card.simplified && (
          <div className="hanzi text-xl text-muted mb-1.5">{card.traditional}</div>
        )}
        <div className="text-jade text-lg font-medium">{card.pinyin_marked}</div>
        <span className="mt-2 inline-block text-[10px] font-mono text-faint uppercase tracking-[0.22em]">
          HSK {card.hsk_level}
        </span>
      </div>

      {/* Meanings — badge row, no heading clutter */}
      <div className="flex flex-wrap gap-2">
        {card.core_meanings.map((m, i) => (
          <Badge key={i} variant="muted">{m}</Badge>
        ))}
      </div>

      {/* Nuance — left accent stripe instead of a heading */}
      {card.nuance && (
        <p className="text-sm text-ink/75 leading-relaxed border-l-2 border-seal/35 pl-3 italic">
          {card.nuance}
        </p>
      )}

      {/* Examples */}
      {card.examples.length > 0 && (
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-faint mb-2.5">
            Examples
          </p>
          <div className="space-y-2">
            {card.examples.map((ex, i) => (
              <div key={i} className="bg-paper rounded-xl px-4 py-3 border border-border/60">
                <p className="hanzi text-base font-semibold text-ink">{ex.hanzi}</p>
                <p className="text-jade text-sm mt-0.5">{ex.pinyin}</p>
                <p className="text-muted text-sm mt-0.5">{ex.gloss}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Character breakdown — flex row instead of full-width stacked blocks */}
      {card.character_breakdown.length > 0 && (
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-faint mb-2.5">
            Breakdown
          </p>
          <div className="flex gap-2">
            {card.character_breakdown.map((c, i) => (
              <div
                key={i}
                className="flex-1 bg-paper rounded-xl px-3 py-3 text-center border border-border/60"
              >
                <div className="hanzi text-2xl font-bold text-ink">{c.char}</div>
                <div className="text-xs text-muted mt-1 leading-tight">{c.meaning}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Loading states ────────────────────────────────────────────────────────

function CardLoadingSkeleton({ word }: { word: Session["items"][number]["word"] }) {
  return (
    <div className="space-y-5 animate-fade-up">
      {/* Instantly visible character in the 米字格 grid */}
      <div className="text-center pb-5 border-b border-border/50">
        <PracticeCell char={word.simplified} />
        {hasMultipleReadings(word.readings) ? (
          <div className="mt-3 space-y-0.5">
            {word.readings.map((r, i) => (
              <div key={i}>
                <span className="text-jade text-base">{r.pinyin}</span>
                <span className="text-muted text-sm ml-2">{r.meanings.slice(0, 2).join(", ")}</span>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="text-jade text-lg mt-3">{word.pinyin}</div>
            <div className="text-muted text-sm mt-1">{word.meanings?.join(", ")}</div>
          </>
        )}
      </div>

      {/* Shimmer badges for meanings */}
      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-5 w-14 rounded-full" />
      </div>

      {/* Shimmer for nuance */}
      <div className="space-y-2 pl-3 border-l-2 border-border">
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-3.5 w-4/5" />
      </div>

      {/* Shimmer for examples */}
      <div>
        <p className="text-[10px] font-mono uppercase tracking-widest text-faint mb-2.5">Examples</p>
        <div className="space-y-2">
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
        </div>
      </div>

      {/* Shimmer for breakdown */}
      <div>
        <p className="text-[10px] font-mono uppercase tracking-widest text-faint mb-2.5">Breakdown</p>
        <div className="flex gap-2">
          <Skeleton className="h-16 flex-1 rounded-xl" />
          <Skeleton className="h-16 flex-1 rounded-xl" />
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 pt-2">
        <InkLoader />
        <span className="text-faint text-xs font-mono">Writing your lesson card…</span>
      </div>
    </div>
  );
}

function QuestionLoadingSkeleton({ word }: { word: Session["items"][number]["word"] }) {
  return (
    <div className="space-y-5 animate-fade-up">
      {/* Question type placeholder */}
      <span className="text-[10px] font-mono uppercase tracking-widest text-faint">
        Practice question
      </span>

      {/* Faint character watermark — context without noise */}
      <div
        className="hanzi text-6xl font-bold text-ink/8 text-center leading-none select-none py-2"
        aria-hidden
      >
        汉字
      </div>

      {/* Shimmer prompt lines */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>

      {/* Disabled input + action stubs */}
      <div className="space-y-3 pt-1">
        <input
          type="text"
          disabled
          placeholder="Composing your question…"
          className="w-full border border-border rounded-xl px-4 py-3 text-faint text-base bg-surface/50 cursor-not-allowed placeholder:text-faint/60"
        />
        <div className="flex gap-2">
          <Button variant="primary" className="flex-1" disabled loading>Submit</Button>
          <Button variant="outline" disabled>Skip</Button>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2">
        <InkLoader />
        <span className="text-faint text-xs font-mono">Composing your question…</span>
      </div>
    </div>
  );
}

// ─── Feedback ─────────────────────────────────────────────────────────────

function FeedbackView({ graderOut, outcome }: { graderOut: GraderOutput; outcome: string }) {
  const assisted = outcome === "hesitated";
  const correct = assisted ? false : graderOut.correct;
  const hasbody = graderOut.feedback || graderOut.issues.length > 0;
  const verdict = assisted ? "Assisted" : correct ? "Correct" : "Incorrect";
  return (
    <div
      className={`rounded-2xl overflow-hidden border animate-fade-up ${
        assisted ? "border-ochre/30" : correct ? "border-jade/30" : "border-seal/30"
      }`}
    >
      {/* Solid header strip — verdict is unambiguous */}
      <div
        className={`flex items-center gap-3 px-4 py-2.5 ${
          assisted ? "bg-ochre text-white" : correct ? "bg-jade text-white" : "bg-seal text-white"
        }`}
      >
        <span className="font-semibold text-sm">{verdict}</span>
        <span className="text-xs font-mono opacity-75 ml-auto tabular-nums">
          {"★".repeat(graderOut.naturalness)}{"☆".repeat(5 - graderOut.naturalness)}
        </span>
      </div>

      {/* Body — feedback text and issue tags */}
      {hasbody && (
        <div className="px-4 py-3 space-y-2.5 bg-surface">
          {graderOut.feedback && (
            <p className="text-sm text-ink/80 leading-relaxed">{graderOut.feedback}</p>
          )}
          {graderOut.issues.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {graderOut.issues.map((issue, i) => (
                <Badge key={i} variant="ochre">{issue}</Badge>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main session component ────────────────────────────────────────────────

export default function StudySessionClient({ session: initialSession }: { session: Session }) {
  const router = useRouter();
  const [items, setItems] = useState<Session["items"]>(initialSession.items);
  const [cursor, setCursor] = useState(initialSession.cursor);
  const [phase, setPhase] = useState<"learn" | "drill">(
    initialSession.cursor > 0 ? "drill" : "learn"
  );
  const [learnIdx, setLearnIdx] = useState(0);
  const [answer, setAnswer] = useState("");
  const [grading, setGrading] = useState(false);
  const [feedback, setFeedback] = useState<{ graderOut: GraderOutput; outcome: string } | null>(null);
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [overTimer, setOverTimer] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(initialSession.status === "completed");
  const [showStamp, setShowStamp] = useState(false);
  const [loadingCard, setLoadingCard] = useState(false);
  const [loadingQuestion, setLoadingQuestion] = useState(false);
  const [failedLessonCards, setFailedLessonCards] = useState<Record<number, boolean>>({});
  const [showTargetHint, setShowTargetHint] = useState(false);
  const [showContextHelpers, setShowContextHelpers] = useState(false);
  const [usedTargetHint, setUsedTargetHint] = useState<Record<number, boolean>>({});
  const [outcomes, setOutcomes] = useState<Record<number, Outcome>>(() => {
    const m: Record<number, Outcome> = {};
    for (const it of initialSession.items) if (it.outcome) m[it.item_id] = it.outcome;
    return m;
  });
  const startTimeRef = useRef<number>(0); // set on each drill mount, before any read
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const answerRef = useRef<HTMLInputElement>(null);

  // Helper to update a single item in state
  const patchItem = useCallback((idx: number, patch: Partial<Session["items"][number]>) => {
    setItems((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], ...patch };
      return next;
    });
  }, []);

  // ── Lazy load lesson card ─────────────────────────────────────────────

  useEffect(() => {
    if (phase !== "learn") return;
    const item = items[learnIdx];
    if (!item || item.lesson_card) return;

    let cancelled = false;
    setLoadingCard(true); // eslint-disable-line react-hooks/set-state-in-effect -- show loader while fetching the lesson card

    getWordCardAction(item.word.id)
      .then((result) => {
        if (cancelled) return;
        patchItem(learnIdx, { lesson_card: result.lesson_card });
        setFailedLessonCards((prev) => ({ ...prev, [item.item_id]: !result.lesson_card }));
        // Prefetch next card
        const nextItem = items[learnIdx + 1];
        if (nextItem && !nextItem.lesson_card) {
          getWordCardAction(nextItem.word.id)
            .then((r) => patchItem(learnIdx + 1, { lesson_card: r.lesson_card }))
            .catch(() => {/* silent */});
        }
      })
      .catch(() => {
        if (!cancelled) {
          setFailedLessonCards((prev) => ({ ...prev, [item.item_id]: true }));
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingCard(false);
      });

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [learnIdx, phase]);

  // ── Lazy load question ────────────────────────────────────────────────

  useEffect(() => {
    if (phase !== "drill") return;
    const item = items[cursor];
    if (!item || item.question_json) return;

    let cancelled = false;
    setLoadingQuestion(true); // eslint-disable-line react-hooks/set-state-in-effect -- show loader while generating the question

    ensureItemQuestionAction(item.item_id)
      .then((question) => {
        if (cancelled) return;
        patchItem(cursor, { question_json: question });
        // Prefetch next question
        const nextItem = items[cursor + 1];
        if (nextItem && !nextItem.question_json) {
          ensureItemQuestionAction(nextItem.item_id)
            .then((q) => patchItem(cursor + 1, { question_json: q }))
            .catch(() => {/* silent */});
        }
      })
      .catch(() => {/* silent */})
      .finally(() => {
        if (!cancelled) setLoadingQuestion(false);
      });

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cursor, phase]);

  useEffect(() => {
    if (phase !== "drill") return;
    setShowTargetHint(false);
    setShowContextHelpers(false);
  }, [phase, cursor]);

  // ── Drill timer ───────────────────────────────────────────────────────

  useEffect(() => {
    if (phase !== "drill" || loadingQuestion) return;
    setTimeLeft(TIMER_SECONDS); // eslint-disable-line react-hooks/set-state-in-effect -- timer reset is intentional
    setOverTimer(false);
    startTimeRef.current = Date.now();

    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setOverTimer(true);
          clearInterval(timerRef.current!);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    answerRef.current?.focus();
    return () => clearInterval(timerRef.current!);
  }, [phase, cursor, loadingQuestion]);

  const currentItem = items[cursor] ?? items[items.length - 1];
  const totalDrill = items.length;

  // ── LEARN phase ──────────────────────────────────────────────────────

  if (phase === "learn") {
    const learnItem = items[learnIdx];
    const card = learnItem?.lesson_card;
    const cardFailed = learnItem ? Boolean(failedLessonCards[learnItem.item_id]) : false;
    const isLast = learnIdx >= items.length - 1;

    return (
      <div className="max-w-xl mx-auto">
        {/* Thin progress strip — replaces the sticky floating header */}
        <div className="mb-3">
          <ProgressBar value={learnIdx + 1} max={items.length} color="jade" height="xs" />
        </div>

        {/* Folio card */}
        <div className="flex rounded-2xl border border-border shadow-md bg-surface overflow-hidden">
          {/* Manuscript rail: 学 watermark + step counter */}
          <div className="w-10 flex-shrink-0 border-r border-border bg-surface-2/40 flex flex-col items-center py-6 gap-0">
            <span className="hanzi v-rl text-seal/20 text-3xl font-bold select-none leading-none">
              学
            </span>
            <span className="v-rl text-faint text-[10px] font-mono mt-auto tracking-widest">
              {learnIdx + 1}/{items.length}
            </span>
          </div>

          {/* Card content */}
          <div className="flex-1 min-w-0 p-6 space-y-5">
            {loadingCard && !card ? (
              <CardLoadingSkeleton word={learnItem.word} />
            ) : card ? (
              <div className="animate-fade-up">
                <LessonCardView card={card} />
              </div>
            ) : (
              /* Fallback if no card and not loading */
              <div className="text-center py-10 animate-hanzi-in">
                {cardFailed && (
                  <p className="text-xs font-mono uppercase tracking-widest text-seal mb-3">
                    Failed to generate lesson card
                  </p>
                )}
                <div className="hanzi text-7xl font-bold text-ink mb-3 leading-none">
                  {learnItem.word.simplified}
                </div>
                {hasMultipleReadings(learnItem.word.readings) ? (
                  <div className="mt-2 space-y-1">
                    {learnItem.word.readings.map((r, i) => (
                      <div key={i}>
                        <span className="text-jade text-base">{r.pinyin}</span>
                        <span className="text-muted text-sm ml-2">
                          {r.meanings.slice(0, 2).join(", ")}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    <div className="text-jade text-lg mt-1">{learnItem.word.pinyin}</div>
                    <div className="text-muted text-sm mt-2">
                      {learnItem.word.meanings?.join(", ")}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between gap-3 mt-4">
          {learnIdx > 0 && (
            <Button variant="outline" onClick={() => setLearnIdx((i) => i - 1)}>
              ← Back
            </Button>
          )}
          <Button
            variant="primary"
            className="ml-auto"
            disabled={loadingCard}
            onClick={() => {
              if (isLast) setPhase("drill");
              else setLearnIdx((i) => i + 1);
            }}
          >
            {isLast ? "Start drill →" : "Next →"}
          </Button>
        </div>
      </div>
    );
  }

  // ── SESSION COMPLETE ──────────────────────────────────────────────────

  if (sessionComplete) {
    const answered = Object.keys(outcomes).length;
    const correct = Object.values(outcomes).filter((o) => o === "correct").length;
    const assisted = Object.values(outcomes).filter((o) => o === "hesitated").length;
    const pct = answered > 0 ? Math.round((correct / answered) * 100) : 0;

    return (
      <div className="max-w-sm mx-auto text-center space-y-8 pt-12">
        <div className="flex justify-center">
          <Seal size={72} stamp />
        </div>
        <div>
          <h1 className="font-display text-4xl font-semibold text-ink mb-2">
            Session complete
          </h1>
          <p className="text-muted">
            {correct}/{answered} correct —{" "}
            <span className={pct >= 80 ? "text-jade font-semibold" : "text-seal font-semibold"}>
              {pct}%
            </span>
          </p>
          {assisted > 0 && (
            <p className="text-xs text-ochre mt-1">
              {assisted} assisted (hint used — not counted as true correct)
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-3 justify-center">
          <Button variant="outline" onClick={() => router.push("/")}>Home</Button>
          <Button variant="outline" onClick={() => router.push("/sessions")}>Sessions</Button>
          <Button variant="primary" onClick={() => router.push("/study")}>New session</Button>
        </div>
      </div>
    );
  }

  // ── DRILL phase ───────────────────────────────────────────────────────

  const submitAnswer = async (skipped = false) => {
    if (grading || !currentItem.question_json) return;
    const elapsed = Date.now() - startTimeRef.current;
    const assisted =
      skipped || overTimer || Boolean(usedTargetHint[currentItem.item_id]);
    setGrading(true);
    clearInterval(timerRef.current!);

    try {
      const result = await gradeAnswerAction(
        currentItem.item_id,
        answer || (assisted ? "___hesitated___" : ""),
        elapsed,
        assisted
      );
      setFeedback({ graderOut: result.grader_output, outcome: result.outcome });
      setOutcomes((o) => ({ ...o, [currentItem.item_id]: result.outcome }));
      if (result.grader_output.correct && result.outcome === "correct") {
        setShowStamp(true);
      }
      if (result.session_complete) {
        setSessionComplete(true);
      }
    } catch (e) {
      alert(String(e));
    } finally {
      setGrading(false);
    }
  };

  const revealTargetHint = () => {
    setShowTargetHint(true);
    setUsedTargetHint((prev) => ({
      ...prev,
      [currentItem.item_id]: true,
    }));
  };

  const advance = () => {
    setFeedback(null);
    setShowStamp(false);
    setAnswer("");
    setShowTargetHint(false);
    setShowContextHelpers(false);
    setCursor((c) => c + 1);
  };

  const timerColor =
    overTimer ? "text-seal" : timeLeft < 30 ? "text-ochre" : "text-faint";

  const question: Question | null = currentItem?.question_json ?? null;

  // Timer rail: fill depletes bottom-upward as time runs out (ink barometer)
  const timerFillPct = loadingQuestion || overTimer ? 0 : (timeLeft / TIMER_SECONDS) * 100;
  const timerFillBg = overTimer
    ? "bg-seal/12"
    : timeLeft < 30
    ? "bg-ochre/18"
    : "bg-jade/12";

  return (
    <div className="max-w-xl mx-auto">
      {/* Thin progress strip */}
      <div className="mb-3">
        <ProgressBar value={cursor} max={totalDrill} color="jade" height="xs" />
      </div>

      {/* Folio card */}
      <div className="flex rounded-2xl border border-border shadow-md bg-surface overflow-hidden">
        {/*
          Timer rail — the signature element.
          The colored fill anchors to the bottom and shrinks upward as time drains,
          like ink dropping in a gauge. Color shifts jade → ochre → seal with urgency.
        */}
        <div className="w-10 flex-shrink-0 border-r border-border flex flex-col items-center py-6 relative overflow-hidden">
          {/* Living fill — drains bottom-up */}
          <div
            className={`absolute bottom-0 left-0 right-0 transition-[height] duration-1000 ease-linear ${timerFillBg}`}
            style={{ height: `${timerFillPct}%` }}
            aria-hidden
          />
          {/* Timer label */}
          <span className={`v-rl text-[10px] font-mono tabular-nums relative z-10 ${timerColor}`}>
            {loadingQuestion ? "…" : overTimer ? "over" : `${timeLeft}s`}
          </span>
          {/* Q counter */}
          <span className="v-rl text-faint text-[10px] font-mono relative z-10 mt-auto tracking-widest">
            {Math.min(cursor + 1, totalDrill)}/{totalDrill}
          </span>
        </div>

        {/* Card content */}
        <div className="flex-1 min-w-0 p-6 space-y-5">
          {loadingQuestion ? (
            <QuestionLoadingSkeleton word={currentItem.word} />
          ) : question ? (
            <>
              {/* Header row: question type + stamp on correct */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-widest text-faint">
                  {TYPE_LABELS[question.type] ?? question.type}
                </span>
                {showStamp && <Seal size={30} stamp />}
              </div>

              {/* Prompt — the primary element, given real prominence */}
              <p className="text-ink text-[15px] leading-relaxed animate-fade-up">
                {question.prompt}
              </p>

              {/* Helper hints — separate from prompt, optional reveal */}
              {!feedback && (question.target_hint || (question.context_helpers?.length ?? 0) > 0) && (
                <div className="space-y-2 pt-1 border-t border-border/50">
                  <div className="flex flex-wrap gap-2">
                    {question.target_hint && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-ochre"
                        onClick={revealTargetHint}
                        disabled={showTargetHint}
                      >
                        {showTargetHint ? "Target hint shown" : "Need target hint (−score)"}
                      </Button>
                    )}
                    {(question.context_helpers?.length ?? 0) > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-muted"
                        onClick={() => setShowContextHelpers((v) => !v)}
                      >
                        {showContextHelpers ? "Hide context helpers" : "Show context helpers"}
                      </Button>
                    )}
                  </div>

                  {showTargetHint && question.target_hint && (
                    <div className="rounded-xl border border-ochre/30 bg-ochre/5 px-3 py-2.5 text-sm text-ink/85">
                      <p className="text-[10px] font-mono uppercase tracking-widest text-ochre mb-1">
                        Target hint
                      </p>
                      <p>{question.target_hint}</p>
                      <p className="text-xs text-ochre/80 mt-1">
                        Using this hint marks your answer as assisted.
                      </p>
                    </div>
                  )}

                  {showContextHelpers && (question.context_helpers?.length ?? 0) > 0 && (
                    <div className="rounded-xl border border-border/70 bg-surface-2/50 px-3 py-2.5">
                      <p className="text-[10px] font-mono uppercase tracking-widest text-faint mb-2">
                        Context helpers
                      </p>
                      <ul className="space-y-1.5 text-sm">
                        {question.context_helpers!.map((h, idx) => (
                          <li key={idx} className="flex gap-2">
                            <span className="hanzi font-semibold text-ink shrink-0">{h.word}</span>
                            <span className="text-muted">{h.gloss}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Answer input */}
              {!feedback && (
                <div className="space-y-3 pt-1">
                  <input
                    ref={answerRef}
                    type="text"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !grading) submitAnswer();
                    }}
                    placeholder="Type your answer in Mandarin…"
                    className="w-full border border-border rounded-xl px-4 py-3 text-ink text-base bg-surface focus:outline-none focus:ring-2 focus:ring-seal focus:border-transparent transition-colors placeholder:text-faint"
                    disabled={grading}
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="primary"
                      className="flex-1"
                      onClick={() => submitAnswer()}
                      disabled={grading || !answer.trim()}
                      loading={grading}
                    >
                      Submit
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => submitAnswer(true)}
                      disabled={grading}
                    >
                      Skip
                    </Button>
                  </div>
                </div>
              )}

              {/* Feedback */}
              {feedback && (
                <div className="space-y-3">
                  <FeedbackView graderOut={feedback.graderOut} outcome={feedback.outcome} />
                  <Button variant="primary" className="w-full" onClick={advance}>
                    Next →
                  </Button>
                </div>
              )}
            </>
          ) : (
            /* Fallback: question null but not loading — should not occur normally */
            <div className="text-center py-10 text-faint text-sm font-mono">
              <InkLoader className="justify-center mb-2" />
              Loading question…
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
