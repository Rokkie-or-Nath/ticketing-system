"use client";

import { useMemo } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Ticket,
  Users,
  Zap,
} from "lucide-react";
import { usePageTransition } from "@/components/PageTransition";
import { PriorityBadge, StatusBadge } from "@/components/Badge";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { getToken } from "@/lib/auth";
import { fetchSlaRules, listTickets, userById } from "@/lib/api";
import type { Ticket as TicketType } from "@/data/mock";
import { SLA_RULES as MOCK_SLA, TICKETS as MOCK_TICKETS } from "@/data/mock";

const ROLES = [
  {
    key: "EMPLOYEE",
    title: "Employee",
    tagline: "Report issues & follow up",
    permissions: "Create tickets · Track status · Comment & attach files",
    avatar: "EM",
    chip: "bg-sky-500/10 text-sky-300 ring-sky-500/20",
    ring: "hover:border-sky-500/40",
  },
  {
    key: "AGENT",
    title: "Agent",
    tagline: "Triage the queue",
    permissions: "Own queue · Assign & resolve · Internal notes",
    avatar: "AG",
    chip: "bg-amber-500/10 text-amber-300 ring-amber-500/20",
    ring: "hover:border-amber-500/40",
  },
  {
    key: "ADMIN",
    title: "Admin",
    tagline: "Own the platform",
    permissions: "Users & roles · SLA rules · Platform analytics",
    avatar: "AD",
    chip: "bg-emerald-500/10 text-emerald-300 ring-emerald-500/20",
    ring: "hover:border-emerald-500/40",
  },
];

