const ICON_PROPS = { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true } as const;

export function SpeakerIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M11 5 6 9H3v6h3l5 4V5z" />
      <path d="M15.5 8.5a5 5 0 0 1 0 7" />
      <path d="M18.5 5.5a9 9 0 0 1 0 13" />
    </svg>
  );
}

export function TurtleIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M4 15a7 6 0 0 1 14 0z" />
      <path d="M8 10.5 11 15M14 10.5 11 15" />
      <path d="M18 15h2.5a1.5 1.5 0 0 0 0-3H18" />
      <path d="M6 15v2.5M15 15v2.5" />
    </svg>
  );
}
