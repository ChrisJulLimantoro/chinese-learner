"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Seal from "./Seal";
import ThemeToggle from "./ThemeToggle";
import {
  ME_LINK,
  PRIMARY_LINKS,
  PROGRESS_LINKS,
  TAB_LINKS,
  isLinkActive,
  type NavItem,
} from "./navLinks";

const SIDEBAR_LINK_BASE =
  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors";

function SidebarLink({ item, active }: { item: NavItem; active: boolean }) {
  const tone = active ? "bg-seal/10 text-seal" : "text-muted hover:bg-surface-2 hover:text-ink";
  return (
    <Link href={item.href} className={`${SIDEBAR_LINK_BASE} ${tone}`}>
      <span className="text-base w-5 text-center" aria-hidden>{item.icon}</span>
      {item.label}
      {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-seal shrink-0" aria-hidden />}
    </Link>
  );
}

function TabLink({ item, active }: { item: NavItem; active: boolean }) {
  const tone = active ? "text-seal" : "text-faint";
  return (
    <Link
      href={item.href}
      className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 text-xs font-medium transition-colors min-h-[44px] ${tone}`}
    >
      <span className="text-lg leading-none" aria-hidden>{item.icon}</span>
      <span>{item.label}</span>
      {active && <span className="w-1 h-1 rounded-full bg-seal mt-0.5" aria-hidden />}
    </Link>
  );
}

function SidebarGroup({ title, items, pathname }: { title: string; items: NavItem[]; pathname: string }) {
  return (
    <div className="space-y-0.5">
      <p className="px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-faint">{title}</p>
      {items.map((item) => (
        <SidebarLink key={item.href} item={item} active={isLinkActive(pathname, item.href)} />
      ))}
    </div>
  );
}

function SidebarLogo() {
  return (
    <div className="px-5 py-4 border-b border-border flex items-center gap-3">
      <Seal size={32} />
      <span className="font-display text-lg font-semibold text-ink leading-none">
        汉字<span className="text-muted font-sans font-normal text-sm ml-1.5">Learner</span>
      </span>
    </div>
  );
}

function SidebarFooter({ pathname }: { pathname: string }) {
  return (
    <div className="p-3 border-t border-border space-y-1">
      <SidebarLink item={ME_LINK} active={isLinkActive(pathname, ME_LINK.href)} />
      <ThemeToggle />
    </div>
  );
}

function Sidebar({ pathname }: { pathname: string }) {
  return (
    <aside className="hidden md:flex md:flex-col md:w-60 md:shrink-0 md:border-r md:border-border md:bg-surface md:min-h-screen md:sticky md:top-0 md:h-screen">
      <SidebarLogo />
      <nav className="flex-1 p-3 space-y-4 overflow-y-auto">
        <SidebarGroup title="Practice" items={PRIMARY_LINKS} pathname={pathname} />
        <SidebarGroup title="Progress" items={PROGRESS_LINKS} pathname={pathname} />
      </nav>
      <SidebarFooter pathname={pathname} />
    </aside>
  );
}

function TabBar({ pathname }: { pathname: string }) {
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 bg-surface border-t border-border z-50 flex pb-safe">
      {TAB_LINKS.map((item) => (
        <TabLink key={item.href} item={item} active={isLinkActive(pathname, item.href)} />
      ))}
    </nav>
  );
}

export default function Nav() {
  const pathname = usePathname();
  return (
    <>
      <Sidebar pathname={pathname} />
      <TabBar pathname={pathname} />
    </>
  );
}
