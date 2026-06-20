import { getUserContext } from "@/lib/user";
import { listVocabulary } from "@/lib/services";
import VocabularyClient from "./VocabularyClient";

export const dynamic = "force-dynamic";

export default async function VocabularyPage() {
  const { supabase, userId } = await getUserContext();

  let vocab: Awaited<ReturnType<typeof listVocabulary>> = [];
  try {
    vocab = await listVocabulary(supabase, userId);
  } catch {
    vocab = [];
  }

  return <VocabularyClient vocab={vocab} />;
}
