import { Moon, Sun } from "lucide-react";
import { Clock } from "./Clock";

type Props = { dark: boolean; onToggle: () => void };

export function Header({ dark, onToggle }: Props) {
  return (
    <header className="flex items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Mini Productivity</h1>
        <p className="mt-1 text-sm text-muted-foreground sm:text-base">
          Stay organized. Get things done.
        </p>
        <div className="mt-3">
          <Clock />
        </div>
      </div>
      <button
        type="button"
        onClick={onToggle}
        aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
        aria-pressed={dark}
        className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border bg-card text-foreground shadow-card transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {dark ? <Sun className="h-5 w-5" aria-hidden /> : <Moon className="h-5 w-5" aria-hidden />}
      </button>
    </header>
  );
}
