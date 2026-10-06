"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import AppShell from "@/components/AppShell";
import PageHeader from "@/components/PageHeader";
import QueueToolbar, { type StatusTab } from "@/components/QueueToolbar";
import { TicketTableSkeleton } from "@/components/Skeletons";
import TicketTable from "@/components/TicketTable";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PRIORITY_ORDER, type Category, type Priority } from "@/data/mock";
import { useTicketData } from "@/lib/useTicketData";
import { getSessionUser } from "@/lib/auth";

export default function TicketsPage() {
  const [query, setQuery] = useState("");
  const [statusTab, setStatusTab] = useState<StatusTab>("all");
  const [priority, setPriority] = useState<Priority | "any">("any");
  const [category, setCategory] = useState<Category | "any">("any");

  const { tickets, sla, loading, error } = useTicketData(getSessionUser());

  useEffect(() => {
    const id = setTimeout(() => {
      const q = new URLSearchParams(window.location.search).get("q");
      if (q) setQuery(q);
    }, 0);
    return () => clearTimeout(id);
  }, []);

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
      .filter((t) => (category === "any" ? true : t.category === category))
      .filter((t) => {
        if (!q) return true;
        return (
          t.id.toLowerCase().includes(q) ||
          t.subject.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
  }, [query, statusTab, priority, category, tickets]);

  return (
    <AppShell>
      <PageHeader
        eyebrow="Tickets"
        title="Ticket queue"
        subtitle="Triage, assign, and resolve every support request."
        actions={
          <Button asChild size="sm">
            <Link href="/tickets/new">
              <Plus className="size-4" />
              New ticket
            </Link>
          </Button>
        }
      />

      <div className="mt-6 space-y-4">
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
          category={category}
          onCategoryChange={setCategory}
          counts={counts}
        />
        {loading ? <TicketTableSkeleton rows={8} /> : <TicketTable tickets={rows} sla={sla} />}
      </div>
    </AppShell>
  );
}
