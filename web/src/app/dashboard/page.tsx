"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CircleCheck, Clock, Plus, TriangleAlert, Ticket } from "lucide-react";
import AppShell from "@/components/AppShell";
import MetricCard from "@/components/MetricCard";
import PageHeader from "@/components/PageHeader";
import QueueToolbar, { type StatusTab } from "@/components/QueueToolbar";
import TicketTable from "@/components/TicketTable";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  PRIORITY_ORDER,
  SLA_RULES,
  TICKETS,
  type Priority,
} from "@/data/mock";

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

const PRIORITY_BAR: Record<Priority, string> = {
  critical: "bg-red-500",
  high: "bg-amber-500",
  medium: "bg-sky-500",
  low: "bg-emerald-500",
};

export default function DashboardPage() {
  const [query, setQuery] = useState("");
  const [statusTab, setStatusTab] = useState<StatusTab>("all");
  const [priority, setPriority] = useState<Priority | "any">("any");

  const stats = useMemo(() => {
    const active = TICKETS.filter(
      (t) => t.status === "open" || t.status === "in_progress"
    );
    const inProgress = TICKETS.filter((t) => t.status === "in_progress");
    const critical = TICKETS.filter(
      (t) => t.priority === "critical" && (t.status === "open" || t.status === "in_progress")
    );
    const resolvedToday = TICKETS.filter((t) => t.status === "resolved" && sameDay(t.resolvedAt));
    const agentsInProgress = new Set(inProgress.map((t) => t.assignedTo).filter(Boolean)).size;

    const now = new Date().getTime();
    const breaches = active.filter((t) => {
      const mins = (now - new Date(t.createdAt).getTime()) / 60000;
      return mins > SLA_RULES[t.priority].resolution;
    }).length;

    return {
      active: active.length,
      inProgress: inProgress.length,
      critical: critical.length,
      resolvedToday: resolvedToday.length,
      pctActive: Math.round((active.length / TICKETS.length) * 100),
      agentsInProgress,
      slaHealthPct:
        active.length === 0
          ? 100
          : Math.max(0, Math.round(((active.length - breaches) / active.length) * 100)),
    };
  }, []);

  const counts = useMemo(
    () => ({
      all: TICKETS.length,
      open: TICKETS.filter((t) => t.status === "open" || t.status === "in_progress").length,
      resolved: TICKETS.filter((t) => t.status === "resolved" || t.status === "closed").length,
    }),
    []
  );

  const slaRows = useMemo(() => {
    const now = new Date().getTime();
    const order: Priority[] = ["critical", "high", "medium", "low"];
    return order.map((p) => {
      const active = TICKETS.filter(
        (t) => t.priority === p && (t.status === "open" || t.status === "in_progress")
      );
      const pct = active.length
        ? Math.round(
            active.reduce((sum, t) => {
              const elapsed = (now - new Date(t.createdAt).getTime()) / 60000;
              return sum + Math.min(100, (elapsed / SLA_RULES[p].resolution) * 100);
            }, 0) / active.length
          )
        : 0;
      return { priority: p, count: active.length, pct };
    });
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
        subtitle="Monitor ticket volume, SLA health, and team workload in real time."
        actions={
          <Button asChild>
            <Link href="/tickets/new">
              <Plus />
              New Ticket
            </Link>
          </Button>
        }
      />
<div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Total Active Tickets"
          value={stats.active}
          accent="default"
          icon={<Ticket className="size-4.5" />}
          trend={`${stats.pctActive}% of queue`}
        />
        <MetricCard
          label="Critical SLA Breaches"
          value={stats.critical}
          accent="red"
          icon={<TriangleAlert className="size-4.5" />}
          trend="Needs triage"
          trendTone="negative"
        />
        <MetricCard
          label="In Progress"
          value={stats.inProgress}
          accent="sky"
          icon={<Clock className="size-4.5" />}
          trend={
            stats.agentsInProgress > 0
              ? `${stats.agentsInProgress} agent${stats.agentsInProgress > 1 ? "s" : ""} assigned`
              : "Unassigned"
          }
        />
        <MetricCard
          label="Resolved Today"
          value={stats.resolvedToday}
          accent="emerald"
          icon={<CircleCheck className="size-4.5" />}
          trend="+1 vs yesterday"
          trendTone="positive"
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section>
          <div className="mb-4">
            <h2 className="text-foreground text-lg font-semibold">Ticket queue</h2>
            <p className="text-muted-foreground text-sm">
              Search and filter across all active requests.
            </p>
          </div>
          <div className="space-y-4">
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
        </section>

        <aside className="flex flex-col gap-4">
          <Card className="p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-foreground text-sm font-semibold">SLA health</h3>
                <p className="text-muted-foreground mt-0.5 text-xs">
                  Elapsed vs resolution target on active tickets
                </p>
              </div>
              <span
                className={
                  stats.slaHealthPct >= 80
                    ? "text-emerald-400"
                    : stats.slaHealthPct >= 50
                      ? "text-amber-400"
                      : "text-red-400"
                }
              >
                <span className="text-2xl font-semibold tracking-tight">{stats.slaHealthPct}%</span>
                <span className="text-muted-foreground ml-0.5 text-xs">on target</span>
              </span>
            </div>
            <Progress value={stats.slaHealthPct} className="mt-4 h-2.5 bg-muted" />

            <div className="mt-6 space-y-4">
              {slaRows.map((row) => (
                <div key={row.priority}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground font-medium capitalize">
                      {row.priority}
                    </span>
                    <span className="text-muted-foreground/80">
                      {row.count} active · {row.pct}% elapsed
                    </span>
                  </div>
                  <Progress
                    value={row.pct}
                    className="mt-1.5 h-1.5 bg-muted/60"
                    indicatorClassName={PRIORITY_BAR[row.priority]}
                  />
                </div>
              ))}
            </div>
          </Card>
        </aside>
      </div>
    </AppShell>
  );
}