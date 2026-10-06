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
import { PRIORITY_LABEL, type Category, type Priority } from "@/data/mock";

export type StatusTab = "all" | "open" | "resolved";

const TABS: { key: StatusTab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "open", label: "Open" },
  { key: "resolved", label: "Resolved" },
];

const PRIORITIES: (Priority | "any")[] = ["any", "critical", "high", "medium", "low"];
const CATEGORIES: (Category | "any")[] = ["any", "hardware", "software", "network", "access", "other"];

export default function QueueToolbar({
  query,
  onQueryChange,
  statusTab,
  onStatusTabChange,
  priority,
  onPriorityChange,
  category,
  onCategoryChange,
  counts,
}: {
  query: string;
  onQueryChange: (value: string) => void;
  statusTab: StatusTab;
  onStatusTabChange: (value: StatusTab) => void;
  priority: Priority | "any";
  onPriorityChange: (value: Priority | "any") => void;
  category?: Category | "any";
  onCategoryChange?: (value: Category | "any") => void;
  counts?: Partial<Record<StatusTab, number>>;
}) {
  return (
    <div className="flex flex-col gap-3">
      {/* Row 1: search + status tabs */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2" />
          <Input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Filter by ID, subject, requester…"
            className="h-9 pl-9 text-sm"
          />
        </div>

        <Tabs value={statusTab} onValueChange={(v) => onStatusTabChange(v as StatusTab)}>
          <TabsList className="h-9">
            {TABS.map((tab) => (
              <TabsTrigger key={tab.key} value={tab.key} className="gap-1.5 text-xs">
                {tab.label}
                {counts?.[tab.key] !== undefined && (
                  <span
                    className={cn(
                      "rounded-full px-1.5 text-[0.65rem] font-semibold leading-4",
                      statusTab === tab.key
                        ? "bg-primary/15 text-primary"
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
      </div>

      {/* Row 2: filters */}
      <div className="flex flex-wrap items-center gap-2">
        <Select value={priority} onValueChange={(v) => onPriorityChange(v as Priority | "any")}>
          <SelectTrigger className="h-8 w-[148px] text-xs">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            {PRIORITIES.map((p) => (
              <SelectItem key={p} value={p} className="text-xs">
                {p === "any" ? "Any priority" : PRIORITY_LABEL[p]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {onCategoryChange && (
          <Select value={category ?? "any"} onValueChange={(v) => onCategoryChange(v as Category | "any")}>
            <SelectTrigger className="h-8 w-[148px] text-xs">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c} className="text-xs capitalize">
                  {c === "any" ? "Any category" : c.charAt(0).toUpperCase() + c.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
    </div>
  );
}
