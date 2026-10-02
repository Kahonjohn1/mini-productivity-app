import { ClipboardList } from "lucide-react";
import { TaskCard } from "./TaskCard";
import type { Task } from "./types";

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="animate-rise flex flex-col items-center rounded-2xl border border-dashed bg-card/50 px-6 py-8 text-center sm:py-10">
      <ClipboardList className="h-7 w-7 text-muted-foreground sm:h-8 sm:w-8" aria-hidden />
      <p className="mt-2 text-sm font-medium text-muted-foreground sm:mt-3">{message}</p>
    </div>
  );
}

type Props = {
  tasks: Task[];
  emptyMessage: string;
  onChangeProgress: (id: string, delta: number) => void;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
};

export function TaskList({ tasks, emptyMessage, ...handlers }: Props) {
  if (tasks.length === 0) return <EmptyState message={emptyMessage} />;
  return (
    <ul className="grid gap-2 sm:gap-3 lg:grid-cols-2">
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} {...handlers} />
      ))}
    </ul>
  );
}
