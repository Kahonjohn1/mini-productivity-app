import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { CompletedHistory } from "@/components/productivity/CompletedHistory";
import { toCompletedRecord, toReopenedTask } from "@/components/productivity/history";
import { loadHistory, loadTasks, saveHistory, saveTasks } from "@/components/productivity/storage";
import type { CompletedRecord, Task } from "@/components/productivity/types";

const TASKS_KEY = "mini-productivity:tasks:v1";
const HISTORY_KEY = "mini-productivity:history:v1";

const task = (over: Partial<Task> = {}): Task => ({
  id: "x",
  title: "Task",
  category: "Work",
  progress: 0,
  ...over,
});

const record = (over: Partial<CompletedRecord> = {}): CompletedRecord => ({
  id: "rec-1",
  taskId: "1",
  title: "Build portfolio",
  category: "Work",
  progress: 100,
  completedAt: new Date().toISOString(),
  ...over,
});

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  window.localStorage.clear();
});

describe("CompletedHistory", () => {
  it("renders nothing when history is empty", () => {
    const { container } = render(
      <CompletedHistory history={[]} onReopen={() => {}} onDelete={() => {}} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("shows a completed record under Today", () => {
    render(<CompletedHistory history={[record()]} onReopen={() => {}} onDelete={() => {}} />);
    expect(screen.getByRole("heading", { name: "Completed History" })).toBeInTheDocument();
    expect(screen.getByText("Today")).toBeInTheDocument();
    expect(screen.getByText("Build portfolio")).toBeInTheDocument();
  });

  it("shows category and 100% for a history entry", () => {
    const { container } = render(
      <CompletedHistory
        history={[record({ title: "Read docs", category: "Study" })]}
        onReopen={() => {}}
        onDelete={() => {}}
      />,
    );
    expect(container.textContent).toContain("Study");
    expect(container.textContent).toContain("100%");
  });

  it("groups a record completed yesterday under Yesterday", () => {
    const y = new Date();
    y.setDate(y.getDate() - 1);
    render(
      <CompletedHistory
        history={[record({ title: "Old task", completedAt: y.toISOString() })]}
        onReopen={() => {}}
        onDelete={() => {}}
      />,
    );
    expect(screen.getByText("Yesterday")).toBeInTheDocument();
  });

  it("does not filter history by progress", () => {
    // History is completed by definition; a stray non-100 value still renders.
    const { container } = render(
      <CompletedHistory
        history={[record({ progress: 0 })]}
        onReopen={() => {}}
        onDelete={() => {}}
      />,
    );
    expect(container.textContent).toContain("Build portfolio");
  });

  it("calls onReopen with the record id", () => {
    const onReopen = vi.fn();
    render(
      <CompletedHistory
        history={[record({ id: "rec-42" })]}
        onReopen={onReopen}
        onDelete={() => {}}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Reopen Build portfolio" }));

    expect(onReopen).toHaveBeenCalledWith("rec-42");
  });

  it("renders duplicate tasks under separate records without key collisions", () => {
    const first = new Date();
    first.setDate(first.getDate() - 1);
    render(
      <CompletedHistory
        history={[
          record({ id: "rec-a", completedAt: first.toISOString() }),
          record({ id: "rec-b" }),
        ]}
        onReopen={() => {}}
        onDelete={() => {}}
      />,
    );
    expect(screen.getAllByText("Build portfolio")).toHaveLength(2);
    expect(screen.getAllByRole("button", { name: /Reopen/ })).toHaveLength(2);
  });
});

describe("CompletedHistory delete action", () => {
  it("calls onDelete with the record id", () => {
    const onDelete = vi.fn();
    render(
      <CompletedHistory
        history={[record({ id: "rec-7", title: "Build portfolio" })]}
        onReopen={() => {}}
        onDelete={onDelete}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Delete from history: Build portfolio" }));

    expect(onDelete).toHaveBeenCalledWith("rec-7");
  });

  it("exposes an accessible label including the task title", () => {
    render(
      <CompletedHistory
        history={[record({ title: "Read documentation" })]}
        onReopen={() => {}}
        onDelete={() => {}}
      />,
    );

    expect(
      screen.getByRole("button", { name: "Delete from history: Read documentation" }),
    ).toBeInTheDocument();
  });

  it("deletes only the targeted record", () => {
    const onDelete = vi.fn();
    render(
      <CompletedHistory
        history={[
          record({ id: "rec-a", title: "Keep me" }),
          record({ id: "rec-b", title: "Drop me" }),
        ]}
        onReopen={() => {}}
        onDelete={onDelete}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Delete from history: Drop me" }));

    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledWith("rec-b");
  });

  it("does not invoke onReopen when Delete is used", () => {
    const onReopen = vi.fn();
    const onDelete = vi.fn();
    render(<CompletedHistory history={[record()]} onReopen={onReopen} onDelete={onDelete} />);

    fireEvent.click(screen.getByRole("button", { name: "Delete from history: Build portfolio" }));

    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onReopen).not.toHaveBeenCalled();
  });

  it("does not invoke onDelete when Reopen is used", () => {
    const onReopen = vi.fn();
    const onDelete = vi.fn();
    render(<CompletedHistory history={[record()]} onReopen={onReopen} onDelete={onDelete} />);

    fireEvent.click(screen.getByRole("button", { name: "Reopen Build portfolio" }));

    expect(onReopen).toHaveBeenCalledTimes(1);
    expect(onDelete).not.toHaveBeenCalled();
  });

  it("renders one delete control per record", () => {
    render(
      <CompletedHistory
        history={[record({ id: "rec-a" }), record({ id: "rec-b" })]}
        onReopen={() => {}}
        onDelete={() => {}}
      />,
    );

    expect(screen.getAllByRole("button", { name: /Delete from history/ })).toHaveLength(2);
  });
});

describe("deleting a history record", () => {
  // Mirrors deleteHistoryRecord: filters history[] only.
  const deleteRecord = (history: CompletedRecord[], recordId: string) =>
    history.filter((r) => r.id !== recordId);

  it("removes the record permanently", () => {
    const history = [record({ id: "rec-1" })];
    expect(deleteRecord(history, "rec-1")).toHaveLength(0);
  });

  it("leaves other history records untouched", () => {
    const history = [record({ id: "rec-a" }), record({ id: "rec-b" })];
    const after = deleteRecord(history, "rec-a");

    expect(after).toHaveLength(1);
    expect(after[0]?.id).toBe("rec-b");
  });

  it("does not recreate the record from active tasks after a reload", () => {
    // tasks[] holds active work only, so there is no row that could restore it.
    saveHistory([record({ id: "rec-1", taskId: "1" })]);
    saveTasks([task({ id: "2", title: "Unrelated active" })]);

    saveHistory(deleteRecord(loadHistory(), "rec-1"));

    expect(loadHistory()).toEqual([]);
    // The unrelated active task is untouched.
    expect(loadTasks().map((t) => t.id)).toEqual(["2"]);
  });

  it("stays deleted after a reload", () => {
    saveHistory([record({ id: "rec-1" }), record({ id: "rec-2" })]);
    saveHistory(deleteRecord(loadHistory(), "rec-1"));

    // Simulate refresh by reading back from storage.
    expect(loadHistory().map((r) => r.id)).toEqual(["rec-2"]);
  });

  it("does not affect tasks when no tasks are stored", () => {
    saveHistory([record({ id: "rec-1" })]);
    saveTasks([]);

    saveHistory(deleteRecord(loadHistory(), "rec-1"));

    expect(loadHistory()).toEqual([]);
    expect(loadTasks()).toEqual([]);
  });

  it("reopening after a sibling delete still works", () => {
    saveHistory([
      record({ id: "rec-1", taskId: "1", title: "Keep" }),
      record({ id: "rec-2", taskId: "2", title: "Drop" }),
    ]);
    saveTasks([]);

    const target = loadHistory().find((r) => r.id === "rec-2")!;
    saveHistory(deleteRecord(loadHistory(), "rec-2"));
    saveTasks([toReopenedTask(target)]);

    expect(loadHistory().map((r) => r.id)).toEqual(["rec-1"]);
    expect(loadTasks()[0]?.id).toBe("2");
    expect(loadTasks()[0]?.progress).toBe(0);
  });

  it("completed count drops after a delete", () => {
    saveHistory([record({ id: "rec-1" }), record({ id: "rec-2" })]);
    expect(loadHistory().length).toBe(2);

    saveHistory(deleteRecord(loadHistory(), "rec-1"));

    expect(loadHistory().length).toBe(1);
  });
});

describe("task storage persistence", () => {
  it("persists completedAt through save/load", () => {
    saveTasks([
      task({
        id: "1",
        title: "Build portfolio",
        progress: 100,
        completedAt: "2026-01-02T10:00:00.000Z",
      }),
    ]);
    const loaded = loadTasks();
    expect(loaded).toHaveLength(1);
    expect(loaded[0]?.completedAt).toBe("2026-01-02T10:00:00.000Z");
    expect(loaded[0]?.progress).toBe(100);
  });

  it("preserves id, title, category, progress, dueDate and dueTime", () => {
    saveTasks([
      task({
        id: "keep",
        title: "Keep me",
        category: "Shopping",
        progress: 40,
        dueDate: "2026-03-04",
        dueTime: "13:45",
      }),
    ]);
    expect(loadTasks()[0]).toEqual({
      id: "keep",
      title: "Keep me",
      category: "Shopping",
      progress: 40,
      dueDate: "2026-03-04",
      dueTime: "13:45",
    });
  });

  it("restores saved tasks instead of falling back to defaults", () => {
    saveTasks([task({ id: "keep", title: "Kept" })]);
    expect(loadTasks().map((t) => t.id)).toEqual(["keep"]);
  });

  it("keeps a deleted task out of storage", () => {
    saveTasks([task({ id: "a", title: "A" }), task({ id: "b", title: "B" })]);
    saveTasks(loadTasks().filter((t) => t.id !== "a"));
    expect(loadTasks().map((t) => t.id)).toEqual(["b"]);
  });

  it("falls back to an empty list on corrupt storage", () => {
    window.localStorage.setItem(TASKS_KEY, "{not json");
    expect(loadTasks()).toEqual([]);
  });

  it("drops malformed entries", () => {
    window.localStorage.setItem(
      TASKS_KEY,
      JSON.stringify([{ title: "no id" }, { id: "ok", title: "Fine", progress: 999 }]),
    );
    const loaded = loadTasks();
    expect(loaded).toHaveLength(1);
    expect(loaded[0]?.id).toBe("ok");
    expect(loaded[0]?.progress).toBe(100);
  });
});

describe("history storage persistence", () => {
  it("uses a separate storage key from tasks", () => {
    saveHistory([record()]);
    saveTasks([task({ id: "active" })]);

    expect(window.localStorage.getItem(HISTORY_KEY)).not.toBeNull();
    expect(loadHistory()).toHaveLength(1);
    expect(loadTasks().map((t) => t.id)).toEqual(["active"]);
  });

  it("persists all completion fields across a reload", () => {
    saveHistory([
      record({
        id: "rec-1",
        taskId: "task-9",
        title: "Build portfolio",
        category: "Work",
        dueDate: "2026-03-04",
        dueTime: "13:45",
        completedAt: "2026-03-04T13:45:00.000Z",
      }),
    ]);

    const loaded = loadHistory();
    expect(loaded).toEqual([
      {
        id: "rec-1",
        taskId: "task-9",
        title: "Build portfolio",
        category: "Work",
        progress: 100,
        dueDate: "2026-03-04",
        dueTime: "13:45",
        completedAt: "2026-03-04T13:45:00.000Z",
      },
    ]);
  });

  it("returns an empty array for corrupt history", () => {
    window.localStorage.setItem(HISTORY_KEY, "{not json");
    expect(loadHistory()).toEqual([]);
  });

  it("returns an empty array when history is not an array", () => {
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify({ nope: true }));
    expect(loadHistory()).toEqual([]);
  });

  it("ignores records missing required fields", () => {
    window.localStorage.setItem(
      HISTORY_KEY,
      JSON.stringify([
        { id: "a", taskId: "t", title: "No timestamp" },
        { id: "b", title: "No taskId", completedAt: "2026-01-01T00:00:00.000Z" },
        { taskId: "t", title: "No id", completedAt: "2026-01-01T00:00:00.000Z" },
        record({ id: "good" }),
      ]),
    );
    const loaded = loadHistory();
    expect(loaded).toHaveLength(1);
    expect(loaded[0]?.id).toBe("good");
  });

  it("forces stored progress to 100", () => {
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify([record({ progress: 20 })]));
    expect(loadHistory()[0]?.progress).toBe(100);
  });

  it("falls back to Personal for an unknown category", () => {
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify([record({ category: "Nope" })]));
    expect(loadHistory()[0]?.category).toBe("Personal");
  });

  it("keeps history intact when tasks are deleted", () => {
    saveHistory([record({ id: "rec-1", taskId: "1", title: "Build portfolio" })]);
    saveTasks([task({ id: "2", title: "Active work" })]);

    // Deleting the only active task must not touch the history collection.
    saveTasks(loadTasks().filter((t) => t.id !== "2"));

    expect(loadTasks()).toEqual([]);
    expect(loadHistory()).toHaveLength(1);
    expect(loadHistory()[0]?.title).toBe("Build portfolio");
  });

  it("keeps history intact when the task storage is wiped", () => {
    saveHistory([record({ id: "rec-1" })]);
    window.localStorage.removeItem(TASKS_KEY);

    expect(loadTasks()).toEqual([]);
    expect(loadHistory()).toHaveLength(1);
  });
});
