"use client";

import Link from "next/link";
import { useState } from "react";
import AppShell from "@/components/AppShell";
import PageHeader from "@/components/PageHeader";
import { CheckCircleIcon } from "@/components/icons";
import { PRIORITY_LABEL, type Category, type Priority } from "@/data/mock";

const CATEGORIES: Category[] = ["hardware", "software", "network", "access", "other"];

const PRIORITIES: { key: Priority; hint: string }[] = [
  { key: "low", hint: "Non-urgent" },
  { key: "medium", hint: "Normal workload" },
  { key: "high", hint: "Impacts productivity" },
  { key: "critical", hint: "System down / severe" },
];

const PRIORITY_ACTIVE: Record<Priority, string> = {
  low: "border-emerald-500/40 bg-emerald-500/5 text-emerald-400",
  medium: "border-sky-500/40 bg-sky-500/5 text-sky-400",
  high: "border-amber-500/40 bg-amber-500/5 text-amber-400",
  critical: "border-red-500/40 bg-red-500/5 text-red-400",
};

const INPUT_CLS =
  "h-10 w-full rounded-lg border border-slate-800 bg-slate-950/60 px-3.5 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-slate-600 focus:ring-2 focus:ring-sky-500/20 lg:h-11 lg:px-4 lg:text-base";

export default function NewTicketPage() {
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<Category>("hardware");
  const [priority, setPriority] = useState<Priority>("medium");
  const [submitted, setSubmitted] = useState(false);

  const createTicket = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <AppShell>
      <PageHeader
        title="New Ticket"
        subtitle="Describe the issue and we'll route it to the right team."
        center
      />

      {submitted ? (
        <div className="fx-card border-emerald-500/20 bg-emerald-500/5 mx-auto mt-8 w-full max-w-2xl rounded-xl border p-6 sm:max-w-3xl lg:max-w-4xl lg:p-8 2xl:max-w-5xl">
          <div className="flex items-center gap-3">
            <span className="text-emerald-400 flex size-10 items-center justify-center rounded-full bg-emerald-500/10">
              <CheckCircleIcon className="size-5" />
            </span>
            <div>
              <h2 className="text-white text-lg font-semibold">Ticket created</h2>
              <p className="text-emerald-400 text-sm">
                <span className="font-mono">TK-1045</span> has been logged and routed for triage.
              </p>
            </div>
          </div>
          <div className="mt-6 flex items-center gap-3">
            <Link
              href="/tickets"
              className="fx-btn-primary bg-white text-slate-950 hover:bg-slate-100 inline-flex h-9.5 items-center rounded-lg px-3.5 text-sm font-semibold lg:h-10 lg:px-4 lg:text-base transition-colors"
            >
              View queue
            </Link>
            <button
              type="button"
              onClick={() => {
                setSubmitted(false);
                setSubject("");
                setDescription("");
              }}
              className="fx-btn-ghost border-slate-800 hover:bg-slate-800/60 text-slate-300 inline-flex h-9.5 items-center rounded-lg border px-3.5 text-sm font-medium lg:h-10 lg:px-4 lg:text-base transition-colors"
            >
              Create another
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={createTicket} className="mx-auto mt-8 w-full max-w-2xl space-y-6 sm:max-w-3xl lg:max-w-4xl 2xl:max-w-5xl">
          <div className="fx-card border-slate-800 bg-slate-900/40 rounded-xl border p-6">
            <label className="text-slate-300 block text-sm font-medium lg:text-base">
              Subject
              <input
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Laptop won't boot after update"
                className={`${INPUT_CLS} mt-1.5`}
              />
            </label>

            <label className="text-slate-300 mt-5 block text-sm font-medium">
              Description
              <textarea
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                placeholder="Steps to reproduce, error messages, affected systems..."
                className="mt-1.5 w-full rounded-lg border border-slate-800 bg-slate-950/60 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-slate-600 focus:ring-2 focus:ring-sky-500/20 lg:px-4 lg:py-3 lg:text-base"
              />
            </label>
<div className="mt-5">
              <span className="text-slate-300 block text-sm font-medium lg:text-base">Category</span>
              <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
                {CATEGORIES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCategory(c)}
                    className={`rounded-lg border px-3 py-2 text-sm font-medium capitalize transition-colors lg:px-4 lg:py-2.5 ${
                      category === c
                        ? "bg-sky-500/10 border-sky-500/40 text-sky-400"
                        : "border-slate-800 bg-slate-950/60 hover:border-slate-700 text-slate-400"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5">
              <span className="text-slate-300 block text-sm font-medium lg:text-base">Priority</span>
              <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {PRIORITIES.map((p) => (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => setPriority(p.key)}
                    className={`rounded-lg border px-3 py-2.5 text-left transition-colors lg:px-4 lg:py-3 ${
                      priority === p.key
                        ? PRIORITY_ACTIVE[p.key]
                        : "border-slate-800 bg-slate-950/60 hover:border-slate-700"
                    }`}
                  >
                    <span className={`block text-sm font-medium ${priority === p.key ? "" : "text-slate-200"}`}>
                      {PRIORITY_LABEL[p.key]}
                    </span>
                    <span className={`block text-xs ${priority === p.key ? "opacity-80" : "text-slate-500"}`}>
                      {p.hint}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3">
            <Link
              href="/tickets"
              className="fx-btn-ghost border-slate-800 hover:bg-slate-800/60 text-slate-300 inline-flex h-9.5 items-center rounded-lg border px-3.5 text-sm font-medium lg:h-10 lg:px-4 lg:text-base transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="fx-btn-primary bg-white text-slate-950 hover:bg-slate-100 inline-flex h-9.5 items-center rounded-lg px-4 text-sm font-semibold lg:h-10 lg:px-5 lg:text-base transition-colors"
            >
              Create ticket
            </button>
          </div>
        </form>
      )}
    </AppShell>
  );
}