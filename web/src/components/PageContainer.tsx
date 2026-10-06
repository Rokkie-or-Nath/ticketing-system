import { cn } from "@/lib/utils";

/**
 * Shared full-width page container.
 * - Fluid: fills the viewport with responsive horizontal padding.
 * - Capped at 1920px so content doesn't stretch on ultrawide monitors.
 * - Use `narrow` for text-heavy pages (login, new ticket form) to keep
 *   a comfortable reading width inside the full-width shell.
 */
export default function PageContainer({
  children,
  className,
  narrow = false,
}: {
  children: React.ReactNode;
  className?: string;
  narrow?: boolean;
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-4 sm:px-6 lg:px-10 xl:px-14",
        narrow ? "max-w-3xl" : "max-w-[1920px]",
        className
      )}
    >
      {children}
    </div>
  );
}
