"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import AppShell from "@/components/AppShell";
import PageHeader from "@/components/PageHeader";
import QueueToolbar, { type StatusTab } from "@/components/QueueToolbar";
import TicketTable from "@/components/TicketTable";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PRIORITY_ORDER, type Priority } from "@/data/mock";
import { useTicketData } from "@/lib/useTicketData";
import { getSessionUser } from "@/lib/auth";

export default function TicketsPage() {
  const [query, setQuery] = useState("");
  const [statusTab, setStatusTab] = useState<StatusTab>("all");
  const [priority, setPriority] = useState<Priority | "any">("any");

  const { tickets, loading, error } = useTicketData(getSessionUser());

  const counts = useMemo(
    () => ({
      all: tickets.length,
      open: tickets.filter((t) => t.status === "open" || t.status === "in_progress").length,
      resolved: tickets.filter((t) => t.status === "resolved" || t.status === "closed").length,
    }),
    [tickets]
  );

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...tickets]
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
        subtitle="Track, triage, and resolve every support request."
        actions={
          <Button asChild>
            <Link href="/tickets/new">
              <Plus />
              New Ticket
            </Link>
          </Button>
        }
      />

      <div className="mt-8 space-y-4">
        {loading && (
          <p className="text-muted-foreground text-sm">Loading tickets...</p>
        )}
        {error && !loading && (
          <Card className="border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            {error}
          </Card>
        )}
        <QueueToolbar
          query={query}
          onQueryChange={setQuery}
          statusTab={statusTab}
          onStatusTabChange={setStatusTab}
          priority={priority}
          onPriorityChange={setPriority}
          counts={counts}
        />
        <TicketTable tickets={rows} />
      </div>
    </AppShell>
  );
}