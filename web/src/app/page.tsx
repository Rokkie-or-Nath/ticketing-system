"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  CheckCircle2,
  Cpu,
  Gauge,
  HardDrive,
  KeyRound,
  Laptop,
  Network,
  Search,
  ShieldCheck,
  Timer,
  TriangleAlert,
  Users,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { usePageTransition } from "@/components/PageTransition";
import PageContainer from "@/components/PageContainer";
import { TicketListHeader, TicketRow } from "@/components/TicketRow";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getToken } from "@/lib/auth";
import { fetchSlaRules, listTickets, userById } from "@/lib/api";
import type { Ticket as TicketType } from "@/data/mock";
import { SLA_RULES as MOCK_SLA, TICKETS as MOCK_TICKETS } from "@/data/mock";

const CATEGORIES: {
  key: string;
  title: string;
  blurb: string;
  icon: React.ReactNode;
  accent: string;
}[] = [
  {
    key: "hardware",
    title: "Hardware",
    blurb: "Laptops, docks, displays, peripherals",
    icon: <Laptop className="size-4.5" />,
    accent: "bg-sky-500/12 text-sky-400 border-sky-500/20",
  },
  {
    key: "software",
    title: "Software",
    blurb: "Licenses, installs, apps misbehaving",
    icon: <Cpu className="size-4.5" />,
    accent: "bg-violet-500/12 text-violet-400 border-violet-500/20",
  },
  {
    key: "network",
    title: "Network",
    blurb: "Wi-Fi, VPN, connectivity drops",
    icon: <Network className="size-4.5" />,
    accent: "bg-cyan-500/12 text-cyan-400 border-cyan-500/20",
  },
  {
    key: "access",
    title: "Access",
    blurb: "Accounts, permissions, MFA resets",
    icon: <KeyRound className="size-4.5" />,
    accent: "bg-amber-500/12 text-amber-400 border-amber-500/20",
  },
  {
    key: "other",
    title: "Other",
    blurb: "Anything else the desk handles",
    icon: <Gauge className="size-4.5" />,
    accent: "bg-slate-500/15 text-slate-300 border-slate-500/20",
  },
];

