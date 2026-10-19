import { useEffect, useState } from "react";
import { getWordCardAction } from "@/app/actions/vocabulary";
import type { LessonCard } from "@/lib/types";
import type { WordDetail } from "@/lib/vocabularyService";

export type CardStatus = "ready" | "loading" | "failed";

async function fetchCard(wordId: number): Promise<LessonCard | null> {
  try {
    return (await getWordCardAction(wordId)).lesson_card;
  } catch {
    return null;
  }
}

export function useLessonCard(data: WordDetail) {
  const [card, setCard] = useState<LessonCard | null>(data.lesson_card);
  const [status, setStatus] = useState<CardStatus>(data.card_pending ? "loading" : "ready");
  const applyCard = (next: LessonCard | null) => { setCard(next ?? card); setStatus(next ? "ready" : "failed"); };
  useEffect(() => {
    if (!data.card_pending) return;
    let cancelled = false;
    fetchCard(data.word.id).then((next) => cancelled || applyCard(next));
    return () => { cancelled = true; };
  }, [data.card_pending, data.word.id]); // eslint-disable-line react-hooks/exhaustive-deps -- fetch once per word, applyCard only sets state
  return { card, setCard: applyCard, status };
}
