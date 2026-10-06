import type { ReactNode } from "react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

const ACCENT_CLASSES = {
  default: { icon: "bg-secondary text-muted-foreground", ring: "" },
  sky:     { icon: "bg-info/15 text-info",               ring: "ring-info/20" },
  emerald: { icon: "bg-success/15 text-success",         ring: "ring-success/20" },
  amber:   { icon: "bg-warning/15 text-warning",         ring: "ring-warning/20" },
  red:     { icon: "bg-destructive/15 text-destructive", ring: "ring-destructive/20" },
} as const;

type Accent = keyof typeof ACCENT_CLASSES;

export default function MetricCard({
  label,
  value,
  icon,
  trend,
  trendTone = "neutral",
  accent = "default",
}: {
  label: string;
  value: number | string;
  icon: ReactNode;
  trend?: string;
  trendTone?: "positive" | "negative" | "neutral";
  accent?: Accent;
}) {
  const { icon: iconClass } = ACCENT_CLASSES[accent];
  const TrendIcon = trendTone === "positive" ? TrendingUp : trendTone === "negative" ? TrendingDown : null;

  return (
    <div className="rounded-lg border border-border bg-card p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <span className={cn("flex size-7 items-center justify-center rounded-md", iconClass)}>
          {icon}
        </span>
      </div>
      <p className="text-2xl font-semibold tracking-tight text-foreground leading-none">
        {value}
      </p>
      {trend && (
        <p className={cn(
          "flex items-center gap-1 text-xs",
          trendTone === "negative" ? "text-destructive"
          : trendTone === "positive" ? "text-success"
          : "text-muted-foreground"
        )}>
          {TrendIcon && <TrendIcon className="size-3" />}
          {trend}
        </p>
      )}
    </div>
  );
}