export default function PortalPage() {
  const navigate = usePageTransition();
  const [tickets, setTickets] = useState<TicketType[]>(MOCK_TICKETS);
  const [slaRules, setSlaRules] = useState(MOCK_SLA);
  const [live, setLive] = useState(false);
  const [trackerId, setTrackerId] = useState("");

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

  const stats = useStats(tickets, slaRules);
  const recent = [...tickets]
    .sort((a, b) => (b.updatedAt ?? b.createdAt).localeCompare(a.createdAt))
    .slice(0, 6);

  const track = (e: FormEvent) => {
    e.preventDefault();
    const id = trackerId.trim();
    if (!id) return;
    if (/^TK-\d+$/i.test(id)) {
      navigate(`/tickets/${id.toUpperCase()}`);
      setTrackerId("");
    } else {
      toast.error("Ticket IDs use the TK-0000 format", {
        description: "Example: TK-1042",
      });
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden text-foreground">
      <header className="relative z-10 pt-5">
        <PageContainer className="flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <span className="bg-primary text-primary-foreground flex size-7 items-center justify-center rounded-md">
            <ShieldCheck className="size-4" />
          </span>
          <span className="text-foreground text-sm font-semibold tracking-tight">
            TICKETNET
          </span>
          <span className="text-muted-foreground/70 text-xs">IT Helpdesk</span>
        </Link>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="gap-1.5 rounded-full px-3 py-1 text-xs font-medium text-foreground/70"
          >
            <span className="relative flex size-1.5">
              <span className="bg-emerald-500 absolute inline-flex h-full w-full animate-ping rounded-full opacity-60" />
              <span className="bg-emerald-500 relative inline-flex size-1.5 rounded-full" />
            </span>
            {live ? "API connected" : "Demo data"}
          </Badge>
          <Button size="sm" onClick={() => navigate("/login")}>
            Sign in
          </Button>
        </div>
        </PageContainer>
      </header>

      <main className="relative z-10 flex-1 py-8">
        <PageContainer>
        <section className="grid gap-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:items-start">
          <div>
            <Badge
              variant="outline"
              className="inline-flex items-center gap-1.5 rounded-full border-sky-500/20 bg-sky-500/10 px-2.5 py-0.5 text-xs font-medium text-sky-300"
            >
              <CheckCircle2 className="size-3.5" />
              Internal IT request desk
            </Badge>
            <h1 className="text-foreground mt-4 text-3xl font-semibold tracking-tight">
              Report an issue.
              <br />
              Follow it to resolution.
            </h1>
            <p className="text-muted-foreground mt-3 max-w-2xl text-sm leading-relaxed">
              Log hardware, software, network, and access requests here. Every ticket
              is triaged against an SLA and tracked until it closes — no email
              threads, no lost follow-ups.
            </p>

            <form onSubmit={track} className="mt-6">
              <label
                htmlFor="tracker"
                className="text-muted-foreground block text-xs font-medium"
              >
                Track an existing ticket
              </label>
              <div className="mt-1.5 flex items-center gap-2">
                <div className="relative min-w-0 flex-1">
                  <Search className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2" />
                  <Input
                    id="tracker"
                    value={trackerId}
                    onChange={(e) => setTrackerId(e.target.value)}
                    placeholder="Ticket ID, e.g. TK-1041"
                    className="h-11 pl-9"
                  />
                </div>
                <Button type="submit" className="h-11 shrink-0 px-5">
                  Track
                </Button>
              </div>
            </form>

            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              <span>New here?</span>
              <button
                type="button"
                className="text-primary font-medium underline underline-offset-4 hover:text-primary/80"
                onClick={() => navigate("/tickets/new")}
              >
                Sign in to submit a request
              </button>
            </div>
          </div>

          <Card className="fx-card p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-foreground text-sm font-semibold">Queue status</h2>
              <span className="text-muted-foreground text-xs">
                {live ? "live" : "demo"}
              </span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2.5">
              <StatusStat
                icon={<Users className="size-4" />}
                label="Open now"
                value={stats.openNow}
                tone="text-foreground"
              />
              <StatusStat
                icon={<TriangleAlert className="size-4" />}
                label="SLA at risk"
                value={stats.atRisk}
                tone={stats.atRisk > 0 ? "text-destructive" : "text-emerald-400"}
              />
              <StatusStat
                icon={<HardDrive className="size-4" />}
                label="Unassigned"
                value={stats.unassigned}
                tone="text-warning"
              />
              <StatusStat
                icon={<CheckCircle2 className="size-4" />}
                label="Resolved today"
                value={stats.resolvedToday}
                tone="text-foreground"
              />
            </div>

            <div className="mt-5 border-t border-border pt-3">
              <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Timer className="size-3.5" />
                SLA targets
              </p>
              <div className="mt-1.5 space-y-1.5 text-xs">
                {(["critical", "high", "medium", "low"] as const).map((p) => (
                  <div key={p} className="flex items-center justify-between">
                    <span className="text-muted-foreground capitalize">{p}</span>
                    <span className="text-foreground/80 font-mono">
                      {fmtSla(slaRules[p].response)} / {fmtSla(slaRules[p].resolution)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </section>

        <section className="mt-10">
          <h2 className="text-foreground text-lg font-semibold tracking-tight">
            What do you need help with?
          </h2>
          <div className="mt-4 grid gap-3 grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                type="button"
                onClick={() => navigate("/tickets/new")}
                className="fx-card fx-row group flex flex-col items-start gap-2.5 rounded-lg border border-border bg-card p-3.5 text-left"
              >
                <span
                  className={`flex size-8 items-center justify-center rounded-md border ${cat.accent}`}
                >
                  {cat.icon}
                </span>
                <span className="text-foreground text-sm font-semibold">{cat.title}</span>
                <span className="text-muted-foreground text-xs leading-snug">
                  {cat.blurb}
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <div className="flex items-center justify-between">
            <h2 className="text-foreground text-lg font-semibold tracking-tight">
              Recently updated requests
            </h2>
            <span className="text-muted-foreground text-xs">
              {stats.openNow} open · {stats.atRisk} at risk
            </span>
          </div>
          <Card className="mt-4 overflow-hidden">
            <TicketListHeader />
            <div aria-label="Recently updated requests" className="divide-y divide-border">
              {recent.map((t) => {
                const assignee = t.assignedTo ? userById(t.assignedTo) : null;
                return (
                  <TicketRow
                    key={t.id}
                    id={t.id}
                    status={t.status}
                    subject={t.subject}
                    priority={t.priority}
                    assigneeName={assignee?.name ?? null}
                  />
                );
              })}
            </div>
          </Card>
          <p className="text-muted-foreground/80 mt-3 text-center text-xs">
            Requests shown are public. Sign in to work the full queue.
          </p>
        </section>
        </PageContainer>
      </main>

      <footer className="border-t border-border py-5">
        <PageContainer>
          <p className="text-muted-foreground/70 text-center text-xs">
            TICKETNET · Internal IT helpdesk · Built with Next.js and a live Express API
          </p>
        </PageContainer>
      </footer>
    </div>
  );
}

/** Derived queue stats for the portal status board. */
function useStats(
  tickets: TicketType[],
  slaRules: Record<string, { response: number; resolution: number }>
) {
  const now = Date.now();
  let openNow = 0;
  let atRisk = 0;
  let unassigned = 0;
  let resolvedToday = 0;
  for (const t of tickets) {
    const active = t.status === "open" || t.status === "in_progress";
    if (active) openNow++;
    if (active && !t.assignedTo) unassigned++;
    if (active) {
      const mins = (now - new Date(t.createdAt).getTime()) / 60000;
      if (mins > slaRules[t.priority].resolution) atRisk++;
    }
    if (t.resolvedAt) {
      const d = new Date(t.resolvedAt);
      const n = new Date();
      if (
        d.getUTCFullYear() === n.getUTCFullYear() &&
        d.getUTCMonth() === n.getUTCMonth() &&
        d.getUTCDate() === n.getUTCDate()
      ) {
        resolvedToday++;
      }
    }
  }
  return { openNow, atRisk, unassigned, resolvedToday };
}

function StatusStat({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-muted/25 p-3">
      <div className="flex items-center gap-1.5 text-[0.65rem] text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      <p className={`mt-1 text-xl font-semibold tracking-tight ${tone}`}>{value}</p>
    </div>
  );
}

function fmtSla(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = minutes / 60;
  return h < 24 ? `${h}h` : `${Math.round(h / 24)}d`;
}