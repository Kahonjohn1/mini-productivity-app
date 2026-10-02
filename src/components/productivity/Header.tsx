import { Moon, Sun } from "lucide-react";
import { Clock } from "./Clock";

type Props = { dark: boolean; onToggle: () => void };

export function Header({ dark, onToggle }: Props) {
  return (
    <header className="flex items-start justify-between gap-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Mini Productivity</h1>
        <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
          Stay organized. Get things done.
        </p>
        <div className="mt-2">
          <Clock />
        </div>
      </div>
      <button
        type="button"
        onClick={onToggle}
        aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
        aria-pressed={dark}
        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border bg-card text-foreground shadow-card transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:h-10 sm:w-10"
      >
        {dark ? (
          <Sun className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden />
        ) : (
          <Moon className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden />
        )}
      </button>
    </header>
  );
}
