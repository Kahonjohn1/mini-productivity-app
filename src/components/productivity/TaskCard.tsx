import { CalendarDays, Check, Trash2 } from "lucide-react";
import { type Task, isCompleted, progressColor } from "./types";

type Props = {
  task: Task;
  onChangeProgress: (id: string, delta: number) => void;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
};

const btn =
  "inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg border px-3.5 text-sm font-semibold transition active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function TaskCard({ task, onChangeProgress, onComplete, onDelete }: Props) {
  const done = isCompleted(task);
  const { progress } = task;
  const labelId = `task-${task.id}-title`;

  return (
    <li className="animate-rise rounded-2xl border bg-card p-3 shadow-card transition-colors sm:p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3
            id={labelId}
            className={`break-words text-base font-semibold sm:text-lg ${done ? "text-muted-foreground line-through decoration-1" : ""}`}
          >
            {task.title}
          </h3>
          <div className="mt-1 flex flex-wrap items-center gap-1.5 sm:mt-1.5 sm:gap-2">
            <span className="inline-block rounded-full bg-accent px-2 py-0.5 text-[11px] font-medium text-accent-foreground sm:px-2.5 sm:text-xs">
              {task.category}
            </span>
            {task.dueDate && (
              <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-secondary-foreground sm:px-2.5 sm:text-xs">
                <CalendarDays className="h-3 w-3" aria-hidden />
                Due{" "}
                {new Date(`${task.dueDate}T00:00:00`).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={() => onDelete(task.id)}
          aria-label={`Delete task: ${task.title}`}
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-secondary hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Trash2 className="h-4 w-4" aria-hidden />
        </button>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <div
          role="progressbar"
          aria-labelledby={labelId}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
          aria-valuetext={`${progress}%${done ? ", completed" : ""}`}
          className="h-2 flex-1 overflow-hidden rounded-full bg-track sm:h-2.5"
        >
          <div
            className="progress-fill h-full rounded-full"
            style={{ width: `${progress}%`, ["--fill-end" as string]: progressColor(progress) }}
          />
        </div>
        <span
          className="flex w-16 items-center justify-end gap-1 font-display text-sm font-semibold tabular-nums"
          aria-hidden
        >
          <span key={progress} className="animate-rise">
            {progress}%
          </span>
          {done && <Check className="h-4 w-4 text-success" />}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5 sm:mt-4 sm:gap-2">
        {progress > 0 && (
          <button
            type="button"
            className={`${btn.replace("min-h-11", "min-h-9 sm:min-h-11")} bg-background hover:bg-secondary`}
            onClick={() => onChangeProgress(task.id, -10)}
            aria-label={`Decrease progress of ${task.title} by 10%`}
          >
            −10%
          </button>
        )}
        {!done ? (
          <>
            <button
              type="button"
              className={`${btn.replace("min-h-11", "min-h-9 sm:min-h-11")} bg-background hover:bg-secondary`}
              onClick={() => onChangeProgress(task.id, 10)}
              aria-label={`Increase progress of ${task.title} by 10%`}
            >
              +10%
            </button>
            <button
              type="button"
              className={`${btn.replace("min-h-11", "min-h-9 sm:min-h-11")} bg-background hover:bg-secondary`}
              onClick={() => onChangeProgress(task.id, 25)}
              aria-label={`Increase progress of ${task.title} by 25%`}
            >
              +25%
            </button>
            <button
              type="button"
              className={`${btn.replace("min-h-11", "min-h-9 sm:min-h-11")} border-transparent bg-primary text-primary-foreground hover:opacity-90`}
              onClick={() => onComplete(task.id)}
              aria-label={`Mark ${task.title} as complete`}
            >
              <Check className="h-4 w-4" aria-hidden /> Complete
            </button>
          </>
        ) : (
          <span className="animate-rise inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-success/15 px-3 text-sm font-semibold text-success sm:min-h-11 sm:px-3.5">
            <Check className="h-4 w-4" aria-hidden /> Completed
          </span>
        )}
      </div>
    </li>
  );
}
