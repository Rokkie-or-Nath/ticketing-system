"use client";

import Link from "next/link";
import { MoreHorizontal } from "lucide-react";
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
import { CategoryBadge, PriorityBadge, StatusBadge } from "@/components/Badge";
import { userById, type Ticket } from "@/data/mock";

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function TicketTable({ tickets }: { tickets: Ticket[] }) {
  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="px-4">Ticket ID</TableHead>
            <TableHead className="px-4">Subject</TableHead>
            <TableHead className="hidden px-4 md:table-cell">Category</TableHead>
            <TableHead className="px-4">Priority</TableHead>
            <TableHead className="px-4">Status</TableHead>
            <TableHead className="hidden px-4 lg:table-cell">Assigned</TableHead>
            <TableHead className="w-12 px-4" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {tickets.length === 0 && (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={7} className="text-muted-foreground py-10 text-center">
                No tickets match the current filters.
              </TableCell>
            </TableRow>
          )}
          {tickets.map((ticket) => {
            const assignee = ticket.assignedTo ? userById(ticket.assignedTo) : null;
            return (
              <TableRow key={ticket.id} className="fx-row">
                <TableCell className="text-muted-foreground px-4 py-3.5 font-mono text-xs">
                  {ticket.id}
                </TableCell>
                <TableCell className="px-4 py-3.5">
                  <Link
                    href={`/tickets/${ticket.id}`}
                    className="fx-link font-medium text-foreground hover:text-foreground/90"
                  >
                    {ticket.subject}
                  </Link>
                </TableCell>
                <TableCell className="hidden px-4 py-3.5 md:table-cell">
                  <CategoryBadge category={ticket.category} />
                </TableCell>
                <TableCell className="px-4 py-3.5">
                  <PriorityBadge priority={ticket.priority} />
                </TableCell>
                <TableCell className="px-4 py-3.5">
                  <StatusBadge status={ticket.status} />
                </TableCell>
                <TableCell className="hidden px-4 py-3.5 lg:table-cell">
                  {assignee ? (
                    <span className="flex items-center gap-2">
                      <Avatar className="size-6 text-[0.6rem]">
                        <AvatarFallback className="bg-secondary text-secondary-foreground">
                          {initials(assignee.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-muted-foreground text-sm">{assignee.name}</span>
                    </span>
                  ) : (
                    <span className="text-muted-foreground/60 text-sm">Unassigned</span>
                  )}
                </TableCell>
                <TableCell className="px-4 py-3.5 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-foreground size-8"
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
                          toast.success("ID copied to clipboard", {
                            description: ticket.id,
                          });
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