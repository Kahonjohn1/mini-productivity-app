import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Header } from "@/components/productivity/Header";
import { StatsSection } from "@/components/productivity/StatsSection";
import { TaskForm } from "@/components/productivity/TaskForm";
import { FilterTabs } from "@/components/productivity/FilterTabs";
import { TaskList } from "@/components/productivity/TaskList";
import {
  CATEGORIES,
  clamp,
  isCompleted,
  type Filter,
  type Task,
} from "@/components/productivity/types";
import { loadTasks, saveTasks } from "@/components/productivity/storage";

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
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
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
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [filter, setFilter] = useState<Filter>("all");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string>("Personal");
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("");
  const [error, setError] = useState("");
  const [dark, setDark] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = loadTasks();
    if (stored.length > 0) {
      setTasks(stored);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) {
      saveTasks(tasks);
    }
  }, [tasks, hydrated]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  // Derived state
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(isCompleted).length;
  const activeTasks = totalTasks - completedTasks;
  const personalTasks = tasks.filter((t) => t.category === "Personal").length;
  const workTasks = tasks.filter((t) => t.category === "Work").length;
  const studyTasks = tasks.filter((t) => t.category === "Study").length;
  const shoppingTasks = tasks.filter((t) => t.category === "Shopping").length;
  const otherTasks = tasks.filter((t) => t.category === "Other").length;
  const filteredTasks = tasks.filter((t) => {
    if (filter === "all") return true;
    if (filter === "active") return !isCompleted(t);
    if (filter === "completed") return isCompleted(t);
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
  const todayTasks = tasks.filter((t) => t.dueDate === today);
  const todayCompleted = todayTasks.filter(isCompleted).length;
  const todayTotal = todayTasks.length;
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
    if (
      filter === "Personal" ||
      filter === "Work" ||
      filter === "Study" ||
      filter === "Shopping" ||
      filter === "Other"
    ) {
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
        id:
          globalThis.crypto?.randomUUID?.() ??
          `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`,
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

  const changeProgress = (id: string, delta: number) =>
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, progress: clamp(t.progress + delta) } : t)),
    );

  const completeTask = (id: string) =>
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, progress: 100 } : t)));

  const deleteTask = (id: string) => setTasks((prev) => prev.filter((t) => t.id !== id));

  return (
    <main className="mx-auto w-full max-w-5xl space-y-3 px-4 py-3 sm:space-y-5 sm:px-6 sm:py-6 lg:px-8">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1.5">
          <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
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
              Personal: personalTasks,
              Work: workTasks,
              Study: studyTasks,
              Shopping: shoppingTasks,
              Other: otherTasks,
            }}
            onChange={setFilter}
          />
        </div>
        <div aria-live="polite" key={filter}>
          <TaskList
            tasks={filteredTasks}
            emptyMessage={emptyMessage}
            onChangeProgress={changeProgress}
            onComplete={completeTask}
            onDelete={deleteTask}
          />
        </div>
      </section>
    </main>
  );
}
