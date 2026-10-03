import { Check, RotateCcw } from "lucide-react";
import type { CompletedRecord } from "./types";

function parseDate(iso?: string) {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

function formatGroupKey(iso?: string) {
  const d = parseDate(iso);
  if (!d) return "Unknown";

  const now = new Date();
  if (d.toDateString() === now.toDateString()) return "Today";

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";

  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function formatTime(iso?: string) {
  const d = parseDate(iso);
  if (!d) return null;
  return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

type Props = {
  history: CompletedRecord[];
  onReopen: (recordId: string) => void;
};

export function CompletedHistory({ history, onReopen }: Props) {
  // Newest completion first. History is already completed by definition, so
  // there is no progress filtering here.
  const completed = [...history].sort((a, b) => {
    const aTime = a.completedAt ? new Date(a.completedAt).getTime() : 0;
    const bTime = b.completedAt ? new Date(b.completedAt).getTime() : 0;
    return bTime - aTime;
  });

  if (completed.length === 0) {
    return null;
  }

  const groups = new Map<string, CompletedRecord[]>();
  for (const r of completed) {
    const key = formatGroupKey(r.completedAt);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(r);
  }

  const orderedKeys = Array.from(groups.keys()).sort((a, b) => {
    if (a === "Today") return -1;
    if (b === "Today") return 1;
    if (a === "Yesterday") return -1;
    if (b === "Yesterday") return 1;
    return 0;
  });

  return (
    <section aria-labelledby="completed-heading" className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 id="completed-heading" className="text-base font-semibold sm:text-lg">
          Completed History
        </h2>
      </div>
      <div className="space-y-3">
        {orderedKeys.map((key) => (
          <div key={key} className="rounded-2xl border bg-card">
            <div className="border-b px-3 py-2 text-xs font-medium uppercase tracking-wider text-muted-foreground sm:px-4">
              {key}
            </div>
            <ul className="divide-y">
              {groups.get(key)!.map((r) => (
                <li
                  key={r.id}
                  className="flex items-center justify-between gap-2 px-3 py-2 sm:px-4 sm:py-3"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <Check className="h-4 w-4 shrink-0 text-success" aria-hidden />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium sm:text-base">{r.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {r.category} · 100%
                        {formatTime(r.completedAt) && (
                          <span className="ml-1">· {formatTime(r.completedAt)}</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onReopen(r.id)}
                    aria-label={`Reopen ${r.title}`}
                    className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-semibold transition hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:min-h-10 sm:px-3 sm:text-sm"
                  >
                    <RotateCcw className="h-3.5 w-3.5" aria-hidden />
                    Reopen
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
