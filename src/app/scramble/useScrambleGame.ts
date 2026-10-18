"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { startScrambleAction, submitScrambleAction } from "../actions/scramble";
import { MAX_WORD_LENGTH, pointsFor } from "@/lib/scramble";
import type { BoardWord, Difficulty, ScrambleBoard, WordChoice } from "@/lib/scramble";
import { hasPlayableWord, makeLookups, selectionText } from "./scrambleLookups";
import type { FoundWord } from "./CheckedWordList";

export type Phase = "intro" | "loading" | "playing" | "done";
export type PickerState = { word: BoardWord; options: string[]; tileIds: number[] };
export type Miss = { word: BoardWord; chosen: string };

function toggleIn(selected: number[], tileId: number): number[] {
  if (selected.includes(tileId)) return selected.filter((id) => id !== tileId);
  return selected.length < MAX_WORD_LENGTH ? [...selected, tileId] : selected;
}

export function useScrambleGame() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [board, setBoard] = useState<ScrambleBoard | null>(null);
  const [selected, setSelected] = useState<number[]>([]);
  const [removed, setRemoved] = useState<Set<number>>(new Set());
  const [missedTiles, setMissedTiles] = useState<Set<number>>(new Set());
  const [lastMiss, setLastMiss] = useState<Miss | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [picker, setPicker] = useState<PickerState | null>(null);
  const [choices, setChoices] = useState<WordChoice[]>([]);
  const [score, setScore] = useState(0);
  const [saved, setSaved] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const finishedRef = useRef(false);
  const lookups = useMemo(() => (board ? makeLookups(board) : null), [board]);

  const beginRun = (next: ScrambleBoard) => {
    finishedRef.current = false;
    setBoard(next);
    setSelected([]);
    setRemoved(new Set());
    setMissedTiles(new Set());
    setLastMiss(null);
    setPicker(null);
    setChoices([]);
    setScore(0);
    setSaved(false);
    setMessage(null);
    setPhase("playing");
  };

  const start = async (level: Difficulty = difficulty) => {
    setDifficulty(level);
    setPhase("loading");
    try {
      beginRun(await startScrambleAction(level));
    } catch (e) {
      setMessage(String(e));
      setPhase("intro");
    }
  };

  const finish = useCallback((runId: number, finalChoices: WordChoice[]) => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setPicker(null);
    setPhase("done");
    submitScrambleAction(runId, finalChoices)
      .then(() => setSaved(true))
      .catch(() => setMessage("Could not save this run."));
  }, []);

  const toggleTile = (tileId: number) => {
    setSelected((s) => toggleIn(s, tileId));
    setMessage(null);
    setLastMiss(null);
  };

  const rejectSelection = (text: string) => {
    setMessage(text);
    setSelected([]);
  };

  const rejectionFor = (word: BoardWord | undefined): string | null => {
    if (!word) return "Not a word in your list";
    return choices.some((c) => c.wordId === word.id) ? "Already tried that word" : null;
  };

  const checkSelection = () => {
    if (!lookups) return;
    const word = lookups.byText.get(selectionText(lookups, selected));
    const rejection = rejectionFor(word);
    if (rejection) return rejectSelection(rejection);
    setPicker({ word: word!, options: word!.options, tileIds: selected });
  };

  const resolvePicker = (meaning: string) => {
    if (!picker || !board || finishedRef.current) return;
    const correct = meaning === picker.word.meaning;
    const nextChoices = [...choices, { wordId: picker.word.id, meaning }];
    const nextRemoved = correct ? new Set([...removed, ...picker.tileIds]) : removed;
    setChoices(nextChoices);
    setRemoved(nextRemoved);
    if (!correct) setMissedTiles(new Set([...missedTiles, ...picker.tileIds]));
    setLastMiss(correct ? null : { word: picker.word, chosen: meaning });
    setSelected([]);
    setPicker(null);
    if (correct) setScore((s) => s + pointsFor(picker.word.simplified));
    if (!hasPlayableWord(board, nextRemoved, new Set(nextChoices.map((c) => c.wordId)))) finish(board.runId, nextChoices);
  };

  const found: FoundWord[] = choices.flatMap((c) => {
    const word = lookups?.byId.get(c.wordId);
    return word ? [{ word, correct: word.meaning === c.meaning }] : [];
  });

  const expire = useCallback(() => board && finish(board.runId, choices), [board, finish, choices]);

  return {
    phase, board, lookups, selected, removed, missedTiles, lastMiss, difficulty, picker, score, saved, message, found,
    start, toggleTile, checkSelection, resolvePicker, expire,
    clearSelection: () => setSelected([]),
  };
}
