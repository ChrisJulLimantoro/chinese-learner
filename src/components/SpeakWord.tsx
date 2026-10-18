import SpeakButton from "@/components/SpeakButton";
import { hasMultipleReadings } from "@/lib/readings";
import type { Word } from "@/lib/types";

type SpokenWord = Pick<Word, "simplified" | "readings">;

export default function SpeakWord({ word }: { word: SpokenWord }) {
  if (!hasMultipleReadings(word.readings)) return <SpeakButton text={word.simplified} />;
  return (
    <>
      {word.readings.map((r) => (
        <SpeakButton key={r.pinyin} text={r.spoken ?? word.simplified} label={r.pinyin} />
      ))}
    </>
  );
}
