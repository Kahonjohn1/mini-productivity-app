import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Header } from "@/components/productivity/Header";
import { StatsSection } from "@/components/productivity/StatsSection";
import { TaskForm } from "@/components/productivity/TaskForm";
import { FilterTabs } from "@/components/productivity/FilterTabs";
import { TaskList } from "@/components/productivity/TaskList";
import { CompletedHistory } from "@/components/productivity/CompletedHistory";
import {
  CATEGORIES,
  clamp,
  isCategory,
  isCompleted,
  type CompletedRecord,
  type Filter,
  type Task,
} from "@/components/productivity/types";
import {
  hasStoredTasks,
  loadHistory,
  loadTasks,
  saveHistory,
  saveTasks,
} from "@/components/productivity/storage";
import { newId, toCompletedRecord, toReopenedTask } from "@/components/productivity/history";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mini Productivity — Stay organized" },
      {
        name: "description",
        content: "A simple task manager with categories, progress tracking and filters.",
      },
      { property: "og:title", content: "Mini Productivity — Stay organized" },
      {
        property: "og:description",
        content: "A simple task manager with categories, progress tracking and filters.",
      },
    ],
  }),
  component: App,
});

const INITIAL_TASKS: Task[] = [
  { id: "1", title: "Daily walk", category: "Personal", progress: 72 },
  { id: "2", title: "Weekly report", category: "Work", progress: 25 },
  { id: "3", title: "Read textbook", category: "Study", progress: 100 },
];

