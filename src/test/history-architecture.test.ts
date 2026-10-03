import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { toCompletedRecord, toReopenedTask } from "@/components/productivity/history";
import {
  hasStoredTasks,
  loadHistory,
  loadTasks,
  saveHistory,
  saveTasks,
} from "@/components/productivity/storage";
import type { Task } from "@/components/productivity/types";

const task = (over: Partial<Task> = {}): Task => ({
  id: "1",
  title: "Build portfolio",
  category: "Work",
  progress: 90,
  ...over,
});

// Mirrors the route's completion transition: snapshot into history, remove the
// task from the active collection. Keeping it here lets the ordering guarantee
// (snapshot taken before removal) be asserted directly.
const complete = (tasks: Task[], history: ReturnType<typeof toCompletedRecord>[], t: Task) => {
  const snapshot = toCompletedRecord(t, "2026-03-04T10:00:00.000Z");
  return {
    tasks: tasks.filter((x) => x.id !== t.id),
    history: [snapshot, ...history],
  };
};

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  window.localStorage.clear();
});

describe("completion moves a task into history", () => {
  it("removes the task from tasks and adds a snapshot to history", () => {
    const tasks = [task({ progress: 90 })];
    const next = complete(tasks, [], tasks[0]!);

    expect(next.tasks).toHaveLength(0);
    expect(next.history).toHaveLength(1);
    expect(next.history[0]?.title).toBe("Build portfolio");
    expect(next.history[0]?.progress).toBe(100);
    expect(next.history[0]?.completedAt).toBe("2026-03-04T10:00:00.000Z");
  });

  it("preserves scheduling fields on the snapshot", () => {
    const t = task({ dueDate: "2026-03-04", dueTime: "13:45" });
    const snapshot = toCompletedRecord(t, "2026-03-04T10:00:00.000Z");

    expect(snapshot.dueDate).toBe("2026-03-04");
    expect(snapshot.dueTime).toBe("13:45");
  });

  it("omits absent optional fields rather than writing undefined", () => {
    const snapshot = toCompletedRecord(task(), "2026-03-04T10:00:00.000Z");
    expect("dueDate" in snapshot).toBe(false);
    expect("dueTime" in snapshot).toBe(false);
  });

  it("creates a copy, not a reference to the mutable task", () => {
    const t = task();
    const snapshot = toCompletedRecord(t, "2026-03-04T10:00:00.000Z");

    t.title = "Mutated later";
    t.progress = 10;

    expect(snapshot.title).toBe("Build portfolio");
    expect(snapshot.progress).toBe(100);
    expect(snapshot).not.toBe(t);
  });

  it("leaves other active tasks untouched", () => {
    const tasks = [task({ id: "1" }), task({ id: "2", title: "Other" })];
    const next = complete(tasks, [], tasks[0]!);

    expect(next.tasks.map((t) => t.id)).toEqual(["2"]);
  });
});

describe("history record identity", () => {
  it("keeps the originating task id", () => {
    expect(toCompletedRecord(task({ id: "task-9" }), "2026-03-04T10:00:00.000Z").taskId).toBe(
      "task-9",
    );
  });

  it("gives each completion event a unique record id", () => {
    const first = toCompletedRecord(task(), "2026-03-04T10:00:00.000Z");
    const second = toCompletedRecord(task(), "2026-03-05T10:00:00.000Z");

    expect(first.id).not.toBe(second.id);
    expect(first.taskId).toBe(second.taskId);
  });
});

describe("reopening a completed task", () => {
  const record = () =>
    toCompletedRecord(
      task({ id: "task-9", dueDate: "2026-03-04", dueTime: "13:45" }),
      "2026-03-04T10:00:00.000Z",
    );

  it("restores the task at 0% and drops the completion timestamp", () => {
    const reopened = toReopenedTask(record());

    expect(reopened.progress).toBe(0);
    expect(reopened.completedAt).toBeUndefined();
  });

  it("preserves identity and scheduling, and does not generate a new id", () => {
    const reopened = toReopenedTask(record());

    expect(reopened.id).toBe("task-9");
    expect(reopened.title).toBe("Build portfolio");
    expect(reopened.category).toBe("Work");
    expect(reopened.dueDate).toBe("2026-03-04");
    expect(reopened.dueTime).toBe("13:45");
  });

  it("removes the record from history and puts the task back in tasks", () => {
    const history = [record()];
    const reopened = toReopenedTask(history[0]!);

    const nextHistory = history.filter((r) => r.id !== history[0]!.id);
    const nextTasks = [reopened];

    expect(nextHistory).toHaveLength(0);
    expect(nextTasks).toHaveLength(1);
    expect(nextTasks[0]?.progress).toBe(0);
  });
});

