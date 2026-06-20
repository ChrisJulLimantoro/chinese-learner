import { getUserContext } from "@/lib/user";
import { getWordCard } from "@/lib/services";
import WordCardClient from "./WordCardClient";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function WordDetailPage({
  params,
}: {
  params: Promise<{ wordId: string }>;
}) {
  const { wordId } = await params;
  const { supabase, userId } = await getUserContext();

  let data;
  try {
    data = await getWordCard(supabase, userId, parseInt(wordId, 10));
  } catch {
    notFound();
  }

  return <WordCardClient data={data} />;
}
