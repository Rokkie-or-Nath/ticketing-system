"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import AppShell from "@/components/AppShell";
import { CategoryBadge, PriorityBadge, StatusBadge } from "@/components/Badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
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
        <Card className="mx-auto mt-16 w-full max-w-md p-8 text-center">
          <h1 className="text-foreground text-2xl font-semibold">Record not found</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            The ticket{" "}
            <span className="font-mono">{id}</span> does not exist in the queue.
          </p>
          <Button asChild className="mt-6">
            <Link href="/tickets">Back to tickets</Link>
          </Button>
        </Card>
      </AppShell>
    );
  }

  const creator = userById(ticket.createdBy);
  const assignee = ticket.assignedTo ? userById(ticket.assignedTo) : null;
  const comments = COMMENTS.filter((c) => c.ticketId === ticket.id);
  const visibleComments = comments.filter((c) => showInternal || !c.isInternal);
  const activity = ACTIVITY.filter((a) => a.ticketId === ticket.id).sort(
    (a, b) => (a.createdAt > b.createdAt ? -1 : 1)
  );
  const sla = SLA_RULES[ticket.priority];

  return (
    <AppShell>
      <Button asChild variant="ghost" size="sm" className="-ml-2 gap-1.5 text-muted-foreground">
        <Link href="/tickets">
          <ArrowLeft className="size-4" />
          Back to tickets
        </Link>
      </Button>

      <div className="mt-4 flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-muted-foreground font-mono text-sm">{ticket.id}</span>
          <PriorityBadge priority={ticket.priority} />
          <StatusBadge status={ticket.status} />
          <CategoryBadge category={ticket.category} />
        </div>
        <h1 className="text-foreground text-2xl font-semibold tracking-tight">
          {ticket.subject}
        </h1>
        <p className="text-muted-foreground text-sm">
          Reported by {creator.name} · Assigned to{" "}
          {assignee ? (
            assignee.name
          ) : (
            <span className="text-destructive">Unassigned</span>
          )}{" "}
          · Updated {timeAgo(ticket.updatedAt)}
        </p>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-muted-foreground text-sm font-medium">
                Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground/90 text-sm leading-relaxed whitespace-pre-wrap">
                {ticket.description}
              </p>
            </CardContent>
          </Card>
<Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-muted-foreground text-sm font-medium">
                Comments · {visibleComments.length}
              </CardTitle>
              <label className="flex cursor-pointer select-none items-center gap-2 text-xs text-muted-foreground">
                <Switch checked={showInternal} onCheckedChange={setShowInternal} />
                Show internal notes
              </label>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {visibleComments.length === 0 && (
                <p className="text-muted-foreground py-4 text-sm">
                  No comments on this ticket yet.
                </p>
              )}
              {visibleComments.map((c) => {
                const u = userById(c.userId);
                return (
                  <div
                    key={c.id}
                    className={`rounded-lg border p-4 ${
                      c.isInternal
                        ? "border-sky-500/20 bg-sky-500/5"
                        : "bg-card/60 border-border"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Avatar className="size-6 text-[0.6rem]">
                        <AvatarFallback className="bg-secondary text-secondary-foreground">
                          {initials(u.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-foreground text-sm font-medium">{u.name}</span>
                      {c.isInternal && (
                        <Badge
                          variant="outline"
                          className="rounded-full border-sky-500/20 bg-sky-500/10 text-sky-400"
                        >
                          Internal
                        </Badge>
                      )}
                      <span className="text-muted-foreground ml-auto text-xs">
                        {timeAgo(c.createdAt)}
                      </span>
                    </div>
                    <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                      {c.message}
                    </p>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        <aside className="flex flex-col gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-muted-foreground text-sm font-medium">
                Details
              </CardTitle>
            </CardHeader>
<CardContent>
              <dl className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Status</dt>
                  <dd>
                    <StatusBadge status={ticket.status} />
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Priority</dt>
                  <dd>
                    <PriorityBadge priority={ticket.priority} />
                  </dd>
                </div>
                <Separator className="my-2" />
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Category</dt>
                  <dd className="text-foreground/90 capitalize">
                    {ticket.category}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Assignee</dt>
                  <dd className="text-foreground/90">
                    {assignee ? assignee.name : "Unassigned"}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Reporter</dt>
                  <dd className="text-foreground/90">{creator.name}</dd>
                </div>
                <Separator className="my-2" />
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Created</dt>
                  <dd className="text-foreground/90">{timeAgo(ticket.createdAt)}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Last updated</dt>
                  <dd className="text-foreground/90">{timeAgo(ticket.updatedAt)}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">SLA target</dt>
                  <dd className="text-foreground/90 font-mono text-xs">
                    {sla ? `${sla.response}m / ${sla.resolution}m` : "—"}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-muted-foreground text-sm font-medium">
                Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-4">
                {activity.map((a, idx) => (
                  <li key={a.id} className="relative pl-5">
                    {idx < activity.length - 1 && (
                      <span className="bg-border absolute top-3 -bottom-2 left-1.5 w-px" />
                    )}
                    <span className="bg-muted border-background absolute top-1 left-0 size-3 rounded-full border-2" />
                    <div>
                      <div className="text-foreground text-sm font-medium">
                        {ACTION_LABEL[a.actionType]}
                      </div>
                      <p className="text-muted-foreground text-xs">
                        {userById(a.actorId).name} · {timeAgo(a.createdAt)}
                      </p>
                      {(a.oldValue || a.newValue) && (
                        <p className="text-xs">
                          <span className="text-muted-foreground font-mono">
                            {a.oldValue ?? "—"}
                          </span>
                          <span className="text-muted-foreground/60 mx-1">{"→"}</span>
                          <span className="text-foreground/80 font-mono">
                            {a.newValue ?? "—"}
                          </span>
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </aside>
      </div>
    </AppShell>
  );
}