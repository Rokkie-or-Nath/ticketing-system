"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import AppShell from "@/components/AppShell";
import { CategoryBadge, PriorityBadge, StatusBadge } from "@/components/Badge";
import { ArrowLeftIcon } from "@/components/icons";
import {
  ACTIVITY,
  COMMENTS,
  SLA_RULES,
  TICKETS,
  timeAgo,
  userById,
} from "@/data/mock";

const ACTION_LABEL: Record<string, string> = {
  created: "Created",
  status_changed: "Status changed",
  priority_changed: "Priority changed",
  assigned: "Assigned",
  reassigned: "Reassigned",
  comment_added: "Comment added",
};

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function TicketDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";
  const ticket = TICKETS.find((t) => t.id === id);
  const [showInternal, setShowInternal] = useState(false);

  if (!ticket) {
    return (
      <AppShell>
        <div className="flex flex-col items-start gap-4 py-16 text-center">
          <h1 className="text-white text-2xl font-semibold">Record not found</h1>
          <p className="text-slate-400 text-sm">The ticket <span className="font-mono">{id}</span> does not exist in the queue.</p>
          <Link
            href="/tickets"
            className="bg-white text-slate-950 hover:bg-slate-100 inline-flex h-9.5 items-center gap-1.5 rounded-lg px-3.5 text-sm font-semibold transition-colors"
          >
            Back to tickets
          </Link>
        </div>
      </AppShell>
    );
  }

  const creator = userById(ticket.createdBy);
  const assignee = ticket.assignedTo ? userById(ticket.assignedTo) : null;
  const comments = COMMENTS.filter((c) => c.ticketId === ticket.id);
  const visibleComments = comments.filter((c) => showInternal || !c.isInternal);
  const activity = ACTIVITY
    .filter((a) => a.ticketId === ticket.id)
    .sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1));
  const sla = SLA_RULES[ticket.priority];

  return (
    <AppShell>
      <Link
        href="/tickets"
        className="fx-link hover:text-white text-slate-400 inline-flex items-center gap-1.5 text-sm transition-colors"
      >
        <ArrowLeftIcon className="size-4" />
        Back to tickets
      </Link>

      <div className="mt-4 flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-slate-400 font-mono text-sm">{ticket.id}</span>
          <PriorityBadge priority={ticket.priority} />
          <StatusBadge status={ticket.status} />
          <CategoryBadge category={ticket.category} />
        </div>
        <h1 className="text-white text-2xl font-semibold tracking-tight">{ticket.subject}</h1>
        <p className="text-slate-400 text-sm">
          Reported by {creator.name} · Assigned to{" "}
          {assignee ? assignee.name : <span className="text-red-400">Unassigned</span>} · Updated {timeAgo(ticket.updatedAt)}
        </p>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-6">
          <section className="bg-slate-900/40 fx-card border-slate-800 rounded-xl border p-5">
            <h2 className="text-slate-400 text-sm font-medium">Description</h2>
            <p className="text-slate-300 mt-3 text-sm whitespace-pre-wrap leading-relaxed">{ticket.description}</p>
          </section>

          <section className="bg-slate-900/40 fx-card border-slate-800 rounded-xl border p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-slate-400 text-sm font-medium">Comments · {visibleComments.length}</h2>
              <label className="text-slate-400 flex cursor-pointer select-none items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={showInternal}
                  onChange={(e) => setShowInternal(e.target.checked)}
                  className="accent-sky-500 size-3.5"
                />
                Show internal notes
              </label>
            </div>
            <ul className="mt-4 flex flex-col gap-3">
              {visibleComments.length === 0 && (
                <li className="text-slate-500 py-4 text-sm">No comments on this ticket yet.</li>
              )}
              {visibleComments.map((c) => {
                const u = userById(c.userId);
                return (
                  <li
                    key={c.id}
                    className={`fx-card rounded-lg border p-4 ${
                      c.isInternal ? "bg-sky-500/5 border-sky-500/20 " : "bg-slate-900/40 border-slate-800/70 "
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="ring-white/5 bg-slate-800 text-slate-300 flex size-6 items-center justify-center rounded-full text-[0.6rem] font-semibold ring-1 ring-inset">
                        {initials(u.name)}
                      </span>
                      <span className="text-white text-sm font-medium">{u.name}</span>
                      {c.isInternal && (
                        <span className="bg-sky-500/10 text-sky-400 rounded-full px-2 py-0.5 text-xs font-medium">
                          Internal
                        </span>
                      )}
                      <span className="text-slate-500 ml-auto text-xs">{timeAgo(c.createdAt)}</span>
                    </div>
                    <p className="text-slate-300 mt-2 text-sm leading-relaxed">{c.message}</p>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>
<aside className="flex flex-col gap-6">
          <section className="bg-slate-900/40 fx-card border-slate-800 rounded-xl border p-5">
            <h2 className="text-slate-400 text-sm font-medium">Details</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-slate-500">Status</dt>
                <dd><StatusBadge status={ticket.status} /></dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-slate-500">Priority</dt>
                <dd><PriorityBadge priority={ticket.priority} /></dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-slate-500">Category</dt>
                <dd className="text-slate-300">{ticket.category.charAt(0).toUpperCase() + ticket.category.slice(1)}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-slate-500">Assignee</dt>
                <dd className="text-slate-300">{assignee ? assignee.name : "Unassigned"}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-slate-500">Reporter</dt>
                <dd className="text-slate-300">{creator.name}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-slate-500">Created</dt>
                <dd className="text-slate-300">{timeAgo(ticket.createdAt)}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-slate-500">Last updated</dt>
                <dd className="text-slate-300">{timeAgo(ticket.updatedAt)}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-slate-500">SLA target</dt>
                <dd className="text-slate-300 font-mono text-xs">{sla ? `${sla.response}m / ${sla.resolution}m` : "—"}</dd>
              </div>
            </dl>
          </section>

          <section className="bg-slate-900/40 fx-card border-slate-800 rounded-xl border p-5">
            <h2 className="text-slate-400 text-sm font-medium">Activity</h2>
            <ol className="mt-4 space-y-4">
              {activity.map((a, idx) => (
                <li key={a.id} className="relative pl-5">
                  {idx < activity.length - 1 && (
                    <span className="bg-slate-800 absolute top-3 bottom--2 left-1.5 w-px" />
                  )}
                  <span className="bg-slate-800 border-slate-900 absolute top-1 left-0 size-3 rounded-full border-2" />
                  <div>
                    <div className="text-white text-sm font-medium">{ACTION_LABEL[a.actionType]}</div>
                    <p className="text-slate-500 text-xs">
                      {userById(a.actorId).name} · {timeAgo(a.createdAt)}
                    </p>
                    {(a.oldValue || a.newValue) && (
                      <p className="text-xs">
                        <span className="text-slate-500 font-mono">{a.oldValue ?? "—"}</span>
                        <span className="text-slate-600 mx-1">{"→"}</span>
                        <span className="text-slate-300 font-mono">{a.newValue ?? "—"}</span>
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </aside>
      </div>
    </AppShell>
  );
}