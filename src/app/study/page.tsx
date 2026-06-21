import { getUserContext } from "@/lib/user";
import { listVocabulary, listAddableWords } from "@/lib/services";
import StudyBuilderClient from "./StudyBuilderClient";

// Session creation may call LLM
export const maxDuration = 60;
export const dynamic = "force-dynamic";

export default async function StudyPage() {
  const { supabase, userId } = await getUserContext();

  const [bank, addable] = await Promise.allSettled([
    listVocabulary(supabase, userId),
    listAddableWords(supabase, userId, 40),
  ]);

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <StudyBuilderClient
        bank={bank.status === "fulfilled" ? bank.value : []}
        addableWords={addable.status === "fulfilled" ? addable.value : []}
      />
    </main>
  );
}
