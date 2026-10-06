"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Ticket } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PriorityBadge, SlaBadge, StatusBadge } from "@/components/Badge";
import { timeAgo, userById, type Ticket as TicketType } from "@/data/mock";
import type { SlaRules } from "@/lib/api";

function initials(name: string) {
  return name.trim().split(/\s+/).map((p) => p[0]).join("").slice(0, 2).toUpperCase();
}

function getSlaChip(
  t: TicketType,
  sla: SlaRules | null | undefined
): { label: string; tone: "on-track" | "at-risk" | "breached" | "done" } | null {
  if (!sla) return null;
  if (t.status === "resolved" || t.status === "closed") {
    return { label: "Done", tone: "done" };
  }
  const target = sla[t.priority]?.resolution;
  if (!target) return null;
  const leftMins = target - (Date.now() - new Date(t.createdAt).getTime()) / 60000;
  if (leftMins <= 0) return { label: "Breached", tone: "breached" };
  if (leftMins < target * 0.25) {
    const h = Math.floor(leftMins / 60);
    const m = Math.floor(leftMins % 60);
    return { label: h > 0 ? `${h}h ${m}m` : `${m}m`, tone: "at-risk" };
  }
  const h = Math.floor(leftMins / 60);
  const m = Math.floor(leftMins % 60);
  return { label: h > 0 ? `${h}h ${m}m` : `${m}m`, tone: "on-track" };
}

export default function TicketTable({
  tickets,
  sla,
}: {
  tickets: TicketType[];
  sla?: SlaRules | null;
}) {
  const router = useRouter();

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <Table>
        <TableHeader className="sticky top-0 bg-card z-10">
          <TableRow className="hover:bg-transparent border-b border-border">
            <TableHead className="px-4 py-3 text-xs font-semibold text-muted-foreground">Subject</TableHead>
            <TableHead className="hidden px-4 py-3 text-xs font-semibold text-muted-foreground md:table-cell">Requester</TableHead>
            <TableHead className="hidden px-4 py-3 text-xs font-semibold text-muted-foreground lg:table-cell">Assignee</TableHead>
            <TableHead className="px-4 py-3 text-xs font-semibold text-muted-foreground">Priority</TableHead>
            <TableHead className="px-4 py-3 text-xs font-semibold text-muted-foreground">Status</TableHead>
            <TableHead className="hidden px-4 py-3 text-xs font-semibold text-muted-foreground md:table-cell">Updated</TableHead>
            <TableHead className="hidden px-4 py-3 text-xs font-semibold text-muted-foreground lg:table-cell">SLA</TableHead>
            <TableHead className="w-10 px-4 py-3" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {tickets.length === 0 && (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={8} className="py-16 text-center">
                <div className="flex flex-col items-center gap-3">
                  <span className="flex size-12 items-center justify-center rounded-full bg-muted">
                    <Ticket className="size-5 text-muted-foreground" />
                  </span>
                  <p className="text-sm font-medium text-foreground">No tickets found</p>
                  <p className="text-xs text-muted-foreground">Try adjusting your filters or search query.</p>
                </div>
              </TableCell>
            </TableRow>
          )}
          {tickets.map((ticket) => {
            const requester = userById(ticket.createdBy);
            const assignee = ticket.assignedTo ? userById(ticket.assignedTo) : null;
            const slaChip = getSlaChip(ticket, sla);
            return (
              <TableRow
                key={ticket.id}
                className="fx-row cursor-pointer"
                onClick={() => router.push(`/tickets/${ticket.id}`)}
              >
                <TableCell className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="min-w-0">
                      <Link
                        href={`/tickets/${ticket.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="fx-link block max-w-[260px] truncate text-sm font-medium text-foreground hover:text-foreground/80"
                      >
                        {ticket.subject}
                      </Link>
                      <span className="mt-0.5 block font-mono text-[0.65rem] text-muted-foreground">
                        {ticket.id}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden px-4 py-3 md:table-cell">
                  <span className="flex items-center gap-1.5">
                    <Avatar className="size-5 text-[0.55rem]">
                      <AvatarFallback className="bg-secondary text-secondary-foreground text-[0.55rem]">
                        {initials(requester.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground">{requester.name}</span>
                  </span>
                </TableCell>
                <TableCell className="hidden px-4 py-3 lg:table-cell">
                  {assignee ? (
                    <span className="flex items-center gap-1.5">
                      <Avatar className="size-5 text-[0.55rem]">
                        <AvatarFallback className="bg-secondary text-secondary-foreground text-[0.55rem]">
                          {initials(assignee.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-muted-foreground">{assignee.name}</span>
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground/50 italic">Unassigned</span>
                  )}
                </TableCell>
                <TableCell className="px-4 py-3">
                  <PriorityBadge priority={ticket.priority} />
                </TableCell>
                <TableCell className="px-4 py-3">
                  <StatusBadge status={ticket.status} />
                </TableCell>
                <TableCell className="hidden px-4 py-3 text-xs text-muted-foreground md:table-cell">
                  {timeAgo(ticket.updatedAt ?? ticket.createdAt)}
                </TableCell>
                <TableCell className="hidden px-4 py-3 lg:table-cell">
                  {slaChip && <SlaBadge label={slaChip.label} tone={slaChip.tone} />}
                </TableCell>
                <TableCell className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 text-muted-foreground hover:text-foreground"
                      >
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem asChild>
                        <Link href={`/tickets/${ticket.id}`}>View details</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={() => {
                          void navigator.clipboard?.writeText(ticket.id);
                          toast.success("ID copied", { description: ticket.id });
                        }}
                      >
                        Copy ID
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