const FEATURES = [
  {
    icon: <Ticket className="size-4.5" />,
    title: "File & track",
    body: "Submit hardware, software, network, and access requests in seconds — then follow every update from one timeline.",
    accent: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  },
  {
    icon: <Zap className="size-4.5" />,
    title: "Triage & resolve",
    body: "Agents work an SLA-aware queue with full context: assignments, priority, internal notes, and a complete audit trail.",
    accent: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  },
  {
    icon: <Activity className="size-4.5" />,
    title: "Monitor SLA",
    body: "Response and resolution targets are checked live. Breaches surface instantly, so nothing quietly slips.",
    accent: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
];
export default function WelcomePage() {
  const navigate = usePageTransition();
  const [tickets, setTickets] = useState<TicketType[]>(MOCK_TICKETS);
  const [slaRules, setSlaRules] = useState(MOCK_SLA);
  const [live, setLive] = useState(false);

  useEffect(() => {
    if (!getToken()) return;
    let cancelled = false;
    (async () => {
      try {
        const [rows, rules] = await Promise.all([listTickets(), fetchSlaRules()]);
        if (cancelled) return;
        setTickets(rows.data.length ? rows.data : MOCK_TICKETS);
        setSlaRules(rules ?? MOCK_SLA);
        setLive(true);
      } catch {
        if (!cancelled) setTickets(MOCK_TICKETS);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = useMemo(() => {
    const active = tickets.filter(
      (t) => t.status === "open" || t.status === "in_progress"
    );
    const latest = Math.max(...tickets.map((t) => new Date(t.createdAt).getTime()));
    const breaches = active.filter((t) => {
      const mins = (latest - new Date(t.createdAt).getTime()) / 60000;
      return mins > slaRules[t.priority].resolution;
    }).length;
    return {
      active: active.length,
      critical: active.filter((t) => t.priority === "critical").length,
      resolved: tickets.filter(
        (t) => t.status === "resolved" || t.status === "closed"
      ).length,
      agents: new Set(tickets.map((t) => t.assignedTo).filter(Boolean)).size,
      slaHealth:
        active.length === 0
          ? 100
          : Math.max(0, Math.round(((active.length - breaches) / active.length) * 100)),
    };
  }, [tickets, slaRules]);

  const METRICS = [
    { icon: <Ticket className="size-4" />, label: "Active tickets", value: stats.active, note: "in the queue" },
    { icon: <AlertTriangle className="size-4" />, label: "Critical open", value: stats.critical, note: "need triage now" },
    { icon: <CheckCircle2 className="size-4" />, label: "Resolved", value: stats.resolved, note: "total closed" },
    { icon: <ShieldCheck className="size-4" />, label: "SLA health", value: `${stats.slaHealth}%`, note: "on target" },
  ];

  const preview = tickets.slice(0, 4);

  const pickRole = (key: string) => {
    void key;
    navigate("/login");
  };

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden text-foreground">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[560px] [background:radial-gradient(62%_52%_at_50%_0%,rgba(56,189,248,0.13),transparent)]"
      />

      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-6 pt-6">
        <div className="flex items-center gap-2.5">
          <span className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-lg text-xs font-bold ring-1 ring-inset ring-white/10">
            TN
          </span>
          <span className="text-foreground text-sm font-semibold tracking-tight">TICKETNET</span>
        </div>
        <Badge
          variant="outline"
          className="gap-1.5 rounded-full px-3 py-1 text-xs font-medium text-foreground/70"
        >
          <span className="relative flex size-1.5">
            <span className="bg-emerald-500 absolute inline-flex h-full w-full animate-ping rounded-full opacity-60" />
            <span className="bg-emerald-500 relative inline-flex size-1.5 rounded-full" />
          </span>
          {live ? "Live API" : "Demo data"}
        </Badge>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-6xl flex-1 px-6 pb-16 pt-12 lg:pt-16">
        {/* Hero */}
        <section className="fx-rise mx-auto max-w-3xl text-center">
          <Badge
            variant="outline"
            className="inline-flex items-center gap-2 rounded-full border-sky-500/20 bg-sky-500/10 px-3 py-1 text-xs font-medium text-sky-300"
          >
            <CheckCircle2 className="size-3.5" />
            Internal IT helpdesk
          </Badge>
          <h1 className="text-foreground mt-6 text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
            Your IT requests,{" "}
            <span className="from-sky-400 via-indigo-400 to-emerald-400 bg-gradient-to-r bg-clip-text text-transparent">
              under control.
            </span>
          </h1>
          <p className="text-muted-foreground mx-auto mt-5 max-w-xl text-base leading-relaxed sm:text-lg">
            TICKETNET turns every hardware snag, software bug, network drop,
            and access request into a tracked, triaged, SLA-managed ticket — so
            nothing slips through the cracks.
          </p>
        </section>

        {/* Metrics */}
        <section
          className="fx-rise mt-14 grid grid-cols-2 gap-3 lg:grid-cols-4"
          style={{ animationDelay: "90ms" }}
        >
{METRICS.map((m) => (
            <Card key={m.label} className="fx-card p-4">
              <span className="bg-secondary text-muted-foreground flex size-8 items-center justify-center rounded-lg border border-slate-700/60">
                {m.icon}
              </span>
              <div className="text-foreground mt-3 text-2xl font-semibold">{m.value}</div>
              <div className="text-muted-foreground mt-0.5 text-sm font-medium">{m.label}</div>
              <div className="text-muted-foreground/60 text-xs">{m.note}</div>
            </Card>
          ))}
        </section>
{/* Features */}
        <section
          className="fx-rise mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
          style={{ animationDelay: "140ms" }}
        >
          {FEATURES.map((f) => (
            <Card key={f.title} className="fx-card p-5">
              <span
                className={`flex size-9 items-center justify-center rounded-lg border ${f.accent}`}
              >
                {f.icon}
              </span>
              <h3 className="text-foreground mt-4 text-sm font-semibold">{f.title}</h3>
              <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">{f.body}</p>
            </Card>
          ))}
        </section>

        {/* Role picker */}
        <section className="fx-rise mt-16 text-center" style={{ animationDelay: "190ms" }}>
          <h2 className="text-foreground text-xl font-semibold tracking-tight sm:text-2xl">
            Enter the demo
          </h2>
          <p className="text-muted-foreground mx-auto mt-2 max-w-md text-sm">
            Sign in with a real account to explore the queue.
          </p>
          <div className="mt-8 grid gap-3 text-left sm:grid-cols-2 lg:grid-cols-3">
            {ROLES.map((role) => (
              <button
                key={role.key}
                type="button"
                onClick={() => pickRole(role.key)}
                className={`fx-row fx-card group w-full rounded-xl border border-slate-800 bg-card p-4 text-left transition-colors focus:border-slate-600 ${role.ring}`}
              >
                <span className="flex items-center gap-3">
                  <span
                    className={`flex size-10 items-center justify-center rounded-lg text-sm font-semibold ring-1 ring-inset ${role.chip}`}
                  >
                    {role.avatar}
                  </span>
                  <span className="flex-1">
                    <span className="text-foreground block text-sm font-semibold">{role.title}</span>
                    <span className="text-muted-foreground block text-xs">{role.tagline}</span>
                  </span>
                  <ChevronRight className="text-muted-foreground group-hover:text-foreground size-4 transition-colors" />
                </span>
                <span className="text-muted-foreground mt-3 block text-xs leading-relaxed">
                  {role.permissions}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Live queue preview */}
        <section className="fx-rise mt-16" style={{ animationDelay: "240ms" }}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-foreground text-lg font-semibold tracking-tight">Live queue</h2>
              <p className="text-muted-foreground mt-0.5 text-sm">
                Real request flow from the demo dataset.
              </p>
            </div>
            <span className="flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs text-muted-foreground">
              <Users className="size-3.5" />
              {stats.agents} agents assigned
            </span>
          </div>

          <Card className="mt-5 overflow-hidden">
            <div className="divide-y divide-border">
              {preview.map((t) => {
                const assignee = t.assignedTo ? userById(t.assignedTo) : null;
                return (
                  <div key={t.id} className="flex items-center gap-4 px-5 py-3.5">
                    <span className="text-muted-foreground font-mono text-xs">{t.id}</span>
                    <span className="text-foreground flex-1 truncate text-sm font-medium">
                      {t.subject}
                    </span>
                    <span className="hidden sm:block">
                      <PriorityBadge priority={t.priority} />
                    </span>
                    <StatusBadge status={t.status} />
                    <span className="text-muted-foreground hidden w-24 text-right text-xs md:block">
                      {assignee ? assignee.name : "Unassigned"}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>
          <p className="text-muted-foreground/70 mt-3 text-center text-xs">
            Sign in to open the full queue as that role.
          </p>
        </section>
      </main>

      <footer className="relative z-10 border-t border-border py-6">
        <p className="text-muted-foreground/60 mx-auto max-w-6xl px-6 text-center text-xs">
          TICKETNET. Built with Next.js and a live Express API.
        </p>
      </footer>
    </div>
  );
}