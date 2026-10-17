const PUNCT = /[。，、！？,.!?；;：:「」『』【】《》\s]+/g;

export function normalize(answer: string): string {
  return answer.trim().replace(PUNCT, "").toLowerCase();
}
