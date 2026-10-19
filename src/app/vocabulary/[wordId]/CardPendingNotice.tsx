import { InkLoader, Skeleton } from "@/components/ui";
import type { CardStatus } from "./useLessonCard";

function LoadingNotice() {
  return (
    <div className="space-y-3" role="status" aria-live="polite">
      <div className="flex items-center gap-2 text-xs text-muted">
        <InkLoader /> Writing the lesson card — basic meanings shown below meanwhile.
      </div>
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
}

export default function CardPendingNotice({ status }: { status: CardStatus }) {
  if (status === "loading") return <LoadingNotice />;
  if (status === "failed") return <p className="text-xs text-muted">Lesson card isn&apos;t available yet. Try “Regenerate card” in a moment.</p>;
  return null;
}
