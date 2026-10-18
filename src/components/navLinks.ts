export interface NavItem {
  href: string;
  label: string;
  icon: string;
}

export const PRIMARY_LINKS: NavItem[] = [
  { href: "/",           label: "Home",       icon: "⊙" },
  { href: "/study",      label: "Study",      icon: "✎" },
  { href: "/vocabulary", label: "Vocabulary", icon: "本" },
  { href: "/scramble",   label: "Scramble",   icon: "字" },
];

export const PROGRESS_LINKS: NavItem[] = [
  { href: "/stats",    label: "Stats",    icon: "◉" },
  { href: "/sessions", label: "Sessions", icon: "☰" },
];

export const ME_LINK: NavItem = { href: "/settings", label: "Me", icon: "我" };

export const TAB_LINKS: NavItem[] = [
  { href: "/",           label: "Home",     icon: "⊙" },
  { href: "/study",      label: "Study",    icon: "✎" },
  { href: "/vocabulary", label: "Words",    icon: "本" },
  { href: "/scramble",   label: "Scramble", icon: "字" },
  ME_LINK,
];

export function isLinkActive(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}