function App() {
  // Main state
  // `tasks` holds active/in-progress work only. Completed work is moved into
  // `history` as an independent snapshot, so the two never share rows.
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [history, setHistory] = useState<CompletedRecord[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string>("Personal");
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("");
  const [error, setError] = useState("");
  const [dark, setDark] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const storedTasks = loadTasks();
    const storedHistory = loadHistory();

    // A task stored at 100% predates the split between tasks and history, so
    // migrate it into a history record instead of leaving it stranded as active
    // work. Guarded by taskId so repeat visits cannot duplicate the record.
    const seededHistory = [...storedHistory];
    const migrated: CompletedRecord[] = [];
    const remainingTasks = storedTasks.filter((t) => {
      if (!isCompleted(t)) return true;
      if (!t.completedAt || seededHistory.some((r) => r.taskId === t.id)) return false;
      migrated.push(toCompletedRecord(t, t.completedAt));
      return false;
    });

    // Only seed INITIAL_TASKS for a genuinely new user. A returning user whose
    // active list happens to be empty (everything completed or deleted) must not
    // have the sample tasks pushed back at them.
    if (!hasStoredTasks()) {
      for (const t of INITIAL_TASKS) {
        if (isCompleted(t)) {
          migrated.push(toCompletedRecord(t, new Date().toISOString()));
        } else {
          remainingTasks.push(t);
        }
      }
    }

    setTasks(remainingTasks);
    setHistory([...migrated, ...seededHistory]);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) {
      saveTasks(tasks);
    }
  }, [tasks, hydrated]);

  useEffect(() => {
    if (hydrated) {
      saveHistory(history);
    }
  }, [history, hydrated]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  // Derived state
  // tasks[] is active work only, so total and active both describe it, while
  // completed is counted from the independent history collection.
  const activeTasks = tasks.length;
  const totalTasks = activeTasks;
  const completedTasks = history.length;
  // Built from CATEGORIES so adding a category needs no edits here.
  const categoryCounts: Partial<Record<Filter, number>> = Object.fromEntries(
    CATEGORIES.map((c) => [c, tasks.filter((t) => t.category === c).length]),
  );
  // "completed" has no rows left in tasks[]; it surfaces the history section instead.
  const showHistory = filter === "completed";
  const filteredTasks = tasks.filter((t) => {
    if (filter === "all") return true;
    if (filter === "active") return !isCompleted(t);
    if (filter === "completed") return false;
    return t.category === filter;
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Good morning 👋";
    if (hour >= 12 && hour < 17) return "Good afternoon 👋";
    if (hour >= 17 && hour < 21) return "Good evening 👋";
    return "Good night 👋";
  };

  const getTodayString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const today = getTodayString();
  // Today's schedule spans active tasks plus history records that were due
  // today, so a completed task still counts toward the day's total instead of
  // silently vanishing from the summary once it leaves tasks[].
  const todayTasks = tasks.filter((t) => t.dueDate === today);
  const todayHistory = history.filter((r) => r.dueDate === today);
  const todayTotal = todayTasks.length + todayHistory.length;
  const todayCompleted = todayHistory.length;
  const todayPercent = todayTotal === 0 ? 0 : Math.round((todayCompleted / todayTotal) * 100);

  const getEmptyMessage = () => {
    if (totalTasks === 0) {
      return "No tasks yet. Add your first task to get started.";
    }
    if (filter === "completed") {
      return "No completed tasks yet.";
    }
    if (filter === "active") {
      return "You're all caught up.";
    }
    if (isCategory(filter)) {
      return `No tasks in ${filter} yet.`;
    }
    return "No tasks match the current filter.";
  };
  const emptyMessage = getEmptyMessage();

  // Actions
  const addTask = () => {
    const trimmed = title.trim();
    if (!trimmed) {
      setError("Please enter a task title.");
      return;
    }
    setTasks((prev) => [
      {
        id: newId(),
        title: trimmed,
        category,
        progress: 0,
        ...(dueDate ? { dueDate } : {}),
        ...(dueTime ? { dueTime } : {}),
      },
      ...prev,
    ]);
    setTitle("");
    setDueDate("");
    setDueTime("");
    setError("");
  };

  // Moves a task out of tasks[] and into history[] as an independent snapshot.
  // Called only on a genuine <100 -> 100 transition, so a task that is already
  // complete can never produce a duplicate record.
  const archiveTask = (task: Task) => {
    const completedAt = new Date().toISOString();
    setHistory((prev) => [toCompletedRecord(task, completedAt), ...prev]);
    setTasks((prev) => prev.filter((t) => t.id !== task.id));
  };

  const changeProgress = (id: string, delta: number) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    const nextProgress = clamp(task.progress + delta);
    if (nextProgress >= 100 && task.progress < 100) {
      archiveTask(task);
      return;
    }

    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        if (nextProgress < 100 && t.completedAt) {
          const { completedAt, ...rest } = t;
          return { ...rest, progress: nextProgress };
        }
        return { ...t, progress: nextProgress };
      }),
    );
  };

  const completeTask = (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    // Already at 100%: nothing to do, and no second history record.
    if (isCompleted(task)) return;
    archiveTask(task);
  };

  // Reopen pulls a history record back into the active list as a fresh task:
  // same identity and scheduling, progress reset, no completion timestamp.
  const reopenTask = (recordId: string) => {
    const record = history.find((r) => r.id === recordId);
    if (!record) return;

    setTasks((prev) => [toReopenedTask(record), ...prev]);
    setHistory((prev) => prev.filter((r) => r.id !== recordId));
  };

  // Deleting is scoped to tasks[] only. Completed work has already left tasks[],
  // so this can never reach a history record.
  const deleteTask = (id: string) => setTasks((prev) => prev.filter((t) => t.id !== id));

  // Removing a history record is scoped to history[] only: it drops the record
  // permanently and never touches tasks[], and tasks[] holds no copy of it that
  // could recreate the entry on the next load.
  const deleteHistoryRecord = (recordId: string) =>
    setHistory((prev) => prev.filter((r) => r.id !== recordId));

  return (
    <main className="mx-auto w-full max-w-5xl space-y-3 px-4 py-3 sm:space-y-5 sm:px-6 sm:py-6 lg:px-8">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1.5">
          <h1
            suppressHydrationWarning
            className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl"
          >
            {getGreeting()}
          </h1>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Here's what's on your plate today.
          </p>
          <div className="mt-2 space-y-1.5">
            {todayTotal === 0 ? (
              <p className="text-xs text-muted-foreground sm:text-sm">
                No tasks scheduled for today.
              </p>
            ) : (
              <>
                <p className="text-xs font-medium text-foreground sm:text-sm">
                  {todayCompleted} of {todayTotal} tasks completed
                </p>
                <div className="flex items-center gap-2">
                  <div
                    className="h-1.5 w-full overflow-hidden rounded-full bg-secondary"
                    role="progressbar"
                    aria-valuenow={todayPercent}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${todayPercent}% of today's tasks completed`}
                  >
                    <div
                      className="h-full bg-primary transition-all duration-300 ease-out motion-reduce:transition-none"
                      style={{ width: `${todayPercent}%` }}
                    />
                  </div>
                  <span className="text-xs tabular-nums text-muted-foreground">
                    {todayPercent}%
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
        <Header dark={dark} onToggle={() => setDark((d) => !d)} />
      </div>
      <StatsSection total={totalTasks} active={activeTasks} completed={completedTasks} />
      <TaskForm
        title={title}
        category={category}
        dueDate={dueDate}
        dueTime={dueTime}
        error={error}
        onTitleChange={(v) => {
          setTitle(v);
          if (error) setError("");
        }}
        onCategoryChange={setCategory}
        onDueDateChange={setDueDate}
        onDueTimeChange={setDueTime}
        onSubmit={addTask}
      />
      <section aria-labelledby="tasks-heading" className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 id="tasks-heading" className="text-lg font-semibold">
            Your tasks
          </h2>
          <FilterTabs
            filter={filter}
            counts={{
              all: totalTasks,
              active: activeTasks,
              completed: completedTasks,
              ...categoryCounts,
            }}
            onChange={setFilter}
          />
        </div>
        <div aria-live="polite" key={filter}>
          {showHistory && history.length > 0 ? (
            <CompletedHistory
              history={history}
              onReopen={reopenTask}
              onDelete={deleteHistoryRecord}
            />
          ) : (
            <TaskList
              tasks={filteredTasks}
              emptyMessage={emptyMessage}
              onChangeProgress={changeProgress}
              onComplete={completeTask}
              onDelete={deleteTask}
            />
          )}
        </div>
      </section>
      {/* Hidden while the Completed filter is showing it above, so the records
          are never rendered twice at once. */}
      {!showHistory && (
        <CompletedHistory history={history} onReopen={reopenTask} onDelete={deleteHistoryRecord} />
      )}
    </main>
  );
}
