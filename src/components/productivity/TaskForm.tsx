import type { FormEvent } from "react";
import { Plus } from "lucide-react";
import { CATEGORIES } from "./types";

type Props = {
  title: string;
  category: string;
  dueDate: string;
  dueTime: string;
  error: string;
  onTitleChange: (v: string) => void;
  onCategoryChange: (v: string) => void;
  onDueDateChange: (v: string) => void;
  onDueTimeChange: (v: string) => void;
  onSubmit: () => void;
};

const field =
  "h-10 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:h-11 sm:text-base sm:px-4";

export function TaskForm({
  title,
  category,
  dueDate,
  dueTime,
  error,
  onTitleChange,
  onCategoryChange,
  onDueDateChange,
  onDueTimeChange,
  onSubmit,
}: Props) {
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <section
      aria-labelledby="new-task-heading"
      className="rounded-2xl border bg-card p-3 shadow-card sm:p-5"
    >
      <h2 id="new-task-heading" className="text-base font-semibold sm:text-lg">
        New task
      </h2>
      <form
        onSubmit={handleSubmit}
        noValidate
        className="mt-3 grid gap-2 md:grid-cols-[1fr_160px_140px_140px_auto] md:items-start"
      >
        <div>
          <label htmlFor="task-title" className="sr-only">
            Task title
          </label>
          <input
            id="task-title"
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="What needs to be done?"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? "task-title-error" : undefined}
            className={`${field} ${error ? "border-destructive" : ""} placeholder:text-muted-foreground`}
          />
          {error && (
            <p
              id="task-title-error"
              role="alert"
              className="mt-2 text-sm font-medium text-destructive"
            >
              {error}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="task-category" className="sr-only">
            Category
          </label>
          <select
            id="task-category"
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            className={field}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="task-due-date" className="sr-only">
            Due date (optional)
          </label>
          <input
            id="task-due-date"
            type="date"
            value={dueDate}
            onChange={(e) => onDueDateChange(e.target.value)}
            className={`${field} text-muted-foreground`}
          />
        </div>
        <div>
          <label htmlFor="task-due-time" className="sr-only">
            Due time (optional)
          </label>
          <input
            id="task-due-time"
            type="time"
            value={dueTime}
            onChange={(e) => onDueTimeChange(e.target.value)}
            className={`${field} text-muted-foreground`}
          />
        </div>
        <button
          type="submit"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card sm:h-11 sm:px-6 sm:text-base"
        >
          <Plus className="h-4 w-4" aria-hidden /> Add Task
        </button>
      </form>
    </section>
  );
}
