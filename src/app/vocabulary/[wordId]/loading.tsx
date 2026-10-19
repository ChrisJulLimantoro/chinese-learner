import { Skeleton } from "@/components/ui";

export default function WordLoading() {
  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8" aria-busy="true">
      <div className="max-w-3xl mx-auto space-y-5">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-64 w-full rounded-2xl" />
        <Skeleton className="h-32 w-full rounded-2xl" />
      </div>
    </main>
  );
}
