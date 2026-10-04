import { CATEGORIES, type Filter } from "./types";

type Option = { value: Filter; label: string };

type Props = {
  filter: Filter;
  counts: Partial<Record<Filter, number>>;
  onChange: (f: Filter) => void;
};

const STATUS_OPTIONS: Option[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
];

// Labels match the category names exactly, so they are derived from the shared
// CATEGORIES list rather than restated here.
const CATEGORY_OPTIONS: Option[] = CATEGORIES.map((c) => ({ value: c, label: c }));

// Shared between both tab groups; only the horizontal padding differs (the
// status group also flexes to fill the row on small screens).
const tabBase =
  "flex min-h-9 items-center justify-center gap-1.5 rounded-lg text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:min-h-10 sm:gap-2 sm:text-sm sm:flex-none";

const tabState = (active: boolean) =>
  active ? "bg-card text-foreground shadow-card" : "text-muted-foreground hover:text-foreground";

function TabButton({
  option,
  active,
  count,
  layout,
  onChange,
}: {
  option: Option;
  active: boolean;
  count: number;
  layout: string;
  onChange: (f: Filter) => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={() => onChange(option.value)}
      className={`${tabBase} ${layout} ${tabState(active)}`}
    >
      {option.label}
      <span className="tabular-nums text-xs text-muted-foreground">{count}</span>
    </button>
  );
}

export function FilterTabs({ filter, counts, onChange }: Props) {
  return (
    <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-2">
      <div
        role="group"
        aria-label="Filter tasks by status"
        className="inline-flex w-full rounded-xl border bg-secondary p-1 sm:w-auto"
      >
        {STATUS_OPTIONS.map((o) => (
          <TabButton
            key={o.value}
            option={o}
            active={filter === o.value}
            count={counts[o.value] ?? 0}
            layout="flex-1 px-3 sm:px-4"
            onChange={onChange}
          />
        ))}
      </div>
      <div
        role="group"
        aria-label="Filter tasks by category"
        className="inline-flex w-full flex-wrap rounded-xl border bg-secondary p-1 sm:w-auto"
      >
        {CATEGORY_OPTIONS.map((o) => (
          <TabButton
            key={o.value}
            option={o}
            active={filter === o.value}
            count={counts[o.value] ?? 0}
            layout="px-2.5 sm:px-3"
            onChange={onChange}
          />
        ))}
      </div>
    </div>
  );
}
