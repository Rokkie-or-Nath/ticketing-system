"use client";

import Link from "next/link";
import { useState } from "react";
import { AlertCircle, ArrowDown, ArrowRight, ArrowUp, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import AppShell from "@/components/AppShell";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { type Category, type Priority } from "@/data/mock";
import { createTicket as apiCreateTicket, messageOf } from "@/lib/api";

const CATEGORIES: { value: Category; label: string }[] = [
  { value: "hardware", label: "Hardware" },
  { value: "software", label: "Software" },
  { value: "network", label: "Network" },
  { value: "access", label: "Access" },
  { value: "other", label: "Other" },
];

const PRIORITY_OPTIONS: {
  value: Priority;
  label: string;
  hint: string;
  icon: React.ReactNode;
  classes: string;
  activeClasses: string;
}[] = [
  {
    value: "low",
    label: "Low",
    hint: "Non-urgent, no productivity impact",
    icon: <ArrowDown className="size-4" />,
    classes: "border-border hover:border-success/50",
    activeClasses: "border-success/60 bg-success/8 ring-1 ring-success/30",
  },
  {
    value: "medium",
    label: "Medium",
    hint: "Normal workload, some impact",
    icon: <ArrowRight className="size-4" />,
    classes: "border-border hover:border-info/50",
    activeClasses: "border-info/60 bg-info/8 ring-1 ring-info/30",
  },
  {
    value: "high",
    label: "High",
    hint: "Impacts productivity significantly",
    icon: <ArrowUp className="size-4" />,
    classes: "border-border hover:border-warning/50",
    activeClasses: "border-warning/60 bg-warning/8 ring-1 ring-warning/30",
  },
  {
    value: "critical",
    label: "Critical",
    hint: "System down or severe outage",
    icon: <AlertCircle className="size-4" />,
    classes: "border-border hover:border-destructive/50",
    activeClasses: "border-destructive/60 bg-destructive/8 ring-1 ring-destructive/30",
  },
];

const DESC_MAX = 2000;

export default function NewTicketPage() {
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<Category>("hardware");
  const [priority, setPriority] = useState<Priority>("medium");
  const [submitted, setSubmitted] = useState(false);
  const [createdId, setCreatedId] = useState("");
  const [busy, setBusy] = useState(false);

  const createTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const created = await apiCreateTicket({ subject, description, category, priority });
      setCreatedId(created.id);
      setSubmitted(true);
      toast.success("Ticket created", {
        description: `${created.id} has been logged and routed for triage.`,
      });
    } catch (err) {
      toast.error(messageOf(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppShell>
      <PageHeader
        eyebrow="New request"
        title="Report an issue"
        subtitle="Describe the problem and we'll route it to the right team."
        center
      />

      {submitted ? (
        <Card className="mx-auto mt-10 w-full max-w-lg p-8 text-center">
          <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-success/15 text-success">
            <CheckCircle2 className="size-6" />
          </span>
          <h2 className="mt-5 text-lg font-semibold tracking-tight text-foreground">
            Ticket submitted
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            <span className="font-mono text-foreground">{createdId}</span> has been logged and routed for triage.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Button asChild size="sm">
              <Link href="/tickets">View queue</Link>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSubmitted(false);
                setSubject("");
                setDescription("");
                setCategory("hardware");
                setPriority("medium");
              }}
            >
              Submit another
            </Button>
          </div>
        </Card>
      ) : (
        <form onSubmit={createTicket} className="mx-auto mt-8 w-full max-w-2xl space-y-5">
          <Card>
            <CardContent className="p-6 space-y-5">
              {/* Subject */}
              <div className="space-y-1.5">
                <Label htmlFor="subject" className="text-xs font-medium">Subject</Label>
                <Input
                  id="subject"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Laptop won't boot after update"
                  className="h-9 text-sm"
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="description" className="text-xs font-medium">Description</Label>
                  <span className={cn(
                    "text-[0.65rem] tabular-nums",
                    description.length > DESC_MAX * 0.9 ? "text-warning" : "text-muted-foreground"
                  )}>
                    {description.length} / {DESC_MAX}
                  </span>
                </div>
                <Textarea
                  id="description"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value.slice(0, DESC_MAX))}
                  rows={5}
                  placeholder="Steps to reproduce, error messages, affected systems…"
                  className="text-sm resize-none"
                />
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Category</Label>
                <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value} className="text-sm">
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Priority — visual radio cards */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Priority</Label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {PRIORITY_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setPriority(opt.value)}
                      className={cn(
                        "flex flex-col items-start gap-1.5 rounded-lg border p-3 text-left transition-all",
                        priority === opt.value ? opt.activeClasses : opt.classes
                      )}
                    >
                      <span className={cn(
                        "flex size-7 items-center justify-center rounded-md",
                        priority === opt.value ? "bg-current/10" : "bg-muted"
                      )}>
                        {opt.icon}
                      </span>
                      <span className="text-xs font-semibold text-foreground">{opt.label}</span>
                      <span className="text-[0.65rem] text-muted-foreground leading-snug">{opt.hint}</span>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-center gap-3">
            <Button asChild type="button" variant="outline" size="sm">
              <Link href="/tickets">Cancel</Link>
            </Button>
            <Button type="submit" size="sm" className="px-6" disabled={busy}>
              {busy ? "Creating…" : "Create ticket"}
            </Button>
          </div>
        </form>
      )}
    </AppShell>
  );
}
