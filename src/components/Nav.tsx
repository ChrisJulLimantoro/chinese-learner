"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/app/actions/auth";
import Seal from "./Seal";
import ThemeToggle from "./ThemeToggle";

const NAV_LINKS = [
  { href: "/",           label: "Home",       icon: "⊙" },
  { href: "/study",      label: "Study",      icon: "✎" },
  { href: "/vocabulary", label: "Vocabulary", icon: "本" },
  { href: "/sessions",   label: "Sessions",   icon: "☰" },
  { href: "/stats",      label: "Stats",      icon: "◉" },
];

export default function Nav({ isAdmin = false }: { isAdmin?: boolean }) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      {/* ── Desktop sidebar ────────────────────────────────────────── */}
      <aside className="hidden md:flex md:flex-col md:w-60 md:shrink-0 md:border-r md:border-border md:bg-surface md:min-h-screen md:sticky md:top-0 md:h-screen">
        {/* Logo */}
        <div className="px-5 py-4 border-b border-border flex items-center gap-3">
          <Seal size={32} />
          <span className="font-display text-lg font-semibold text-ink leading-none">
            汉字<span className="text-muted font-sans font-normal text-sm ml-1.5">Learner</span>
          </span>
        </div>

        {/* Nav group */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          <p className="px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-faint">
            Practice
          </p>
          {NAV_LINKS.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  active
                    ? "bg-seal/10 text-seal"
                    : "text-muted hover:bg-surface-2 hover:text-ink"
                }`}
              >
                <span className="text-base w-5 text-center" aria-hidden>{link.icon}</span>
                {link.label}
                {active && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-seal shrink-0" aria-hidden />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Pinned footer */}
        <div className="p-3 border-t border-border space-y-1">
          <Link
            href="/settings"
            className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              pathname.startsWith("/settings")
                ? "bg-seal/10 text-seal"
                : "text-muted hover:bg-surface-2 hover:text-ink"
            }`}
          >
            <span className="text-base w-5 text-center" aria-hidden>⚙</span>
            Settings
          </Link>
          {isAdmin && (
            <Link
              href="/admin"
              className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname.startsWith("/admin")
                  ? "bg-seal/10 text-seal"
                  : "text-muted hover:bg-surface-2 hover:text-ink"
              }`}
            >
              <span className="text-base w-5 text-center" aria-hidden>◈</span>
              Admin
            </Link>
          )}
          <ThemeToggle />
          <form action={signOut}>
            <button
              type="submit"
              className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium text-muted hover:bg-surface-2 hover:text-ink transition-colors"
            >
              <span className="text-base w-5 text-center" aria-hidden>⎋</span>
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* ── Mobile bottom nav ──────────────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-surface border-t border-border z-50 flex pb-safe">
        {NAV_LINKS.map((link) => {
          const active = isActive(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 text-xs font-medium transition-colors min-h-[44px] ${
                active ? "text-seal" : "text-faint"
              }`}
            >
              <span className={`text-lg leading-none ${active ? "text-seal" : ""}`} aria-hidden>
                {link.icon}
              </span>
              <span>{link.label}</span>
              {active && <span className="w-1 h-1 rounded-full bg-seal mt-0.5" aria-hidden />}
            </Link>
          );
        })}
        <Link
          href="/settings"
          className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 text-xs font-medium transition-colors min-h-[44px] ${
            pathname.startsWith("/settings") ? "text-seal" : "text-faint"
          }`}
        >
          <span className="text-lg leading-none" aria-hidden>⚙</span>
          <span>Settings</span>
        </Link>
        <form action={signOut} className="flex-1 flex">
          <button
            type="submit"
            className="flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 text-xs font-medium text-faint hover:text-ink transition-colors min-h-[44px]"
          >
            <span className="text-lg leading-none" aria-hidden>⎋</span>
            <span>Out</span>
          </button>
        </form>
      </nav>
    </>
  );
}
