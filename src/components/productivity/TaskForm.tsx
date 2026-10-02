import type { FormEvent } from "react";
import { Plus } from "lucide-react";
import { CATEGORIES } from "./types";

type Props = {
  title: string;
  category: string;
  dueDate: string;
  error: string;
  onTitleChange: (v: string) => void;
  onCategoryChange: (v: string) => void;
  onDueDateChange: (v: string) => void;
  onSubmit: () => void;
};

const field =
  "h-12 w-full rounded-xl border border-input bg-background px-4 text-base text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function TaskForm({
  title,
  category,
  dueDate,
  error,
  onTitleChange,
  onCategoryChange,
  onDueDateChange,
  onSubmit,
}: Props) {
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <section
      aria-labelledby="new-task-heading"
      className="rounded-2xl border bg-card p-4 shadow-card sm:p-6"
    >
      <h2 id="new-task-heading" className="text-lg font-semibold">
        New task
      </h2>
      <form
        onSubmit={handleSubmit}
        noValidate
        className="mt-4 grid gap-3 md:grid-cols-[1fr_180px_180px_auto] md:items-start"
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
        <button
          type="submit"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 font-semibold text-primary-foreground transition hover:opacity-90 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
        >
          <Plus className="h-4 w-4" aria-hidden /> Add Task
        </button>
      </form>
    </section>
  );
}
