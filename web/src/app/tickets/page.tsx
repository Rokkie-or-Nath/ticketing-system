"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import PageHeader from "@/components/PageHeader";
import QueueToolbar, { type StatusTab } from "@/components/QueueToolbar";
import TicketTable from "@/components/TicketTable";
import { PlusIcon } from "@/components/icons";
import { PRIORITY_ORDER, TICKETS, type Priority } from "@/data/mock";

export default function TicketsPage() {
  const [query, setQuery] = useState("");
  const [statusTab, setStatusTab] = useState<StatusTab>("all");
  const [priority, setPriority] = useState<Priority | "any">("any");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...TICKETS]
      .filter((t) => {
        if (statusTab === "open") return t.status === "open" || t.status === "in_progress";
        if (statusTab === "resolved") return t.status === "resolved" || t.status === "closed";
        return true;
      })
      .filter((t) => (priority === "any" ? true : t.priority === priority))
      .filter((t) => {
        if (!q) return true;
        return (
          t.id.toLowerCase().includes(q) ||
          t.subject.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
  }, [query, statusTab, priority]);

  return (
    <AppShell>
      <PageHeader
        title="Tickets"
        subtitle="Track, triage,and resolve every support request."
        actions={
          <Link
            href="/tickets/new"
            className="fx-btn-primary bg-white text-slate-950 hover:bg-slate-100 inline-flex h-9.5 items-center gap-1.5 rounded-lg px-3.5 text-sm font-semibold transition-colors"
          >
            <PlusIcon className="size-4" />
            New Ticket
          </Link>
        }
      />

      <div className="mt-8 space-y-4">
        <QueueToolbar
          query={query}
          onQueryChange={setQuery}
          statusTab={statusTab}
          onStatusTabChange={setStatusTab}
          priority={priority}
          onPriorityChange={setPriority}
        />
        <TicketTable tickets={rows} />
      </div>
    </AppShell>
  );
}