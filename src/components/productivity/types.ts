export type Task = {
  id: string;
  title: string;
  category: string;
  progress: number;
  dueDate?: string; // ISO date string (yyyy-mm-dd)
  dueTime?: string; // time string (e.g. HH:MM)
  completedAt?: string; // ISO timestamp when completed
};

/**
 * An immutable snapshot of a task at the moment it reached 100%.
 * `id` uniquely identifies the completion event (so the same task can appear
 * in history more than once across reopen/recomplete cycles), while `taskId`
 * points back to the original task.
 */
export type CompletedRecord = {
  id: string;
  taskId: string;
  title: string;
  category: string;
  progress: number;
  dueDate?: string;
  dueTime?: string;
  completedAt: string;
};

export type StatusFilter = "all" | "active" | "completed";

/**
 * Single source of truth for the category list.
 *
 * Declared `as const` so `Category` (and therefore `Filter`) can be derived from
 * it instead of repeating the names in a union.
 */
export const CATEGORIES = ["Personal", "Work", "Study", "Shopping", "Other"] as const;

export type Category = (typeof CATEGORIES)[number];

export type Filter = StatusFilter | Category;

/** Narrows an arbitrary value to one of the known category names. */
export const isCategory = (value: unknown): value is Category =>
  typeof value === "string" && (CATEGORIES as readonly string[]).includes(value);

export const clamp = (value: number) => Math.min(100, Math.max(0, value));
export const isCompleted = (task: Task) => task.progress === 100;

// Red (hue 27) -> amber (hue 70) -> green (hue 150), interpolated smoothly.
export const progressColor = (progress: number) => {
  const hue = 27 + (150 - 27) * (progress / 100);
  return `oklch(0.66 0.18 ${hue})`;
};
