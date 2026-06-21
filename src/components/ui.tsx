import React from "react";

// ─── Card ──────────────────────────────────────────────────────────────────

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** "paper" = plain surface card (default), "elevated" = slightly inset border, "ghost" = transparent */
  variant?: "paper" | "elevated" | "ghost";
  padding?: "sm" | "md" | "lg" | "none";
}

export function Card({
  variant = "paper",
  padding = "md",
  className = "",
  children,
  ...props
}: CardProps) {
  const base = "rounded-2xl transition-colors";

  const variants: Record<string, string> = {
    paper:    "bg-surface border border-border shadow-sm",
    elevated: "bg-surface border border-border shadow-md",
    ghost:    "bg-transparent border border-border",
  };

  const paddings: Record<string, string> = {
    none: "",
    sm:   "p-3",
    md:   "p-5",
    lg:   "p-7",
  };

  return (
    <div
      className={`${base} ${variants[variant]} ${paddings[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

// ─── Button ────────────────────────────────────────────────────────────────

type ButtonVariant = "primary" | "seal" | "ghost" | "outline";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  className = "",
  children,
  disabled,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center font-medium rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-seal focus-visible:ring-offset-1 disabled:opacity-40 disabled:pointer-events-none";

  const variants: Record<ButtonVariant, string> = {
    primary: "bg-jade text-white hover:opacity-90",
    seal:    "bg-seal text-white hover:opacity-90",
    ghost:   "bg-transparent text-ink hover:bg-surface-2",
    outline: "border border-border text-ink hover:bg-surface-2",
  };

  const sizes: Record<ButtonSize, string> = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-5 py-2.5 text-sm",
    lg: "px-7 py-3 text-base",
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <span className="opacity-70">…</span> : children}
    </button>
  );
}

// ─── Badge ─────────────────────────────────────────────────────────────────

type BadgeVariant = "jade" | "seal" | "ochre" | "muted" | "ink";

export function Badge({
  variant = "muted",
  children,
  className = "",
}: {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}) {
  const variants: Record<BadgeVariant, string> = {
    jade:  "bg-jade/10 text-jade dark:bg-jade/20",
    seal:  "bg-seal/10 text-seal dark:bg-seal/20",
    ochre: "bg-ochre/10 text-ochre dark:bg-ochre/20",
    muted: "bg-surface-2 text-muted",
    ink:   "bg-ink text-paper",
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

// ─── ProgressBar ───────────────────────────────────────────────────────────

export function ProgressBar({
  value,
  max = 100,
  color = "jade",
  height = "sm",
  className = "",
}: {
  value: number;
  max?: number;
  color?: "jade" | "seal" | "ochre";
  height?: "xs" | "sm" | "md";
  className?: string;
}) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  const heights: Record<string, string> = { xs: "h-1.5", sm: "h-2", md: "h-3" };

  const colors: Record<string, string> = {
    jade:  "bg-jade",
    seal:  "bg-seal",
    ochre: "bg-ochre",
  };

  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemax={max}
      aria-valuemin={0}
      className={`w-full bg-surface-2 rounded-full overflow-hidden ${heights[height]} ${className}`}
    >
      <div
        className={`h-full ${colors[color]} rounded-full transition-all duration-500`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

// ─── PageHeader ────────────────────────────────────────────────────────────

export function PageHeader({
  eyebrow,
  rubric,
  title,
  actions,
  className = "",
}: {
  eyebrow?: string;
  /** Optional hanzi rubric shown before the eyebrow — the copybook manuscript label */
  rubric?: string;
  title: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex items-start justify-between gap-4 mb-8 ${className}`}>
      <div>
        {eyebrow && (
          <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-faint mb-2">
            {rubric && (
              <span className="hanzi text-sm tracking-normal normal-case text-seal/80">
                {rubric}
              </span>
            )}
            <span>{eyebrow}</span>
          </p>
        )}
        <h1 className="font-display text-3xl font-semibold text-ink leading-tight">
          {title}
        </h1>
      </div>
      {actions && (
        <div className="flex items-center gap-2 mt-1 shrink-0">{actions}</div>
      )}
    </div>
  );
}

// ─── Bento ─────────────────────────────────────────────────────────────────

/**
 * Thin wrapper around CSS grid for bento layouts.
 * Children use `col-span-*` and `row-span-*` as normal.
 */
export function Bento({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`grid gap-4 grid-cols-1 sm:grid-cols-6 lg:grid-cols-12 ${className}`}
    >
      {children}
    </div>
  );
}
