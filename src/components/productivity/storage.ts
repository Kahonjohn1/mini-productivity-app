import { type Task, CATEGORIES, clamp } from "./types";

const STORAGE_KEY = "mini-productivity:tasks:v1";

const isValidDateString = (value: unknown): value is string => {
  if (typeof value !== "string") return false;
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
};

const isValidTimeString = (value: unknown): value is string => {
  if (typeof value !== "string") return false;
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(value);
};

const isValidCategory = (value: unknown): value is string => {
  if (typeof value !== "string") return false;
  return CATEGORIES.includes(value);
};

export const loadTasks = (): Task[] => {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((t): t is Record<string, unknown> => !!t && typeof t === "object")
      .map((t) => {
        const record = t as Record<string, unknown>;
        const task: Task = {
          id: typeof record["id"] === "string" ? (record["id"] as string) : "",
          title: typeof record["title"] === "string" ? (record["title"] as string) : "",
          category: isValidCategory(record["category"])
            ? (record["category"] as string)
            : "Personal",
          progress:
            typeof record["progress"] === "number" ? clamp(record["progress"] as number) : 0,
        };
        if (isValidDateString(record["dueDate"])) {
          task.dueDate = record["dueDate"] as string;
        }
        if (isValidTimeString(record["dueTime"])) {
          task.dueTime = record["dueTime"] as string;
        }
        return task;
      })
      .filter((t) => t.id && t.title);
  } catch {
    return [];
  }
};

export const saveTasks = (tasks: Task[]): void => {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch {
    // ignore storage errors (private mode, quota, etc.)
  }
};
