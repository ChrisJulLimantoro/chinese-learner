import { Skeleton } from "@/components/ui";

const ROWS = 8;

export default function VocabularyLoading() {
  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-4" aria-busy="true">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-10 w-full" />
      {Array.from({ length: ROWS }, (_, i) => <Skeleton key={i} className="h-[52px] w-full" />)}
    </main>
  );
}
