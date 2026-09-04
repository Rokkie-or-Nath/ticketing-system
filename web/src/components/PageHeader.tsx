import type { ReactNode } from "react";

export default function PageHeader({
  title,
  subtitle,
  actions,
  center = false,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  center?: boolean;
}) {
  return (
    <div
      className={`flex flex-col gap-4 sm:flex-row sm:items-center ${
        center ? "justify-center text-center" : "sm:items-start sm:justify-between"
      }`}
    >
      <div>
        <h1 className="text-foreground text-2xl font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="text-muted-foreground mt-1 text-sm">{subtitle}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}