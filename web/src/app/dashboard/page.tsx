"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ChevronRight, CircleCheck, Clock, Plus, TriangleAlert, Users } from "lucide-react";
import AppShell from "@/components/AppShell";
import MetricCard from "@/components/MetricCard";
import PageHeader from "@/components/PageHeader";
import { DashboardSkeleton } from "@/components/Skeletons";
import TicketTable from "@/components/TicketTable";
import { SlaBadge, StatusBadge } from "@/components/Badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useTicketData } from "@/lib/useTicketData";
import { getSessionUser } from "@/lib/auth";
import { PRIORITY_ORDER, type Priority } from "@/data/mock";

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
  critical: "bg-destructive",
  high: "bg-warning",
  medium: "bg-info",
  low: "bg-success",
};

const PRIORITIES: Priority[] = ["critical", "high", "medium", "low"];

const FALLBACK_SLA: Record<Priority, { response: number; resolution: number }> = {
  critical: { response: 15, resolution: 240 },
  high: { response: 30, resolution: 480 },
  medium: { response: 120, resolution: 1440 },
  low: { response: 480, resolution: 2880 },
};

export default function DashboardPage() {
  const { tickets, sla, loading, error, refresh } = useTicketData(getSessionUser());
  const slaRules = sla ?? FALLBACK_SLA;
  const now = Date.now();

  const stats = useMemo(() => {
    const active = tickets.filter((t) => t.status === "open" || t.status === "in_progress");
    const atRisk = new Set(
      active
        .filter((t) => {
          const mins = (now - new Date(t.createdAt).getTime()) / 60000;
          return mins > slaRules[t.priority].resolution;
        })
        .map((t) => t.id)
    );
    const resolvedToday = tickets.filter(
      (t) => t.status === "resolved" && sameDay(t.resolvedAt)
    ).length;
    return {
      open: active.length,
      unassigned: active.filter((t) => !t.assignedTo).length,
      atRisk: atRisk.size,
      resolvedToday,
      atRiskIds: atRisk,
    };
  }, [tickets, slaRules, now]);

  const queueRows = useMemo(
    () =>
      tickets
        .filter((t) => t.status === "open" || t.status === "in_progress")
        .sort((a, b) => {
          const byPriority = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
          if (byPriority !== 0) return byPriority;
          return (b.updatedAt ?? b.createdAt).localeCompare(a.updatedAt ?? a.createdAt);
        })
        .slice(0, 8),
    [tickets]
  );

  const attention = useMemo(
    () =>
      tickets
        .filter((t) => {
          if (t.status !== "open" && t.status !== "in_progress") return false;
          return stats.atRiskIds.has(t.id) || !t.assignedTo || t.priority === "critical";
        })
        .sort((a, b) => {
          const aRisk = stats.atRiskIds.has(a.id) ? 0 : 1;
          const bRisk = stats.atRiskIds.has(b.id) ? 0 : 1;
          if (aRisk !== bRisk) return aRisk - bRisk;
          return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
        })
        .slice(0, 6),
    [tickets, stats]
  );

  const slaRows = useMemo(
    () =>
      PRIORITIES.map((p) => {
        const active = tickets.filter(
          (t) => t.priority === p && (t.status === "open" || t.status === "in_progress")
        );
        let pct = 0;
        if (active.length) {
          pct = Math.max(
            0,
            ...active.map((t) =>
              Math.min(100, Math.round(
                ((now - new Date(t.createdAt).getTime()) / 60000 /
                  slaRules[p].resolution) * 100
              ))
            )
          );
        }
        return { priority: p, count: active.length, pct };
      }),
    [tickets, slaRules, now]
  );

  const slaHealthPct =
    stats.open === 0
      ? 100
      : Math.max(0, Math.round(((stats.open - stats.atRisk) / stats.open) * 100));

  if (loading) {
    return (
      <AppShell>
        <DashboardSkeleton />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader
        eyebrow="Overview"
        title="Service desk"
        subtitle="Queue health and the tickets that need a response."
        actions={
          <>
            <Button variant="outline" size="sm" onClick={refresh}>
              Refresh
            </Button>
            <Button asChild size="sm">
              <Link href="/tickets/new">
                <Plus className="size-4" />
                New ticket
              </Link>
            </Button>
          </>
        }
      />

      {error && (
        <Card className="mt-4 border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </Card>
      )}

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard
          label="Open tickets"
          value={stats.open}
          icon={<Users className="size-4" />}
          trend={`${tickets.length} total`}
          accent="sky"
        />
        <MetricCard
          label="Unassigned"
          value={stats.unassigned}
          icon={<Clock className="size-4" />}
          trend={stats.unassigned > 0 ? "Needs triage" : "All assigned"}
          trendTone={stats.unassigned > 0 ? "negative" : "positive"}
          accent="amber"
        />
        <MetricCard
          label="SLA at risk"
          value={stats.atRisk}
          icon={<TriangleAlert className="size-4" />}
          trend={stats.atRisk > 0 ? "Act now" : "On target"}
          trendTone={stats.atRisk > 0 ? "negative" : "positive"}
          accent="red"
        />
        <MetricCard
          label="Resolved today"
          value={stats.resolvedToday}
          icon={<CircleCheck className="size-4" />}
          trend="Tracked by SLA"
          accent="emerald"
        />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-foreground">Priority queue</h2>
            <span className="text-xs text-muted-foreground">Highest-priority active requests</span>
          </div>
          <TicketTable tickets={queueRows} sla={slaRules} />
          <Button asChild variant="ghost" size="sm" className="mt-3 gap-1.5 text-muted-foreground">
            <Link href="/tickets">
              View full queue
              <ChevronRight className="size-4" />
            </Link>
          </Button>
        </section>

        <aside className="flex flex-col gap-4">
          <Card className="p-4">
            <h3 className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <TriangleAlert className="size-4 text-warning" />
              Needs attention
            </h3>
            <p className="text-muted-foreground mt-0.5 text-xs">
              Breaching SLA, unassigned, or critical
            </p>
            <ul className="mt-3 space-y-1">
              {attention.length === 0 && (
                <li className="text-xs text-muted-foreground/70 py-2">
                  All clear — nothing waiting on a response.
                </li>
              )}
              {attention.map((t) => {
                const tone = stats.atRiskIds.has(t.id)
                  ? ("breached" as const)
                  : t.priority === "critical"
                    ? ("at-risk" as const)
                    : ("on-track" as const);
                const label = stats.atRiskIds.has(t.id)
                  ? "SLA breach"
                  : t.priority === "critical"
                    ? "Critical"
                    : "Unassigned";
                return (
                  <li key={t.id}>
                    <Link
                      href={`/tickets/${t.id}`}
                      className="fx-row flex items-center gap-2 rounded-md px-2 py-2"
                    >
                      <StatusBadge status={t.status} />
                      <span className="min-w-0 flex-1 truncate text-xs font-medium text-foreground">
                        {t.subject}
                      </span>
                      <SlaBadge label={label} tone={tone} />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-foreground">SLA health</h3>
                <p className="text-muted-foreground mt-0.5 text-xs">Elapsed vs resolution target</p>
              </div>
              <span className={
                slaHealthPct >= 80 ? "text-success" : slaHealthPct >= 50 ? "text-warning" : "text-destructive"
              }>
                <span className="text-xl font-semibold tracking-tight">{slaHealthPct}%</span>
              </span>
            </div>
            <Progress value={slaHealthPct} className="mt-3 h-1.5 bg-muted" />
            <div className="mt-4 space-y-3">
              {slaRows.map((row) => (
                <div key={row.priority}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground font-medium capitalize">{row.priority}</span>
                    <span className="text-muted-foreground/70">
                      {row.count} active · {row.pct}% elapsed
                    </span>
                  </div>
                  <Progress
                    value={row.pct}
                    className="h-1.5 bg-muted/60"
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
