"use client";

interface SealProps {
  size?: number;
  className?: string;
  /** When true, plays the stamp animation */
  stamp?: boolean;
}

/** The cinnabar chop logo — 汉 in a rounded square seal shape. */
export default function Seal({ size = 36, className = "", stamp = false }: SealProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="汉字 seal logo"
      className={`${stamp ? "animate-seal-stamp" : ""} ${className}`}
    >
      {/* Rounded square background — cinnabar */}
      <rect x="1" y="1" width="34" height="34" rx="7" fill="var(--seal)" />
      {/* Inner hairline border for carved-seal effect */}
      <rect x="2.5" y="2.5" width="31" height="31" rx="5.5" stroke="rgba(255,255,255,0.25)" strokeWidth="1" fill="none" />
      {/* 汉 character in white */}
      <text
        x="18"
        y="25"
        textAnchor="middle"
        fontSize="20"
        fontFamily="var(--font-noto-serif-sc), 'PingFang SC', serif"
        fontWeight="700"
        fill="white"
        letterSpacing="-0.5"
      >
        汉
      </text>
    </svg>
  );
}
