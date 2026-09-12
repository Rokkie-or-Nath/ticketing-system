"use client";

import Link from "next/link";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
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
import { PRIORITY_LABEL, type Category, type Priority } from "@/data/mock";
import { createTicket as apiCreateTicket, messageOf } from "@/lib/api";

const CATEGORIES: Category[] = ["hardware", "software", "network", "access", "other"];

const PRIORITIES: Priority[] = ["low", "medium", "high", "critical"];

const PRIORITY_HINT: Record<Priority, string> = {
  low: "Non-urgent",
  medium: "Normal workload",
  high: "Impacts productivity",
  critical: "System down / severe",
};

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
      const created = await apiCreateTicket({
        subject,
        description,
        category,
        priority,
      });
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
        title="New Ticket"
        subtitle="Describe the issue and we'll route it to the right team."
        center
      />

      {submitted ? (
        <Card className="mx-auto mt-10 w-full max-w-2xl p-8 text-center">
          <span className="bg-emerald-500/15 text-emerald-400 mx-auto flex size-12 items-center justify-center rounded-full">
            <CheckCircle2 className="size-6" />
          </span>
          <h2 className="text-foreground mt-5 text-xl font-semibold tracking-tight">
            Ticket created
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            <span className="font-mono">{createdId}</span> has been logged and routed for triage.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Button asChild>
              <Link href="/tickets">View queue</Link>
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setSubmitted(false);
                setSubject("");
                setDescription("");
                setCategory("hardware");
                setPriority("medium");
              }}
            >
              Create another
            </Button>
          </div>
        </Card>
      ) : (
        <form
          onSubmit={createTicket}
          className="mx-auto mt-8 w-full max-w-2xl space-y-6 sm:max-w-3xl"
        >
          <Card className="p-6">
            <CardContent className="p-0">
              <div className="grid gap-5 sm:grid-cols-2">
<div className="sm:col-span-2">
                  <Label htmlFor="subject" className="text-foreground">
                    Subject
                  </Label>
                  <Input
                    id="subject"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Laptop won't boot after update"
                    className="mt-1.5 h-10"
                  />
                </div>

                <div className="sm:col-span-2">
                  <Label htmlFor="description" className="text-foreground">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={5}
                    placeholder="Steps to reproduce, error messages, affected systems..."
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label className="text-foreground">Category</Label>
                  <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
                    <SelectTrigger className="mt-1.5 h-10 capitalize">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="z-50">
                      {CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c} className="capitalize">
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-foreground">Priority</Label>
                  <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
                    <SelectTrigger className="mt-1.5 h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="z-50">
                      {PRIORITIES.map((p) => (
                        <SelectItem key={p} value={p}>
                          {PRIORITY_LABEL[p]} — {PRIORITY_HINT[p]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-center gap-3">
            <Button asChild type="button" variant="outline">
              <Link href="/tickets">Cancel</Link>
            </Button>
            <Button type="submit" className="px-6" disabled={busy}>
              {busy ? "Creating..." : "Create ticket"}
            </Button>
          </div>
        </form>
      )}
    </AppShell>
  );
}