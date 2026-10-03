import { type CompletedRecord, type Task, CATEGORIES, clamp } from "./types";

const STORAGE_KEY = "mini-productivity:tasks:v1";
const HISTORY_KEY = "mini-productivity:history:v1";

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
        if (typeof record["completedAt"] === "string") {
          task.completedAt = record["completedAt"];
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

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.length > 0;

/**
 * True once tasks have been persisted at least once.
 *
 * Distinguishes "this user has never saved anything" (seed the demo tasks) from
 * "this user saved tasks and has since completed or deleted them all" (must not
 * be re-seeded).
 */
export const hasStoredTasks = (): boolean => {
  if (typeof window === "undefined") {
    return false;
  }
  try {
    return window.localStorage.getItem(STORAGE_KEY) !== null;
  } catch {
    return false;
  }
};

export const loadHistory = (): CompletedRecord[] => {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return (
      parsed
        .filter((r): r is Record<string, unknown> => !!r && typeof r === "object")
        .map((r) => {
          const record = r as Record<string, unknown>;
          const entry: CompletedRecord = {
            id: isNonEmptyString(record["id"]) ? record["id"] : "",
            taskId: isNonEmptyString(record["taskId"]) ? record["taskId"] : "",
            title: typeof record["title"] === "string" ? (record["title"] as string) : "",
            category: isValidCategory(record["category"])
              ? (record["category"] as string)
              : "Personal",
            progress: 100,
            completedAt: isNonEmptyString(record["completedAt"]) ? record["completedAt"] : "",
          };
          if (isValidDateString(record["dueDate"])) {
            entry.dueDate = record["dueDate"] as string;
          }
          if (isValidTimeString(record["dueTime"])) {
            entry.dueTime = record["dueTime"] as string;
          }
          return entry;
        })
        // A record needs a unique id, an originating task, a title and a completion
        // timestamp to be meaningful; anything else is dropped.
        .filter((r) => r.id && r.taskId && r.title && r.completedAt)
    );
  } catch {
    return [];
  }
};

export const saveHistory = (history: CompletedRecord[]): void => {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {
    // ignore storage errors (private mode, quota, etc.)
  }
};
