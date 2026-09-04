"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
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
  counts,
}: {
  query: string;
  onQueryChange: (value: string) => void;
  statusTab: StatusTab;
  onStatusTabChange: (value: StatusTab) => void;
  priority: Priority | "any";
  onPriorityChange: (value: Priority | "any") => void;
  counts?: Partial<Record<StatusTab, number>>;
}) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="relative w-full max-w-md">
        <Search className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2" />
        <Input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search by ID, subject, or description..."
          className="h-9.5 pl-9"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Tabs value={statusTab} onValueChange={(v) => onStatusTabChange(v as StatusTab)}>
          <TabsList className="bg-muted/60">
            {TABS.map((tab) => (
              <TabsTrigger key={tab.key} value={tab.key} className="gap-1.5">
                {tab.label}
                {counts?.[tab.key] !== undefined && (
                  <span
                    className={cn(
                      "rounded-full px-1.5 text-[0.65rem] font-semibold leading-4",
                      statusTab === tab.key
                        ? "bg-sky-500/15 text-sky-400"
                        : "bg-secondary text-muted-foreground"
                    )}
                  >
                    {counts[tab.key]}
                  </span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <Select value={priority} onValueChange={(v) => onPriorityChange(v as Priority | "any")}>
          <SelectTrigger className="h-9 w-[152px]">
            <SelectValue placeholder="Filter by priority" />
          </SelectTrigger>
          <SelectContent className="z-50">
            {PRIORITIES.map((p) => (
              <SelectItem key={p} value={p}>
                {p === "any" ? "Any priority" : PRIORITY_LABEL[p]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}