import Link from "next/link";
import { signOut } from "@/app/actions/auth";
import ThemeToggle from "@/components/ThemeToggle";
import { Card } from "@/components/ui";

const ROW_CLASS =
  "flex items-center gap-3 w-full min-h-[44px] px-3 rounded-xl text-sm font-medium text-ink hover:bg-surface-2 transition-colors";

function Chevron() {
  return <span className="ml-auto text-faint" aria-hidden>›</span>;
}

function LinkRow({ href, icon, label }: { href: string; icon: string; label: string }) {
  return (
    <Link href={href} className={ROW_CLASS}>
      <span className="text-base w-5 text-center text-muted" aria-hidden>{icon}</span>
      {label}
      <Chevron />
    </Link>
  );
}

function SignOutRow() {
  return (
    <form action={signOut} className="border-t border-border mt-2 pt-2">
      <button type="submit" className={`${ROW_CLASS} text-seal`}>
        <span className="text-base w-5 text-center" aria-hidden>⎋</span>
        Sign out
      </button>
    </form>
  );
}

export default function AccountLinks({ isAdmin }: { isAdmin: boolean }) {
  return (
    <Card variant="paper" padding="sm" className="mb-6">
      <h2 className="font-semibold text-ink px-3 pt-2 pb-1">Account</h2>
      <LinkRow href="/stats" icon="◉" label="Stats" />
      <LinkRow href="/sessions" icon="☰" label="Sessions" />
      {isAdmin && <LinkRow href="/admin" icon="◈" label="Admin" />}
      <ThemeToggle className="min-h-[44px] rounded-xl text-ink" />
      <SignOutRow />
    </Card>
  );
}
