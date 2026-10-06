import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { PriorityBadge, StatusBadge } from "@/components/Badge";
import { cn } from "@/lib/utils";
import type { Priority, Status } from "@/data/mock";

/** Single source of truth for column widths — shared by header and rows. */
export const TICKET_GRID =
  "grid grid-cols-[120px_88px_minmax(0,1fr)_140px_96px_24px] items-center gap-x-4";

/* ── Column header ──────────────────────────────────────────── */

export function TicketListHeader() {
  return (
    <div
      aria-hidden="true"
      className={cn(
        TICKET_GRID,
        "hidden px-4 py-2 text-[0.65rem] font-medium uppercase tracking-wider text-muted-foreground/60 md:grid"
      )}
    >
      <span>Status</span>
      <span>Ticket</span>
      <span>Title</span>
      <span className="text-right">Assignee</span>
      <span>Priority</span>
      <span aria-hidden="true" />
    </div>
  );
}

/* ── Data row ───────────────────────────────────────────────── */

interface TicketRowProps {
  id: string;
  status: Status;
  subject: string;
  priority: Priority;
  assigneeName: string | null;
}

export function TicketRow({ id, status, subject, priority, assigneeName }: TicketRowProps) {
  return (
    <div>
      <Link
        href={`/tickets/${id}`}
        className={cn(
          TICKET_GRID,
          // Desktop layout
          "min-h-[52px] px-4 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
          // Mobile: stacked card, hide grid
          "max-md:grid-cols-none max-md:flex max-md:flex-col max-md:gap-1.5 max-md:py-3"
        )}
      >
        {/* Mobile line 1: status + id + priority */}
        <div className="flex items-center gap-2 md:contents">
          {/* Status — col 1 */}
          <div className="flex md:block">
            <StatusBadge status={status} />
          </div>

          {/* Ticket ID — col 2 */}
          <span className="font-mono text-xs text-muted-foreground md:block">
            {id}
          </span>

          {/* Priority — col 5 (shown inline on mobile, in grid on md+) */}
          <div className="ml-auto flex md:hidden">
            <PriorityBadge priority={priority} />
          </div>
        </div>

        {/* Title — col 3 */}
        <span
          title={subject}
          className="truncate text-sm font-medium text-foreground max-md:line-clamp-2 max-md:whitespace-normal"
        >
          {subject}
        </span>

        {/* Assignee — col 4 (hidden below md) */}
        <span
          className={cn(
            "hidden text-right text-xs md:block",
            assigneeName
              ? "text-muted-foreground"
              : "italic text-muted-foreground/50"
          )}
        >
          {assigneeName ?? "Unassigned"}
        </span>

        {/* Priority — col 5 (hidden on mobile, shown in grid on md+) */}
        <div className="hidden md:flex">
          <PriorityBadge priority={priority} />
        </div>

        {/* Chevron — col 6 */}
        <ChevronRight className="ml-auto size-4 shrink-0 text-muted-foreground max-md:hidden" />

        {/* Mobile line 3: assignee + chevron */}
        <div className="flex items-center justify-between md:hidden">
          <span
            className={cn(
              "text-xs",
              assigneeName
                ? "text-muted-foreground"
                : "italic text-muted-foreground/50"
            )}
          >
            {assigneeName ?? "Unassigned"}
          </span>
          <ChevronRight className="size-4 text-muted-foreground" />
        </div>
      </Link>
    </div>
  );
}
