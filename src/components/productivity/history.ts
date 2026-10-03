import type { CompletedRecord, Task } from "./types";

export const newId = () =>
  globalThis.crypto?.randomUUID?.() ??
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

/**
 * Copies a task into a history record.
 *
 * The copy is deliberate: later edits to the active task must never mutate a
 * completed record. Each completion event gets its own `id`, so the same task
 * can legitimately appear in history more than once across reopen/recomplete
 * cycles, while `taskId` keeps a link back to the original task.
 */
export const toCompletedRecord = (task: Task, completedAt: string): CompletedRecord => ({
  id: newId(),
  taskId: task.id,
  title: task.title,
  category: task.category,
  progress: 100,
  ...(task.dueDate ? { dueDate: task.dueDate } : {}),
  ...(task.dueTime ? { dueTime: task.dueTime } : {}),
  completedAt,
});

/**
 * Converts a history record back into an active task for reopening.
 *
 * Identity and scheduling are preserved, progress resets to 0, and no
 * `completedAt` is carried over — the task is active work again.
 */
export const toReopenedTask = (record: CompletedRecord): Task => ({
  id: record.taskId,
  title: record.title,
  category: record.category,
  progress: 0,
  ...(record.dueDate ? { dueDate: record.dueDate } : {}),
  ...(record.dueTime ? { dueTime: record.dueTime } : {}),
});
