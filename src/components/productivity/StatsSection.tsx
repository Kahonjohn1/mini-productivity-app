type CardProps = { label: string; value: number; accent: string };

function StatsCard({ label, value, accent }: CardProps) {
  return (
    <li className="rounded-2xl border bg-card p-4 shadow-card sm:p-5">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        <span className={`h-2 w-2 rounded-full ${accent}`} aria-hidden />
        {label}
      </div>
      <p
        key={value}
        className="mt-2 animate-rise font-display text-3xl font-semibold tabular-nums sm:text-4xl"
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
      <ul className="grid grid-cols-3 gap-2 sm:gap-4">
        <StatsCard label="Total" value={total} accent="bg-primary" />
        <StatsCard label="Active" value={active} accent="bg-destructive" />
        <StatsCard label="Completed" value={completed} accent="bg-success" />
      </ul>
    </section>
  );
}
