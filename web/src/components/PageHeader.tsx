import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export default function PageHeader({
  eyebrow,
  title,
  subtitle,
  actions,
  center = false,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  center?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row",
        center ? "items-center justify-center text-center" : "sm:items-start sm:justify-between"
      )}
    >
      <div className="min-w-0">
        {eyebrow && (
          <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-muted-foreground/70">
            {eyebrow}
          </p>
        )}
        <h1 className={cn("text-xl font-semibold tracking-tight text-foreground", eyebrow && "mt-1")}>
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
      )}
    </div>
  );
}
