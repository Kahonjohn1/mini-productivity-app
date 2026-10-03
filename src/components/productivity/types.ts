export type Task = {
  id: string;
  title: string;
  category: string;
  progress: number;
  dueDate?: string; // ISO date string (yyyy-mm-dd)
  dueTime?: string; // time string (e.g. HH:MM)
};

export type StatusFilter = "all" | "active" | "completed";
export type Filter = StatusFilter | "Personal" | "Work" | "Study" | "Shopping" | "Other";

export const CATEGORIES = ["Personal", "Work", "Study", "Shopping", "Other"];

export const clamp = (value: number) => Math.min(100, Math.max(0, value));
export const isCompleted = (task: Task) => task.progress === 100;

// Red (hue 27) -> amber (hue 70) -> green (hue 150), interpolated smoothly.
export const progressColor = (progress: number) => {
  const hue = 27 + (150 - 27) * (progress / 100);
  return `oklch(0.66 0.18 ${hue})`;
};
