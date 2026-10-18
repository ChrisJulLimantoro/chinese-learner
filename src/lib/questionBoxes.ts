import { PREFERRED_TYPES_BY_BOX, UNSEEN_BOX } from "./config";
import type { Question } from "./types";

export type BoxByWord = Map<number, number>;
export type QuestionType = Question["type"];

export function preferredTypes(boxes: BoxByWord, wordId: number): QuestionType[] {
  return PREFERRED_TYPES_BY_BOX[boxes.get(wordId) ?? UNSEEN_BOX];
}
