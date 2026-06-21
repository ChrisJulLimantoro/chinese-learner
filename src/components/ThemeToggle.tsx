"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle({ className = "" }: { className?: string }) {
  // Keep first render deterministic to avoid hydration mismatch.
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {}
  };

  return (
    <button
      onClick={toggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium text-muted hover:bg-surface-2 hover:text-ink transition-colors ${className}`}
    >
      <span className="text-base w-5 text-center select-none" aria-hidden>
        {dark ? "☀" : "☾"}
      </span>
      <span>{dark ? "Light" : "Dark"} mode</span>
    </button>
  );
}
