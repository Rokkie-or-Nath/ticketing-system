import { PRIORITY_LABEL, STATUS_LABEL, type Priority, type Status } from "@/data/mock";

const PRIORITY_CLASSES: Record<Priority, string> = {
  critical: "bg-red-500/10 text-red-400 border-red-500/20",
  high: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  medium: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  low: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
};

const STATUS_CLASSES: Record<Status, string> = {
  open: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  in_progress: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  resolved: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  closed: "bg-slate-500/10 text-slate-400 border-slate-600/30",
};

function Pill({ className, dot = false, children }: { className: string; dot?: boolean; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${className}`}>
      {dot && <span className="size-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <Pill className={PRIORITY_CLASSES[priority]}>
      {PRIORITY_LABEL[priority]}
    </Pill>
  );
}

export function StatusBadge({ status }: { status: Status }) {
  return (
    <Pill className={STATUS_CLASSES[status]} dot>
      {STATUS_LABEL[status]}
    </Pill>
  );
}

export function CategoryBadge({ category }: { category: string }) {
  const label = category.charAt(0).toUpperCase() + category.slice(1);
  return (
    <Pill className="bg-slate-800/40 border-slate-700/60 text-slate-300">
      {label}
    </Pill>
  );
}