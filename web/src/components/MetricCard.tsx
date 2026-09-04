import type { ReactNode } from "react";
import { ArrowDownIcon, ArrowUpIcon } from "@/components/icons";

const ACCENTS = {
  default: "bg-slate-800/70 text-slate-300",
  red: "bg-red-500/10 text-red-400",
  sky: "bg-sky-500/10 text-sky-400",
  emerald: "bg-emerald-500/10 text-emerald-400",
  amber: "bg-amber-500/10 text-amber-400",
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
  const TrendIcon = trendTone === "positive" ? ArrowUpIcon : trendTone === "negative" ? ArrowDownIcon : null;
  return (
    <div className="fx-card group bg-slate-900/40 border-slate-800 rounded-xl border p-5">
      <div className="flex items-center justify-between">
        <span className={`flex size-9 items-center justify-center rounded-lg transition-transform duration-200 group-hover:scale-110 ${ACCENTS[accent]}`}>
          {icon}
        </span>
        {trend && (
          <span
            className={`flex items-center gap-1 text-xs ${
              trendTone === "negative" ? "text-red-400" : trendTone === "positive" ? "text-emerald-400" : "text-slate-500"
            }`}
          >
            {TrendIcon && <TrendIcon className="size-3" />}
            {trend}
          </span>
        )}
      </div>
      <p className="text-white mt-5 text-2xl font-semibold tracking-tight">{value}</p>
      <p className="text-slate-400 mt-1 text-sm">{label}</p>
    </div>
  );
}