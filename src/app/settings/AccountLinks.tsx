import Link from "next/link";
import { signOut } from "@/app/actions/auth";
import ThemeToggle from "@/components/ThemeToggle";
import LedgerCard, { LedgerHeading } from "./LedgerCard";

const ROW_CLASS =
  "group flex items-center gap-3 w-full min-h-[52px] px-5 text-sm font-medium text-ink hover:bg-surface-2 transition-colors";

function Chevron() {
  return <span className="ml-auto text-faint transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden>›</span>;
}

function LinkRow({ href, cn, label, desc }: { href: string; cn: string; label: string; desc: string }) {
  return (
    <Link href={href} className={ROW_CLASS}>
      <span className="hanzi text-lg w-8 text-center text-seal/70" aria-hidden>{cn}</span>
      <span className="flex flex-col">
        {label}
        <span className="text-xs font-normal text-faint">{desc}</span>
      </span>
      <Chevron />
    </Link>
  );
}

function SignOutRow() {
  return (
    <form action={signOut}>
      <button type="submit" className={`${ROW_CLASS} text-seal`}>
        <span className="text-base w-8 text-center" aria-hidden>⎋</span>
        Sign out
      </button>
    </form>
  );
}

export default function AccountLinks({ isAdmin }: { isAdmin: boolean }) {
  return (
    <LedgerCard hanzi="我" label="ACCOUNT">
      <LedgerHeading>Account</LedgerHeading>
      <div className="divide-y divide-border">
        <LinkRow href="/stats" cn="进度" label="Stats" desc="Mastery & streak" />
        <LinkRow href="/sessions" cn="记录" label="Sessions" desc="Full history" />
        {isAdmin && <LinkRow href="/admin" cn="管" label="Admin" desc="Users & limits" />}
        <ThemeToggle className="min-h-[52px] rounded-none px-5 text-ink" />
        <SignOutRow />
      </div>
    </LedgerCard>
  );
}
