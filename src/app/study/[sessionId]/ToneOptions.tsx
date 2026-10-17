import { Button } from "@/components/ui";

interface ToneOptionsProps {
  options: string[];
  disabled: boolean;
  onPick: (option: string) => void;
  onSkip: () => void;
}

export default function ToneOptions({ options, disabled, onPick, onSkip }: ToneOptionsProps) {
  return (
    <div className="space-y-3 pt-1">
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            disabled={disabled}
            onClick={() => onPick(option)}
            className="w-full px-4 py-3 rounded-xl border border-border bg-surface text-jade text-base hover:bg-surface-2 transition-colors disabled:opacity-60"
          >
            {option}
          </button>
        ))}
      </div>
      <Button variant="outline" onClick={onSkip} disabled={disabled}>Skip</Button>
    </div>
  );
}
