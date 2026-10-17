"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { startScrambleAction, submitScrambleAction } from "../actions/scramble";
import { MAX_WORD_LENGTH, meaningOptions, pointsFor } from "@/lib/scramble";
import type { IndexedWord, ScrambleBoard, WordResult } from "@/lib/scramble";
import { isRejectedSingleChar, makeLookups, selectionText } from "./scrambleLookups";
import type { FoundWord } from "./ScrambleSummary";

export type Phase = "intro" | "loading" | "playing" | "done";
export type PickerState = { word: IndexedWord; options: string[]; tileIds: number[] };

const SINGLE_CHAR_REJECTION = "Single characters only count if they're on the board as words";

function toggleIn(selected: number[], tileId: number): number[] {
  if (selected.includes(tileId)) return selected.filter((id) => id !== tileId);
  return selected.length < MAX_WORD_LENGTH ? [...selected, tileId] : selected;
}

export function useScrambleGame() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [board, setBoard] = useState<ScrambleBoard | null>(null);
  const [runId, setRunId] = useState(0);
  const [selected, setSelected] = useState<number[]>([]);
  const [removed, setRemoved] = useState<Set<number>>(new Set());
  const [picker, setPicker] = useState<PickerState | null>(null);
  const [results, setResults] = useState<WordResult[]>([]);
  const [score, setScore] = useState(0);
  const [saved, setSaved] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const finishedRef = useRef(false);
  const lookups = useMemo(() => (board ? makeLookups(board) : null), [board]);

  const beginRun = (next: ScrambleBoard) => {
    finishedRef.current = false;
    setBoard(next);
    setRunId((id) => id + 1);
    setSelected([]);
    setRemoved(new Set());
    setPicker(null);
    setResults([]);
    setScore(0);
    setSaved(false);
    setMessage(null);
    setPhase("playing");
  };

  const start = async () => {
    setPhase("loading");
    try {
      beginRun(await startScrambleAction());
    } catch (e) {
      setMessage(String(e));
      setPhase("intro");
    }
  };

  const finish = useCallback((finalResults: WordResult[]) => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setPicker(null);
    setPhase("done");
    submitScrambleAction(finalResults)
      .then(() => setSaved(true))
      .catch(() => setMessage("Could not save this run."));
  }, []);

  const toggleTile = (tileId: number) => {
    setSelected((s) => toggleIn(s, tileId));
    setMessage(null);
  };

  const rejectSelection = (text: string) => {
    setMessage(text);
    setSelected([]);
  };

  const rejectionFor = (word: IndexedWord | undefined): string | null => {
    if (!word) return "Not a word in your list";
    if (isRejectedSingleChar(lookups!, word)) return SINGLE_CHAR_REJECTION;
    return results.some((r) => r.wordId === word.id) ? "Already tried that word" : null;
  };

  const checkSelection = () => {
    if (!lookups) return;
    const word = lookups.byText.get(selectionText(lookups, selected));
    const rejection = rejectionFor(word);
    if (rejection) return rejectSelection(rejection);
    setPicker({ word: word!, options: meaningOptions(word!, lookups.pools), tileIds: selected });
  };

  const resolvePicker = (correct: boolean) => {
    if (!picker || !board || finishedRef.current) return;
    const nextResults = [...results, { wordId: picker.word.id, correct }];
    const nextRemoved = correct ? new Set([...removed, ...picker.tileIds]) : removed;
    setResults(nextResults);
    setRemoved(nextRemoved);
    setSelected([]);
    setPicker(null);
    if (correct) setScore((s) => s + pointsFor(picker.word.simplified));
    if (nextRemoved.size === board.tiles.length) finish(nextResults);
  };

  const found: FoundWord[] = results.flatMap((r) => {
    const word = lookups?.byId.get(r.wordId);
    return word ? [{ word, correct: r.correct }] : [];
  });

  const expire = useCallback(() => finish(results), [finish, results]);

  return {
    phase, board, lookups, runId, selected, removed, picker, score, saved, message, found,
    start, toggleTile, checkSelection, resolvePicker, expire,
    clearSelection: () => setSelected([]),
  };
}
