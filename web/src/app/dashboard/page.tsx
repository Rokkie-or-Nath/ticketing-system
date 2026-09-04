"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import MetricCard from "@/components/MetricCard";
import PageHeader from "@/components/PageHeader";
import QueueToolbar, { type StatusTab } from "@/components/QueueToolbar";
import TicketTable from "@/components/TicketTable";
import {
  AlertTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  PlusIcon,
  TicketIcon,
} from "@/components/icons";
import { PRIORITY_ORDER, TICKETS, type Priority } from "@/data/mock";

function sameDay(iso: string | null | undefined): boolean {
  if (!iso) return false;
  const d = new Date(iso);
  const n = new Date();
  return (
    d.getUTCFullYear() === n.getUTCFullYear() &&
    d.getUTCMonth() === n.getUTCMonth() &&
    d.getUTCDate() === n.getUTCDate()
  );
}

export default function DashboardPage() {
  const [query, setQuery] = useState("");
  const [statusTab, setStatusTab] = useState<StatusTab>("all");
  const [priority, setPriority] = useState<Priority | "any">("any");

  const stats = useMemo(() => {
    const active = TICKETS.filter((t) => t.status === "open" || t.status === "in_progress");
    const inProgress = TICKETS.filter((t) => t.status === "in_progress");
    const critical = TICKETS.filter(
      (t) => t.priority === "critical" && (t.status === "open" || t.status === "in_progress")
    );
    const resolvedToday = TICKETS.filter((t) => t.status === "resolved" && sameDay(t.resolvedAt));
    const agentsInProgress = new Set(inProgress.map((t) => t.assignedTo).filter(Boolean)).size;

    return {
      active: active.length,
      inProgress: inProgress.length,
      critical: critical.length,
      resolvedToday: resolvedToday.length,
      pctActive: Math.round((active.length / TICKETS.length) * 100),
      agentsInProgress,
    };
  }, []);

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
        title="Support Dashboard"
        subtitle="Monitor ticket volume, SLA health,and team workload in real time."
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

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Total Active Tickets"
          value={stats.active}
          accent="default"
          icon={<TicketIcon className="size-4.5" />}
          trend={`${stats.pctActive}% of queue`}
        />
        <MetricCard
          label="Critical SLA Breaches"
          value={stats.critical}
          accent="red"
          icon={<AlertTriangleIcon className="size-4.5" />}
          trend="Needs triage"
          trendTone="negative"
        />
        <MetricCard
          label="In Progress"
          value={stats.inProgress}
          accent="sky"
          icon={<ClockIcon className="size-4.5" />}
          trend={stats.agentsInProgress > 0 ? `${stats.agentsInProgress} agent${stats.agentsInProgress > 1 ? "s" : ""} assigned` : "Unassigned"}
        />
        <MetricCard
          label="Resolved Today"
          value={stats.resolvedToday}
          accent="emerald"
          icon={<CheckCircleIcon className="size-4.5" />}
          trend="+1 vs yesterday"
          trendTone="positive"
        />
      </div>

      <section className="mt-8">
        <div className="mb-4">
          <h2 className="text-white text-lg font-semibold">Ticket queue</h2>
          <p className="text-slate-400 text-sm">Search and filter across all active requests.</p>
        </div>
        <div className="space-y-4">
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
      </section>
    </AppShell>
  );
}