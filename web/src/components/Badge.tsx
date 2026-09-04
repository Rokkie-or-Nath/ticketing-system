import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { PRIORITY_LABEL, STATUS_LABEL, type Priority, type Status } from "@/data/mock";

const PRIORITY_CLASSES: Record<Priority, string> = {
  critical: "border-red-500/25 bg-red-500/10 text-red-400",
  high: "border-amber-500/25 bg-amber-500/10 text-amber-400",
  medium: "border-sky-500/25 bg-sky-500/10 text-sky-400",
  low: "border-emerald-500/25 bg-emerald-500/10 text-emerald-400",
};

const STATUS_CLASSES: Record<Status, string> = {
  open: "border-sky-500/25 bg-sky-500/10 text-sky-400",
  in_progress: "border-amber-500/25 bg-amber-500/10 text-amber-400",
  resolved: "border-emerald-500/25 bg-emerald-500/10 text-emerald-400",
  closed: "border-slate-600/40 bg-muted text-muted-foreground",
};

function Pill({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <Badge variant="outline" className={cn("rounded-full border", className)}>
      {children}
    </Badge>
  );
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  return <Pill className={PRIORITY_CLASSES[priority]}>{PRIORITY_LABEL[priority]}</Pill>;
}

export function StatusBadge({ status }: { status: Status }) {
  return (
    <Pill className={cn("gap-1.5", STATUS_CLASSES[status])}>
      <span className="size-1.5 rounded-full bg-current" />
      {STATUS_LABEL[status]}
    </Pill>
  );
}

export function CategoryBadge({ category }: { category: string }) {
  const label = category.charAt(0).toUpperCase() + category.slice(1);
  return (
    <Badge variant="secondary" className="rounded-full font-medium text-secondary-foreground/90">
      {label}
    </Badge>
  );
}