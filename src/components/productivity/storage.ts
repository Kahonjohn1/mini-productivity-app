import { type CompletedRecord, type Task, clamp, isCategory } from "./types";

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

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.length > 0;

/**
 * Shared read path for both collections: guards against SSR, swallows storage
 * and JSON errors, and reduces the stored value to an array of plain objects.
 * Anything unrecognisable yields an empty array rather than throwing.
 */
const readRecords = (key: string): Record<string, unknown>[] => {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((r): r is Record<string, unknown> => !!r && typeof r === "object");
  } catch {
    return [];
  }
};

/** Shared write path; storage errors (private mode, quota) are non-fatal. */
const writeRecords = (key: string, value: unknown[]): void => {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore storage errors (private mode, quota, etc.)
  }
};

export const loadTasks = (): Task[] =>
  readRecords(STORAGE_KEY)
    .map((record) => {
      const task: Task = {
        id: typeof record["id"] === "string" ? record["id"] : "",
        title: typeof record["title"] === "string" ? record["title"] : "",
        category: isCategory(record["category"]) ? record["category"] : "Personal",
        progress: typeof record["progress"] === "number" ? clamp(record["progress"]) : 0,
      };
      if (isValidDateString(record["dueDate"])) {
        task.dueDate = record["dueDate"];
      }
      if (isValidTimeString(record["dueTime"])) {
        task.dueTime = record["dueTime"];
      }
      if (typeof record["completedAt"] === "string") {
        task.completedAt = record["completedAt"];
      }
      return task;
    })
    .filter((t) => t.id && t.title);

export const saveTasks = (tasks: Task[]): void => writeRecords(STORAGE_KEY, tasks);

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

export const loadHistory = (): CompletedRecord[] =>
  readRecords(HISTORY_KEY)
    .map((record) => {
      const entry: CompletedRecord = {
        id: isNonEmptyString(record["id"]) ? record["id"] : "",
        taskId: isNonEmptyString(record["taskId"]) ? record["taskId"] : "",
        title: typeof record["title"] === "string" ? record["title"] : "",
        category: isCategory(record["category"]) ? record["category"] : "Personal",
        progress: 100,
        completedAt: isNonEmptyString(record["completedAt"]) ? record["completedAt"] : "",
      };
      if (isValidDateString(record["dueDate"])) {
        entry.dueDate = record["dueDate"];
      }
      if (isValidTimeString(record["dueTime"])) {
        entry.dueTime = record["dueTime"];
      }
      return entry;
    })
    // A record needs a unique id, an originating task, a title and a completion
    // timestamp to be meaningful; anything else is dropped.
    .filter((r) => r.id && r.taskId && r.title && r.completedAt);

export const saveHistory = (history: CompletedRecord[]): void => writeRecords(HISTORY_KEY, history);
