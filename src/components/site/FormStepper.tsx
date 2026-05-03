import { Check } from "lucide-react";

type Props = {
  steps: string[];
  current: number; // 0-indexed
};

export const FormStepper = ({ steps, current }: Props) => (
  <ol className="flex items-center w-full gap-2">
    {steps.map((label, i) => {
      const done = i < current;
      const active = i === current;
      return (
        <li key={label} className="flex-1 flex items-center gap-3">
          <div className="flex items-center gap-3 flex-1">
            <span
              className={`grid h-8 w-8 place-items-center rounded-full text-xs font-display font-bold flex-shrink-0 transition-colors ${
                done
                  ? "bg-secondary text-secondary-foreground"
                  : active
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {done ? <Check className="h-4 w-4" /> : i + 1}
            </span>
            <span
              className={`text-sm font-medium hidden sm:inline ${
                active ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <span className={`h-px flex-1 ${i < current ? "bg-secondary" : "bg-border"}`} />
          )}
        </li>
      );
    })}
  </ol>
);
