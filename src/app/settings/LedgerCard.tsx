import React from "react";

function Spine({ hanzi, label }: { hanzi: string; label: string }) {
  return (
    <div className="w-10 flex-shrink-0 border-r border-border bg-surface-2/50 flex flex-col items-center py-6">
      <span className="hanzi v-rl text-seal/25 text-2xl font-bold select-none leading-none">{hanzi}</span>
      <span className="v-rl text-faint text-[10px] font-mono mt-auto tracking-widest">{label}</span>
    </div>
  );
}

export default function LedgerCard({
  hanzi,
  label,
  className = "",
  children,
}: {
  hanzi: string;
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={`flex rounded-2xl border border-border shadow-sm bg-surface overflow-hidden ${className}`}>
      <Spine hanzi={hanzi} label={label} />
      <div className="flex-1 min-w-0">{children}</div>
    </section>
  );
}

export function LedgerHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-5 py-3 border-b border-border">
      <p className="text-[10px] font-mono uppercase tracking-widest text-faint">{children}</p>
    </div>
  );
}
