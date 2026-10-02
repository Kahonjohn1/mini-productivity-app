import { useEffect, useState } from "react";
import { CalendarDays, Clock3 } from "lucide-react";

export function Clock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const date = now.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const time = now.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <div
      className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground"
      aria-live="off"
    >
      <span className="inline-flex items-center gap-1.5">
        <CalendarDays className="h-4 w-4" aria-hidden />
        <span suppressHydrationWarning>{date}</span>
      </span>
      <span className="inline-flex items-center gap-1.5 font-display font-semibold tabular-nums text-foreground">
        <Clock3 className="h-4 w-4 text-muted-foreground" aria-hidden />
        <span suppressHydrationWarning>{time}</span>
      </span>
    </div>
  );
}
