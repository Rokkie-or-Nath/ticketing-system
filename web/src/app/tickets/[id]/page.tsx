"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Paperclip, Trash2 } from "lucide-react";
import { toast } from "sonner";
import AppShell from "@/components/AppShell";
import { CategoryBadge, PriorityBadge, StatusBadge } from "@/components/Badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { timeAgo, type Priority, type Status } from "@/data/mock";
import {
  addComment,
  assignTicketToMe,
  attachmentUrl,
  deleteAttachment,
  fetchTicketSlaStatus,
  getTicketDetail,
  messageOf,
  uploadAttachment,
  userById,
  type Attachment,
  type SlaStatus,
  type TicketDetail,
} from "@/lib/api";

const ACTION_LABEL: Record<string, string> = {
  created: "Created",
  status_changed: "Status changed",
  priority_changed: "Priority changed",
  category_changed: "Category changed",
  assigned: "Assigned",
  reassigned: "Reassigned",
  comment_added: "Comment added",
  ticket_deleted: "Ticket deleted",
};

const ACTOR_LABEL: Record<string, string> = {
  status_changed: "Status",
  priority_changed: "Priority",
  category_changed: "Category",
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

function formatBytes(bytes: number): string {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  let i = 0;
  let n = bytes;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i++;
  }
  return `${n.toFixed(n >= 100 ? 0 : n >= 10 ? 1 : 2)} ${units[i]}`;
}

