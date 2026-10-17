import type { GraderOutput, Outcome } from "./types";

export function outcomeFor(graderOut: GraderOutput, hesitated: boolean): Outcome {
  if (hesitated && graderOut.self_grade) return "hesitated";
  if (!graderOut.correct) return "wrong";
  return hesitated ? "hesitated" : "correct";
}