describe("reopen then complete again", () => {
  it("produces a fresh record with a new completedAt", () => {
    const first = toCompletedRecord(task({ id: "task-9" }), "2026-03-04T10:00:00.000Z");
    const reopened = toReopenedTask(first);

    const second = toCompletedRecord(reopened, "2026-03-09T18:30:00.000Z");

    expect(second.completedAt).not.toBe(first.completedAt);
    expect(second.id).not.toBe(first.id);
    expect(second.taskId).toBe(first.taskId);
    expect(second.title).toBe(first.title);
  });
});

describe("active tasks and history stay independent", () => {
  it("deleting the only active task leaves history untouched", () => {
    saveHistory([toCompletedRecord(task({ id: "1" }), "2026-03-04T10:00:00.000Z")]);
    saveTasks([task({ id: "2", title: "Active work" })]);

    // deleteTask only ever filters tasks.
    saveTasks(loadTasks().filter((t) => t.id !== "2"));

    expect(loadTasks()).toEqual([]);
    expect(loadHistory()).toHaveLength(1);
    expect(loadHistory()[0]?.title).toBe("Build portfolio");
  });

  it("history survives across a reload with no active tasks", () => {
    const history = [toCompletedRecord(task({ id: "1" }), "2026-03-04T10:00:00.000Z")];
    saveHistory(history);
    saveTasks([]);

    // Simulate a refresh: read both back from storage.
    const reloadedTasks = loadTasks();
    const reloadedHistory = loadHistory();

    expect(reloadedTasks).toEqual([]);
    expect(reloadedHistory).toHaveLength(1);
    expect(reloadedHistory[0]?.completedAt).toBe("2026-03-04T10:00:00.000Z");
  });

  it("a reopened task persists as active with history cleared", () => {
    const history = [toCompletedRecord(task({ id: "task-9" }), "2026-03-04T10:00:00.000Z")];
    saveHistory(history);
    saveTasks([]);

    const reopened = toReopenedTask(loadHistory()[0]!);
    saveTasks([reopened]);
    saveHistory(loadHistory().filter((r) => r.id !== history[0]!.id));

    expect(loadHistory()).toEqual([]);
    expect(loadTasks()[0]?.progress).toBe(0);
    expect(loadTasks()[0]?.completedAt).toBeUndefined();
  });

  it("completed count reflects history length", () => {
    saveHistory([
      toCompletedRecord(task({ id: "1" }), "2026-03-04T10:00:00.000Z"),
      toCompletedRecord(task({ id: "2" }), "2026-03-05T10:00:00.000Z"),
    ]);
    saveTasks([task({ id: "3", progress: 40 })]);

    expect(loadHistory().length).toBe(2);
    expect(loadTasks().length).toBe(1);
  });

  it("counts repeated completions of the same task separately", () => {
    const t = task({ id: "task-9" });
    const first = toCompletedRecord(t, "2026-03-04T10:00:00.000Z");
    const second = toCompletedRecord(toReopenedTask(first), "2026-03-09T18:30:00.000Z");

    saveHistory([first, second]);

    const loaded = loadHistory();
    expect(loaded).toHaveLength(2);
    expect(new Set(loaded.map((r) => r.id)).size).toBe(2);
    expect(loaded.every((r) => r.taskId === "task-9")).toBe(true);
  });
});

describe("seeding demo tasks", () => {
  // Guards a regression: a returning user who completed or deleted every task
  // has an empty active list. That must not be mistaken for "brand new user"
  // and cause the sample tasks to come back.
  it("reports no stored tasks for a first-time visitor", () => {
    expect(hasStoredTasks()).toBe(false);
  });

  it("still reports stored tasks when every task was completed", () => {
    saveHistory([toCompletedRecord(task({ id: "1" }), "2026-03-04T10:00:00.000Z")]);
    saveTasks([]);

    expect(hasStoredTasks()).toBe(true);
    expect(loadTasks()).toEqual([]);
  });

  it("still reports stored tasks when every task was deleted", () => {
    saveTasks([]);
    expect(hasStoredTasks()).toBe(true);
  });

  it("reports stored tasks once anything has been saved", () => {
    saveTasks([task({ id: "1" })]);
    expect(hasStoredTasks()).toBe(true);
  });

  it("an emptied active list stays empty on the next load", () => {
    saveHistory([toCompletedRecord(task({ id: "1" }), "2026-03-04T10:00:00.000Z")]);
    saveTasks([]);

    // Reload: hasStoredTasks() must be true, so INITIAL_TASKS is not re-seeded.
    const shouldSeed = !hasStoredTasks();
    expect(shouldSeed).toBe(false);
    expect(loadTasks()).toEqual([]);
  });
});
