import type { Filter } from "./types";

type Props = {
  filter: Filter;
  counts: Partial<Record<Filter, number>>;
  onChange: (f: Filter) => void;
};

const STATUS_OPTIONS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
];

const CATEGORY_OPTIONS: { value: Filter; label: string }[] = [
  { value: "Personal", label: "Personal" },
  { value: "Work", label: "Work" },
  { value: "Study", label: "Study" },
  { value: "Shopping", label: "Shopping" },
  { value: "Other", label: "Other" },
];

export function FilterTabs({ filter, counts, onChange }: Props) {
  return (
    <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-2">
      <div
        role="group"
        aria-label="Filter tasks by status"
        className="inline-flex w-full rounded-xl border bg-secondary p-1 sm:w-auto"
      >
        {STATUS_OPTIONS.map((o) => {
          const active = filter === o.value;
          return (
            <button
              key={o.value}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(o.value)}
              className={`flex min-h-9 flex-1 items-center justify-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:min-h-10 sm:gap-2 sm:px-4 sm:text-sm sm:flex-none ${
                active
                  ? "bg-card text-foreground shadow-card"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {o.label}
              <span className="tabular-nums text-xs text-muted-foreground">
                {counts[o.value] ?? 0}
              </span>
            </button>
          );
        })}
      </div>
      <div
        role="group"
        aria-label="Filter tasks by category"
        className="inline-flex w-full flex-wrap rounded-xl border bg-secondary p-1 sm:w-auto"
      >
        {CATEGORY_OPTIONS.map((o) => {
          const active = filter === o.value;
          return (
            <button
              key={o.value}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(o.value)}
              className={`flex min-h-9 items-center justify-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:min-h-10 sm:gap-2 sm:px-3 sm:text-sm sm:flex-none ${
                active
                  ? "bg-card text-foreground shadow-card"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {o.label}
              <span className="tabular-nums text-xs text-muted-foreground">
                {counts[o.value] ?? 0}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
