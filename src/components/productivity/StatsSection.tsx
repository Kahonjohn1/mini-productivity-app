type CardProps = { label: string; value: number; accent: string };

function StatsCard({ label, value, accent }: CardProps) {
  return (
    <li className="rounded-2xl border bg-card p-3 shadow-card sm:p-4">
      <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground sm:gap-2 sm:text-xs">
        <span className={`h-1.5 w-1.5 rounded-full sm:h-2 sm:w-2 ${accent}`} aria-hidden />
        {label}
      </div>
      <p
        key={value}
        className="mt-1 animate-rise font-display text-2xl font-semibold tabular-nums sm:text-3xl"
      >
        {value}
      </p>
    </li>
  );
}

type Props = { total: number; active: number; completed: number };

export function StatsSection({ total, active, completed }: Props) {
  return (
    <section aria-label="Task statistics">
      <ul className="grid grid-cols-3 gap-2 sm:gap-3">
        <StatsCard label="Total" value={total} accent="bg-primary" />
        <StatsCard label="Active" value={active} accent="bg-destructive" />
        <StatsCard label="Completed" value={completed} accent="bg-success" />
      </ul>
    </section>
  );
}
