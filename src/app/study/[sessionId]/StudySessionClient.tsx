"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { gradeAnswerAction } from "../../actions/session";
import type { Session, LessonCard, GraderOutput, Outcome } from "@/lib/types";
import { Card, Button, Badge, ProgressBar } from "@/components/ui";
import Seal from "@/components/Seal";

const TIMER_SECONDS = 120;
const TYPE_LABELS: Record<string, string> = {
  en_to_zh:        "Translate to Mandarin",
  cloze:           "Fill in the blank",
  synonym_discrim: "Synonym discrimination",
  gloss_to_word:   "Gloss to word",
};

// ─── Lesson card ───────────────────────────────────────────────────────────

function LessonCardView({ card }: { card: LessonCard; word?: unknown }) {
  return (
    <div className="space-y-5">
      {/* Character hero */}
      <div className="text-center py-6 bg-paper rounded-xl border border-border animate-hanzi-in">
        <div className="hanzi text-7xl font-bold text-ink mb-2 leading-none">{card.simplified}</div>
        {card.traditional && card.traditional !== card.simplified && (
          <div className="hanzi text-2xl text-muted mb-1">{card.traditional}</div>
        )}
        <div className="text-jade text-lg font-medium mt-1">{card.pinyin_marked}</div>
        <div className="text-xs text-faint mt-1 font-mono">HSK {card.hsk_level}</div>
      </div>

      {/* Meanings */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-faint mb-2">Meanings</p>
        <div className="flex flex-wrap gap-2">
          {card.core_meanings.map((m, i) => (
            <Badge key={i} variant="muted">{m}</Badge>
          ))}
        </div>
      </div>

      {/* Nuance */}
      {card.nuance && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-faint mb-1">Nuance</p>
          <p className="text-sm text-ink/80 leading-relaxed">{card.nuance}</p>
        </div>
      )}

      {/* Examples */}
      {card.examples.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-faint mb-2">Examples</p>
          <div className="space-y-2.5">
            {card.examples.map((ex, i) => (
              <div key={i} className="bg-surface-2 rounded-xl p-3.5 border border-border">
                <p className="hanzi text-base font-semibold text-ink">{ex.hanzi}</p>
                <p className="text-jade text-sm mt-0.5">{ex.pinyin}</p>
                <p className="text-muted text-sm mt-0.5">{ex.gloss}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Character breakdown */}
      {card.character_breakdown.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-faint mb-2">
            Character breakdown
          </p>
          <div className="flex flex-wrap gap-3">
            {card.character_breakdown.map((c, i) => (
              <div
                key={i}
                className="bg-surface-2 rounded-xl px-3 py-2.5 text-center min-w-[64px] border border-border"
              >
                <div className="hanzi text-2xl font-bold text-ink">{c.char}</div>
                <div className="text-xs text-muted mt-1">{c.meaning}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Feedback ─────────────────────────────────────────────────────────────

function FeedbackView({
  graderOut,
}: {
  graderOut: GraderOutput;
  outcome: string;
}) {
  const correct = graderOut.correct;
  return (
    <div
      className={`rounded-2xl p-4 border-l-4 animate-fade-up ${
        correct
          ? "bg-jade/10 border-jade"
          : "bg-seal/10 border-seal"
      }`}
    >
      <div className="flex items-center gap-3 mb-2">
        <span className={`font-semibold text-sm ${correct ? "text-jade" : "text-seal"}`}>
          {correct ? "Correct" : "Incorrect"}
        </span>
        <span className="text-xs text-ochre font-mono tracking-widest">
          {"★".repeat(graderOut.naturalness)}{"☆".repeat(5 - graderOut.naturalness)}
        </span>
      </div>
      {graderOut.feedback && (
        <p className="text-sm text-ink/80 leading-relaxed">{graderOut.feedback}</p>
      )}
      {graderOut.issues.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {graderOut.issues.map((issue, i) => (
            <Badge key={i} variant="ochre">{issue}</Badge>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main session component ────────────────────────────────────────────────

export default function StudySessionClient({ session: initialSession }: { session: Session }) {
  const router = useRouter();
  const [items] = useState(initialSession.items);
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
  const [outcomes, setOutcomes] = useState<Record<number, Outcome>>(() => {
    const m: Record<number, Outcome> = {};
    for (const it of initialSession.items) if (it.outcome) m[it.item_id] = it.outcome;
    return m;
  });
  // eslint-disable-next-line react-hooks/purity
  const startTimeRef = useRef<number>(Date.now());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const answerRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (phase !== "drill") return;
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
  }, [phase, cursor]);

  const currentItem = items[cursor] ?? items[items.length - 1];
  const totalDrill = items.length;

  // ── LEARN phase ──────────────────────────────────────────────────────────

  if (phase === "learn") {
    const learnItem = items[learnIdx];
    const card = learnItem?.lesson_card;
    const isLast = learnIdx >= items.length - 1;

    return (
      <div className="max-w-xl mx-auto space-y-5">
        {/* Sticky progress bar */}
        <div className="sticky top-0 z-20 bg-paper/80 backdrop-blur-sm -mx-4 px-4 py-3 border-b border-border/50">
          <div className="flex items-center gap-3">
            <p className="text-xs font-semibold text-muted whitespace-nowrap">
              Learn {learnIdx + 1}/{items.length}
            </p>
            <ProgressBar
              value={learnIdx + 1}
              max={items.length}
              color="jade"
              height="xs"
              className="flex-1"
            />
          </div>
        </div>

        <Card variant="elevated" padding="lg">
          {card ? (
            <LessonCardView card={card} word={learnItem.word} />
          ) : (
            <div className="text-center py-10 animate-hanzi-in">
              <div className="hanzi text-7xl font-bold text-ink mb-3 leading-none">
                {learnItem.word.simplified}
              </div>
              <div className="text-jade text-lg mt-1">{learnItem.word.pinyin}</div>
              <div className="text-muted text-sm mt-2">
                {learnItem.word.meanings?.join(", ")}
              </div>
            </div>
          )}
        </Card>

        <div className="flex justify-between gap-3">
          {learnIdx > 0 && (
            <Button variant="outline" onClick={() => setLearnIdx((i) => i - 1)}>
              ← Back
            </Button>
          )}
          <Button
            variant="primary"
            className="ml-auto"
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

  // ── SESSION COMPLETE ──────────────────────────────────────────────────────

  if (sessionComplete) {
    const answered = Object.keys(outcomes).length;
    const correct = Object.values(outcomes).filter((o) => o === "correct").length;
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
        </div>
        <div className="flex flex-wrap gap-3 justify-center">
          <Button variant="outline" onClick={() => router.push("/")}>Home</Button>
          <Button variant="outline" onClick={() => router.push("/sessions")}>Sessions</Button>
          <Button variant="primary" onClick={() => router.push("/study")}>New session</Button>
        </div>
      </div>
    );
  }

  // ── DRILL phase ───────────────────────────────────────────────────────────

  const submitAnswer = async (hesitated = false) => {
    if (grading) return;
    const elapsed = Date.now() - startTimeRef.current;
    setGrading(true);
    clearInterval(timerRef.current!);

    try {
      const result = await gradeAnswerAction(
        currentItem.item_id,
        answer || (hesitated ? "___hesitated___" : ""),
        elapsed,
        hesitated || overTimer
      );
      setFeedback({ graderOut: result.grader_output, outcome: result.outcome });
      setOutcomes((o) => ({ ...o, [currentItem.item_id]: result.outcome }));
      if (result.grader_output.correct) {
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

  const advance = () => {
    setFeedback(null);
    setShowStamp(false);
    setAnswer("");
    setCursor((c) => c + 1);
  };

  const timerColor =
    overTimer ? "text-seal" : timeLeft < 30 ? "text-ochre" : "text-faint";

  return (
    <div className="max-w-xl mx-auto space-y-5">
      {/* Sticky progress + timer */}
      <div className="sticky top-0 z-20 bg-paper/80 backdrop-blur-sm -mx-4 px-4 py-3 border-b border-border/50">
        <div className="flex items-center gap-3">
          <p className="text-xs font-semibold text-muted whitespace-nowrap">
            Drill {Math.min(cursor + 1, totalDrill)}/{totalDrill}
          </p>
          <ProgressBar
            value={cursor}
            max={totalDrill}
            color="jade"
            height="xs"
            className="flex-1"
          />
          <span className={`font-mono text-xs tabular-nums whitespace-nowrap ${timerColor}`}>
            {overTimer ? "over" : `${timeLeft}s`}
          </span>
        </div>
      </div>

      {/* Word card */}
      <Card variant="elevated" padding="lg" className="space-y-5 relative">
        {/* Stamp overlay */}
        {showStamp && (
          <div className="absolute top-4 right-4 z-10 pointer-events-none">
            <Seal size={52} stamp />
          </div>
        )}

        {/* Decorative hanzi (alternates, reveals nothing) */}
        <div className="text-center py-4 bg-paper rounded-xl border border-border animate-hanzi-in" aria-hidden>
          <div className="hanzi text-6xl font-bold text-ink/20 leading-none select-none">
            {cursor % 2 === 0 ? "中文" : "测试"}
          </div>
        </div>

        {/* Question type */}
        <div className="text-xs font-semibold uppercase tracking-widest text-faint">
          {TYPE_LABELS[currentItem.question_json.type] ?? currentItem.question_json.type}
        </div>

        {/* Prompt */}
        <p className="text-ink text-sm leading-relaxed">{currentItem.question_json.prompt}</p>

        {/* Answer input */}
        {!feedback && (
          <div className="space-y-3">
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
      </Card>
    </div>
  );
}