export default function TicketDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";

  const [detail, setDetail] = useState<TicketDetail | null>(null);
  const [sla, setSla] = useState<SlaStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInternal, setShowInternal] = useState(false);
  const [comment, setComment] = useState("");
  const [posting, setPosting] = useState(false);
  const [isInternal, setIsInternal] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    if (!id) return;
    try {
      const [d, s] = await Promise.all([
        getTicketDetail(id),
        fetchTicketSlaStatus(id).catch(() => null),
      ]);
      setDetail(d);
      setSla(s);
      setError(null);
    } catch (e) {
      setError(messageOf(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    setDetail(null);
    setSla(null);
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const ticket = detail?.ticket ?? null;
  const comments = detail?.comments ?? [];
  const visibleComments = comments.filter((c) => showInternal || !c.isInternal);
  const activity = (detail?.activity ?? []).sort((a, b) =>
    a.createdAt > b.createdAt ? -1 : 1
  );
  const creator = ticket ? userById(ticket.createdBy) : null;
  const assignee = ticket?.assignedTo ? userById(ticket.assignedTo) : null;

  const postComment = async () => {
    if (!comment.trim() || !ticket) return;
    setPosting(true);
    try {
      await addComment(ticket.id, comment.trim(), isInternal);
      setComment("");
      setIsInternal(false);
      await load();
      toast.success("Comment added");
    } catch (e) {
      toast.error(messageOf(e));
    } finally {
      setPosting(false);
    }
  };

  const changeStatus = async (status: Status) => {
    if (!ticket) return;
    const { updateTicket } = await import("@/lib/api");
    try {
      await updateTicket(ticket.id, { status });
      toast.success("Status updated");
      await load();
    } catch (e) {
      toast.error(messageOf(e));
    }
  };

  const changePriority = async (priority: Priority) => {
    if (!ticket) return;
    const { updateTicket } = await import("@/lib/api");
    try {
      await updateTicket(ticket.id, { priority });
      toast.success("Priority updated");
      await load();
    } catch (e) {
      toast.error(messageOf(e));
    }
  };

  const assignToMe = async () => {
    if (!ticket) return;
    try {
      await assignTicketToMe(ticket.id);
      toast.success("Ticket assigned to you");
      await load();
    } catch (e) {
      toast.error(messageOf(e));
    }
  };

  const onUpload = async (file?: File) => {
    if (!file || !ticket) return;
    setUploading(true);
    try {
      await uploadAttachment(ticket.id, file);
      toast.success("Attachment uploaded");
      await load();
    } catch (e) {
      toast.error(messageOf(e));
    } finally {
      setUploading(false);
    }
  };

  const removeAttachment = async (a: Attachment) => {
    try {
      await deleteAttachment(a.id);
      toast.success("Attachment removed");
      await load();
    } catch (e) {
      toast.error(messageOf(e));
    }
  };
  if (loading) {
    return (
      <AppShell>
        <p className="text-muted-foreground">Loading ticket...</p>
      </AppShell>
    );
  }

  if (error || !ticket) {
    return (
      <AppShell>
        <Card className="mx-auto mt-16 w-full max-w-md p-8 text-center">
          <h1 className="text-foreground text-2xl font-semibold">Record not found</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            The ticket <span className="font-mono">{id}</span> could not be loaded.
          </p>
          {error && <p className="text-muted-foreground mt-2 text-xs">{error}</p>}
          <Button asChild className="mt-6">
            <Link href="/tickets">Back to tickets</Link>
          </Button>
        </Card>
      </AppShell>
    );
  }

  const slaTarget = sla
    ? `${sla.responseTargetMinutes}m / ${sla.resolutionTargetMinutes}m`
    : null;

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
          {ticket.priority && <PriorityBadge priority={ticket.priority} />}
          <StatusBadge status={ticket.status} />
          <CategoryBadge category={ticket.category} />
        </div>
        <h1 className="text-foreground text-2xl font-semibold tracking-tight">
          {ticket.subject}
        </h1>
        <p className="text-muted-foreground text-sm">
          Reported by {creator?.name ?? "Unknown"} · Assigned to{" "}
          {assignee ? assignee.name : <span className="text-destructive">Unassigned</span>}{" "}
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
              {comments.length > 0 && (
                <label className="flex cursor-pointer select-none items-center gap-2 text-xs text-muted-foreground">
                  <Switch checked={showInternal} onCheckedChange={setShowInternal} />
                  Show internal notes
                </label>
              )}
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

              <div className="mt-2 space-y-2">
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment..."
                  rows={2}
                />
                <div className="flex items-center justify-between gap-2">
                  <label className="flex cursor-pointer select-none items-center gap-2 text-xs text-muted-foreground">
                    <Switch checked={isInternal} onCheckedChange={setIsInternal} />
                    Internal note
                  </label>
                  <Button
                    size="sm"
                    type="button"
                    onClick={() => void postComment()}
                    disabled={posting || !comment.trim()}
                  >
                    {posting ? "Posting..." : "Add comment"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-muted-foreground text-sm font-medium">
                Attachments · {detail?.attachments.length ?? 0}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {(detail?.attachments ?? []).length === 0 && (
                <p className="text-muted-foreground py-2 text-sm">
                  No attachments yet.
                </p>
              )}
              {(detail?.attachments ?? []).map((a) => (
                <div
                  key={a.id}
                  className="flex items-center gap-2 rounded-lg border p-3"
                >
                  <Paperclip className="text-muted-foreground size-4 shrink-0" />
                  <a
                    href={attachmentUrl(a.fileUrl)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary flex-1 truncate text-sm underline underline-offset-4 hover:text-primary/80"
                  >
                    {a.fileName}
                  </a>
                  <span className="text-muted-foreground text-xs">
                    {formatBytes(a.fileSize)}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive size-7"
                    onClick={() => void removeAttachment(a)}
                    title="Delete attachment"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              ))}
              <label className="cursor-pointer">
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => void onUpload(e.target.files?.[0])}
                />
                <Button variant="outline" size="sm" asChild disabled={uploading}>
                  <span className="gap-1.5">
                    <Paperclip className="size-4" />
                    {uploading ? "Uploading..." : "Attach a file"}
                  </span>
                </Button>
              </label>
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
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Status</dt>
                <Select value={ticket.status} onValueChange={(v) => void changeStatus(v as Status)}>
                  <SelectTrigger className="h-8 w-[150px] text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-50">
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Priority</dt>
                <Select value={ticket.priority} onValueChange={(v) => void changePriority(v as Priority)}>
                  <SelectTrigger className="h-8 w-[150px] text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-50">
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Category</span>
                <span className="text-foreground/90 capitalize">{ticket.category}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Assignee</span>
                <span className="text-foreground/90">
                  {assignee ? assignee.name : "Unassigned"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Reporter</span>
                <span className="text-foreground/90">{creator?.name ?? "Unknown"}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Created</span>
                <span className="text-foreground/90">{timeAgo(ticket.createdAt)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Last updated</span>
                <span className="text-foreground/90">{timeAgo(ticket.updatedAt)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">SLA target</span>
                <span className="text-foreground/90 font-mono text-xs">
                  {slaTarget ?? "--"}
                </span>
              </div>
              {sla && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Resolution left</span>
                  <span
                    className={
                      sla.resolutionBreached
                        ? "text-destructive font-medium"
                        : "text-foreground/90 font-mono text-xs"
                    }
                  >
                    {sla.resolutionBreached
                      ? "Breached"
                      : sla.resolutionRemainingMinutes === null
                        ? "Done"
                        : `${sla.resolutionRemainingMinutes}m`}
                  </span>
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => void assignToMe()}
              >
                Assign to me
              </Button>
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
                        {ACTION_LABEL[a.actionType] ?? a.actionType}
                      </div>
                      <p className="text-muted-foreground text-xs">
                        {userById(a.actorId).name} · {timeAgo(a.createdAt)}
                      </p>
                      {a.oldValue !== null && a.newValue !== null && (
                        <p className="text-xs">
                          <span className="text-muted-foreground font-mono">
                            {ACTOR_LABEL[a.actionType] ?? "Value"}: {a.oldValue}
                          </span>
                          <span className="text-muted-foreground/60 mx-1">→</span>
                          <span className="text-foreground/80 font-mono">
                            {a.newValue}
                          </span>
                        </p>
                      )}
                    </div>
                  </li>
                ))}
                {activity.length === 0 && (
                  <li className="text-muted-foreground text-sm">No activity recorded.</li>
                )}
              </ol>
            </CardContent>
          </Card>
        </aside>
      </div>
    </AppShell>
  );
}