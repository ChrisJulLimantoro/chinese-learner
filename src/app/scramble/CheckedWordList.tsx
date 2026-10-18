import { Badge } from "@/components/ui";
import type { IndexedWord } from "@/lib/scramble";

export type FoundWord = { word: IndexedWord; correct: boolean };

export default function CheckedWordList({ found }: { found: FoundWord[] }) {
  if (found.length === 0) return null;
  return (
    <ul className="divide-y divide-border rounded-xl border border-border overflow-hidden">
      {found.map(({ word, correct }) => (
        <li key={word.id} className="flex items-center gap-3 px-4 py-2.5">
          <Badge variant={correct ? "jade" : "seal"}>{correct ? "✓" : "✗"}</Badge>
          <span className="hanzi font-semibold text-ink">{word.simplified}</span>
          <span className="text-jade text-sm">{word.pinyin}</span>
          <span className="text-muted text-sm truncate ml-auto">{word.meaning}</span>
        </li>
      ))}
    </ul>
  );
}
