"use client";

import Link from "next/link";
import { MoreHorizontalIcon } from "@/components/icons";
import { userById, type Ticket } from "@/data/mock";
import { CategoryBadge, PriorityBadge, StatusBadge } from "@/components/Badge";

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
    <div className="bg-slate-900/40 border-slate-800 overflow-x-auto rounded-xl border">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead>
          <tr className="border-slate-800 text-slate-500 border-b text-xs uppercase tracking-wider">
            <th className="px-4 py-3 font-medium">Ticket ID</th>
            <th className="px-4 py-3 font-medium">Subject</th>
            <th className="px-4 py-3 font-medium">Category</th>
            <th className="px-4 py-3 font-medium">Priority</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Assigned</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-slate-800/70 divide-y">
          {tickets.length === 0 && (
            <tr>
              <td colSpan={7} className="text-slate-500 px-4 py-10 text-center text-sm">
                No tickets match the current filters.
              </td>
            </tr>
          )}
          {tickets.map((ticket) => (
            <tr key={ticket.id} className="fx-row">
              <td className="text-slate-400 px-4 py-3.5 font-mono text-xs">{ticket.id}</td>
              <td className="px-4 py-3.5">
                <Link
                  href={`/tickets/${ticket.id}`}
                  className="fx-link text-slate-200 hover:text-white font-medium transition-colors"
                >
                  {ticket.subject}
                </Link>
              </td>
              <td className="px-4 py-3.5">
                <CategoryBadge category={ticket.category} />
              </td>
              <td className="px-4 py-3.5">
                <PriorityBadge priority={ticket.priority} />
              </td>
              <td className="px-4 py-3.5">
                <StatusBadge status={ticket.status} />
              </td>
              <td className="px-4 py-3.5">
                {ticket.assignedTo ? (
                  <span className="flex items-center gap-2">
                    <span className="ring-white/5 bg-slate-800 text-slate-300 flex size-6 items-center justify-center rounded-full text-[0.6rem] font-semibold ring-1 ring-inset">
                      {initials(userById(ticket.assignedTo).name)}
                    </span>
                    <span className="text-slate-300">{userById(ticket.assignedTo).name}</span>
                  </span>
                ) : (
                  <span className="text-slate-500">Unassigned</span>
                )}
              </td>
              <td className="px-4 py-3.5 text-right">
                <details className="group relative inline-block">
                  <summary className="hover:bg-slate-800 hover:text-white text-slate-400 inline-flex size-8 cursor-pointer list-none select-none items-center justify-center rounded-md transition-colors">
                    <MoreHorizontalIcon className="size-4" />
                  </summary>
                  <div className="bg-slate-900 border-slate-800 absolute right-0 z-20 mt-1 w-40 rounded-lg border p-1 shadow-xl shadow-black/40">
                    <Link
                      href={`/tickets/${ticket.id}`}
                      className="text-slate-300 hover:bg-slate-800/70 hover:text-white block rounded-md px-3 py-1.5 text-sm"
                    >
                      View details
                    </Link>
                    <button
                      type="button"
                      onClick={() => { void navigator.clipboard?.writeText(ticket.id); }}
                      className="text-slate-300 hover:bg-slate-800/70 hover:text-white block w-full rounded-md px-3 py-1.5 text-left text-sm"
                    >
                      Copy ID
                    </button>
                  </div>
                </details>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}