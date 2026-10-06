import {
  AlertCircle,
  AlertTriangle,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  CheckCircle2,
  Circle,
  Clock,
  Cpu,
  HardDrive,
  KeyRound,
  Laptop,
  Network,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { type Priority, type Status } from "@/data/mock";

/* ── Priority ─────────────────────────────────────────────── */

const PRIORITY_CONFIG: Record<
  Priority,
  { label: string; icon: React.ReactNode; classes: string }
> = {
  critical: {
    label: "Critical",
    icon: <AlertCircle className="size-3" />,
    classes: "border-destructive/30 bg-destructive/10 text-destructive",
  },
  high: {
    label: "High",
    icon: <ArrowUp className="size-3" />,
    classes: "border-warning/30 bg-warning/10 text-warning",
  },
  medium: {
    label: "Medium",
    icon: <ArrowRight className="size-3" />,
    classes: "border-info/30 bg-info/10 text-info",
  },
  low: {
    label: "Low",
    icon: <ArrowDown className="size-3" />,
    classes: "border-success/30 bg-success/10 text-success",
  },
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  const { label, icon, classes } = PRIORITY_CONFIG[priority];
  return (
    <Badge
      variant="outline"
      className={cn("gap-1 rounded-full border px-2 py-0.5 text-[0.7rem] font-medium", classes)}
    >
      {icon}
      {label}
    </Badge>
  );
}

/* ── Status ───────────────────────────────────────────────── */

const STATUS_CONFIG: Record<
  Status,
  { label: string; icon: React.ReactNode; classes: string }
> = {
  open: {
    label: "Open",
    icon: <Circle className="size-2.5 fill-current" />,
    classes: "border-info/30 bg-info/10 text-info",
  },
  in_progress: {
    label: "In Progress",
    icon: <Clock className="size-3" />,
    classes: "border-warning/30 bg-warning/10 text-warning",
  },
  resolved: {
    label: "Resolved",
    icon: <CheckCircle2 className="size-3" />,
    classes: "border-success/30 bg-success/10 text-success",
  },
  closed: {
    label: "Closed",
    icon: <XCircle className="size-3" />,
    classes: "border-border bg-muted text-muted-foreground",
  },
};

export function StatusBadge({ status }: { status: Status }) {
  const { label, icon, classes } = STATUS_CONFIG[status];
  return (
    <Badge
      variant="outline"
      className={cn("gap-1 rounded-full border px-2 py-0.5 text-[0.7rem] font-medium", classes)}
    >
      {icon}
      {label}
    </Badge>
  );
}

/* ── Category ─────────────────────────────────────────────── */

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  hardware: <HardDrive className="size-3" />,
  software: <Cpu className="size-3" />,
  network: <Network className="size-3" />,
  access: <KeyRound className="size-3" />,
  other: <Laptop className="size-3" />,
};

export function CategoryBadge({ category }: { category: string }) {
  const label = category.charAt(0).toUpperCase() + category.slice(1);
  return (
    <Badge
      variant="secondary"
      className="gap-1 rounded-full px-2 py-0.5 text-[0.7rem] font-medium text-secondary-foreground/80"
    >
      {CATEGORY_ICONS[category] ?? <AlertTriangle className="size-3" />}
      {label}
    </Badge>
  );
}

/* ── SLA pill ─────────────────────────────────────────────── */

export function SlaBadge({
  label,
  tone,
}: {
  label: string;
  tone: "on-track" | "at-risk" | "breached" | "done";
}) {
  const config = {
    "on-track": {
      classes: "border-success/30 bg-success/10 text-success",
      icon: <CheckCircle2 className="size-3" />,
    },
    "at-risk": {
      classes: "border-warning/30 bg-warning/10 text-warning",
      icon: <AlertTriangle className="size-3" />,
    },
    breached: {
      classes: "border-destructive/30 bg-destructive/10 text-destructive",
      icon: <AlertCircle className="size-3" />,
    },
    done: {
      classes: "border-border bg-muted text-muted-foreground",
      icon: <XCircle className="size-3" />,
    },
  }[tone];

  return (
    <Badge
      variant="outline"
      className={cn("gap-1 rounded-full border px-2 py-0.5 text-[0.7rem] font-medium font-mono", config.classes)}
    >
      {config.icon}
      {label}
    </Badge>
  );
}
