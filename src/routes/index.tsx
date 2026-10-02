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
  const [error, setError] = useState("");
  const [dark, setDark] = useState(false);

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
        id: crypto.randomUUID(),
        title: trimmed,
        category,
        progress: 0,
        ...(dueDate ? { dueDate } : {}),
      },
      ...prev,
    ]);
    setTitle("");
    setDueDate("");
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
    <main className="mx-auto w-full max-w-5xl space-y-6 px-4 py-8 sm:space-y-8 sm:px-6 sm:py-12 lg:px-8">
      <Header dark={dark} onToggle={() => setDark((d) => !d)} />
      <StatsSection total={totalTasks} active={activeTasks} completed={completedTasks} />
      <TaskForm
        title={title}
        category={category}
        dueDate={dueDate}
        error={error}
        onTitleChange={(v) => {
          setTitle(v);
          if (error) setError("");
        }}
        onCategoryChange={setCategory}
        onDueDateChange={setDueDate}
        onSubmit={addTask}
      />
      <section aria-labelledby="tasks-heading" className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
