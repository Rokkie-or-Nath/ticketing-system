import type { ReactNode } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const ACCENTS = {
  default: "bg-secondary text-muted-foreground",
  red: "bg-destructive/15 text-destructive",
  sky: "bg-sky-500/15 text-sky-400",
  emerald: "bg-emerald-500/15 text-emerald-400",
  amber: "bg-amber-500/15 text-amber-400",
} as const;

type Accent = keyof typeof ACCENTS;

export default function MetricCard({
  label,
  value,
  icon,
  trend,
  trendTone = "neutral",
  accent = "default",
}: {
  label: string;
  value: number;
  icon: ReactNode;
  trend?: string;
  trendTone?: "positive" | "negative" | "neutral";
  accent?: Accent;
}) {
  const TrendIcon = trendTone === "positive" ? ArrowUp : trendTone === "negative" ? ArrowDown : null;
  return (
    <Card className="fx-card group p-5">
      <div className="flex items-center justify-between">
        <span
          className={cn(
            "flex size-9 items-center justify-center rounded-lg transition-transform duration-200 group-hover:scale-110",
            ACCENTS[accent]
          )}
        >
          {icon}
        </span>
        {trend && (
          <span
            className={cn(
              "flex items-center gap-1 text-xs",
              trendTone === "negative"
                ? "text-destructive"
                : trendTone === "positive"
                  ? "text-emerald-400"
                  : "text-muted-foreground"
            )}
          >
            {TrendIcon && <TrendIcon className="size-3" />}
            {trend}
          </span>
        )}
      </div>
      <p className="text-foreground mt-5 text-2xl font-semibold tracking-tight">{value}</p>
      <p className="text-muted-foreground mt-1 text-sm">{label}</p>
    </Card>
  );
}