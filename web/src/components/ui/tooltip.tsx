import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Lightweight tooltip — wraps children in a span with a CSS tooltip.
 * No extra Radix package required.
 */
export function Tooltip({
  content,
  children,
  className,
}: {
  content: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span title={content} className={cn("cursor-default", className)}>
      {children}
    </span>
  );
}

// Re-export no-op provider so imports don't break if TooltipProvider is used
export function TooltipProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
export const TooltipTrigger = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>((props, ref) => <span ref={ref} {...props} />);
TooltipTrigger.displayName = "TooltipTrigger";

export const TooltipContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>((props, ref) => <div ref={ref} {...props} />);
TooltipContent.displayName = "TooltipContent";
