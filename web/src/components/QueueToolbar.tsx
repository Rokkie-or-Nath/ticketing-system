"use client";

import { ChevronDownIcon, FilterIcon, SearchIcon } from "@/components/icons";
import { PRIORITY_LABEL, type Priority } from "@/data/mock";

export type StatusTab = "all" | "open" | "resolved";

const TABS: { key: StatusTab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "open", label: "Open" },
  { key: "resolved", label: "Resolved" },
];

const PRIORITIES: (Priority | "any")[] = ["any", "critical", "high", "medium", "low"];

export default function QueueToolbar({
  query,
  onQueryChange,
  statusTab,
  onStatusTabChange,
  priority,
  onPriorityChange,
}: {
  query: string;
  onQueryChange: (value: string) => void;
  statusTab: StatusTab;
  onStatusTabChange: (value: StatusTab) => void;
  priority: Priority | "any";
  onPriorityChange: (value: Priority | "any") => void;
}) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="relative w-full max-w-md">
        <SearchIcon className="text-slate-500 pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2" />
        <input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search by ID, subject, or description..."
          className="bg-slate-900/60 border-slate-800 text-white placeholder:text-slate-500 h-9.5 w-full rounded-lg border pl-10 pr-3 text-sm outline-none transition focus:border-slate-600 focus:ring-sky-500/20 focus:ring-2"
        />
      </div>

      <div className="flex items-center gap-3">
        <div className="bg-slate-900/40 border-slate-800 flex rounded-lg border p-0.5">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => onStatusTabChange(tab.key)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                statusTab === tab.key ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <details className="group relative">
          <summary className="fx-nav hover:border-slate-700 text-slate-300 flex h-9.5 cursor-pointer list-none select-none items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/60 px-3 text-sm outline-none transition">
            <FilterIcon className="text-slate-500 size-3.5" />
            {priority === "any" ? "Filter" : PRIORITY_LABEL[priority]}
            <ChevronDownIcon className="text-slate-500 group-open:rotate-180 size-3.5 transition-transform" />
          </summary>
          <div className="bg-slate-900 border-slate-800 absolute right-0 z-20 mt-1.5 w-44 rounded-lg border p-1 shadow-xl shadow-black/40">
            {PRIORITIES.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => onPriorityChange(p)}
                className={`block w-full rounded-md px-3 py-1.5 text-left text-sm ${
                  priority === p ? "bg-slate-800 text-white" : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
                }`}
              >
                {p === "any" ? "Any priority" : PRIORITY_LABEL[p]}
              </button>
            ))}
          </div>
        </details>
      </div>
    </div>
  );
}