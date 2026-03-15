"use client";

import { useCallback, useEffect, useState } from "react";
import { format } from "date-fns";
import {
  FileText,
  RotateCcw,
  X,
  Plus,
  Pencil,
  Trash2,
  UserPlus,
  UserMinus,
  Shield,
  Eye,
  RefreshCw,
  Link2,
  LinkIcon,
  Upload,
  Download,
  Layers,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Clock,
} from "lucide-react";
import { humanizeAction } from "@/lib/audit/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Member {
  id: string;
  fullName: string;
}

interface AuditLogEntry {
  id: string;
  actorId: string;
  action: string;
  entityType: string;
  entityId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  actor: {
    fullName: string;
    email: string;
  };
}

interface AuditLogResponse {
  logs: AuditLogEntry[];
  total: number;
  page: number;
  totalPages: number;
}

const ACTION_OPTIONS = [
  { value: "", label: "All Actions" },
  { value: "project.created", label: "Project Created" },
  { value: "project.updated", label: "Project Updated" },
  { value: "project.deleted", label: "Project Deleted" },
  { value: "member.invited", label: "Member Invited" },
  { value: "member.role_changed", label: "Role Changed" },
  { value: "member.removed", label: "Member Removed" },
  { value: "environment.created", label: "Env Created" },
  { value: "environment.deleted", label: "Env Deleted" },
  { value: "config.created", label: "Config Created" },
  { value: "config.updated", label: "Config Updated" },
  { value: "config.deleted", label: "Config Deleted" },
  { value: "secret.revealed", label: "Secret Revealed" },
  { value: "secret.rotated", label: "Secret Rotated" },
  { value: "share_link.created", label: "Link Created" },
  { value: "share_link.revoked", label: "Link Revoked" },
  { value: "share_link.viewed", label: "Link Viewed" },
  { value: "config.imported", label: "Config Imported" },
  { value: "config.exported", label: "Config Exported" },
] as const;

// ── Helpers ──

function formatTimestamp(dateStr: string) {
  const date = new Date(dateStr);
  return format(date, "MMM d, yyyy 'at' h:mm a");
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/** Robust humanize — handles both "project.created" AND "PROJECT_CREATED" */
function smartHumanize(action: string): string {
  const result = humanizeAction(action);
  // If humanizeAction returned the raw input (no match), handle SCREAMING_SNAKE_CASE
  if (result === action && action.includes("_")) {
    return action
      .toLowerCase()
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }
  return result;
}

type ActionCategory = "create" | "update" | "delete" | "secret" | "share" | "member" | "neutral";

function getActionCategory(action: string): ActionCategory {
  const a = action.toLowerCase();
  if (a.includes("created") || a.includes("create")) return "create";
  if (a.includes("updated") || a.includes("update") || a.includes("duplicated") || a.includes("duplicate")) return "update";
  if (a.includes("deleted") || a.includes("delete") || a.includes("removed") || a.includes("remove") || a.includes("revoked") || a.includes("revoke")) return "delete";
  if (a.includes("revealed") || a.includes("reveal") || a.includes("rotated") || a.includes("rotate")) return "secret";
  if (a.includes("share") || a.includes("viewed") || a.includes("view") || a.includes("imported") || a.includes("import") || a.includes("exported") || a.includes("export")) return "share";
  if (a.includes("invited") || a.includes("invite") || a.includes("role_changed") || a.includes("role.changed")) return "member";
  return "neutral";
}

const CATEGORY_STYLES: Record<ActionCategory, { bg: string; text: string; border: string }> = {
  create:  { bg: "bg-emerald-500/15", text: "text-emerald-300", border: "border-emerald-500/30" },
  update:  { bg: "bg-sky-500/15",     text: "text-sky-300",     border: "border-sky-500/30" },
  delete:  { bg: "bg-red-500/15",     text: "text-red-300",     border: "border-red-500/30" },
  secret:  { bg: "bg-amber-500/15",   text: "text-amber-300",   border: "border-amber-500/30" },
  share:   { bg: "bg-violet-500/15",  text: "text-violet-300",  border: "border-violet-500/30" },
  member:  { bg: "bg-indigo-500/15",  text: "text-indigo-300",  border: "border-indigo-500/30" },
  neutral: { bg: "bg-muted",          text: "text-muted-foreground", border: "border-border" },
};

function getActionIcon(action: string) {
  const a = action.toLowerCase();
  if (a.includes("invited") || a.includes("invite")) return UserPlus;
  if (a.includes("removed") || a.includes("remove")) return UserMinus;
  if (a.includes("role_changed") || a.includes("role.changed")) return Shield;
  if (a.includes("revealed") || a.includes("reveal")) return Eye;
  if (a.includes("rotated") || a.includes("rotate")) return RefreshCw;
  if (a.includes("share_link.created") || a.includes("share.link.created")) return Link2;
  if (a.includes("revoked") || a.includes("revoke")) return LinkIcon;
  if (a.includes("viewed") || a.includes("view")) return Eye;
  if (a.includes("imported") || a.includes("import")) return Upload;
  if (a.includes("exported") || a.includes("export")) return Download;
  if (a.includes("environment")) return Layers;
  if (a.includes("deleted") || a.includes("delete")) return Trash2;
  if (a.includes("updated") || a.includes("update") || a.includes("duplicated") || a.includes("duplicate")) return Pencil;
  if (a.includes("created") || a.includes("create")) return Plus;
  return FileText;
}

const ENTITY_COLORS: Record<string, string> = {
  project:     "bg-primary/15 text-primary border-primary/30",
  member:      "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
  environment: "bg-sky-500/15 text-sky-300 border-sky-500/30",
  config:      "bg-amber-500/15 text-amber-300 border-amber-500/30",
  secret:      "bg-red-500/15 text-red-300 border-red-500/30",
  share_link:  "bg-violet-500/15 text-violet-300 border-violet-500/30",
};

const METADATA_LABELS: Record<string, string> = {
  projectName: "Project",
  name: "Name",
  email: "Email",
  role: "Role",
  key: "Key",
  environment: "Environment",
  from: "From",
  to: "To",
  count: "Count",
  token: "Token",
  format: "Format",
  previousRole: "Previous Role",
  newRole: "New Role",
};

function isIsoDateString(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const date = new Date(value);
  return !Number.isNaN(date.getTime()) && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value);
}

function formatMetadata(metadata: Record<string, unknown> | null) {
  if (!metadata || Object.keys(metadata).length === 0) return null;

  const entries = Object.entries(metadata).filter(
    ([, value]) => value !== null && value !== undefined
  );

  if (entries.length === 0) return null;

  return entries.map(([key, value]) => {
    let displayValue: string;
    if (value instanceof Date) {
      displayValue = formatTimestamp(value.toISOString());
    } else if (isIsoDateString(value)) {
      displayValue = formatTimestamp(value);
    } else if (typeof value === "object") {
      displayValue = JSON.stringify(value);
    } else {
      displayValue = String(value);
    }
    return {
      label: METADATA_LABELS[key] || key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase()),
      value: displayValue,
    };
  });
}

// ── Component ──

export function AuditLogClient({
  projectId,
  members,
}: {
  projectId: string;
  members: Member[];
}) {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const [actorFilter, setActorFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const hasFilters = actorFilter || actionFilter || fromDate || toDate;
  const activeFilterCount = [actorFilter, actionFilter, fromDate, toDate].filter(Boolean).length;

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", "50");
      if (actorFilter) params.set("actor", actorFilter);
      if (actionFilter) params.set("action", actionFilter);
      if (fromDate) params.set("from", new Date(fromDate).toISOString());
      if (toDate) {
        const end = new Date(toDate);
        end.setHours(23, 59, 59, 999);
        params.set("to", end.toISOString());
      }

      const res = await fetch(
        `/api/projects/${projectId}/audit?${params.toString()}`
      );

      if (!res.ok) throw new Error("Failed to fetch");

      const data: AuditLogResponse = await res.json();
      setLogs(data.logs);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch {
      setLogs([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [projectId, page, actorFilter, actionFilter, fromDate, toDate]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    setPage(1);
  }, [actorFilter, actionFilter, fromDate, toDate]);

  function clearFilters() {
    setActorFilter("");
    setActionFilter("");
    setFromDate("");
    setToDate("");
    setPage(1);
  }

  return (
    <div className="space-y-5">
      {/* ── Filter Bar ── */}
      <div className="flex items-center gap-2">
        <Button
          variant={showFilters ? "secondary" : "outline"}
          size="sm"
          onClick={() => setShowFilters((v) => !v)}
          className="gap-1.5"
        >
          <SlidersHorizontal className="size-3.5" />
          Filters
          {activeFilterCount > 0 && (
            <span className="ml-0.5 flex size-4.5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              {activeFilterCount}
            </span>
          )}
        </Button>

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 text-muted-foreground hover:text-foreground">
            <X className="size-3" />
            Clear
          </Button>
        )}

        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs tabular-nums text-muted-foreground">
            {total} {total === 1 ? "event" : "events"}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={fetchLogs}
            className="size-8"
          >
            <RotateCcw className="size-3.5" />
          </Button>
        </div>
      </div>

      {/* ── Expanded Filters ── */}
      {showFilters && (
        <div className="animate-fade-in-up rounded-xl border border-border/60 bg-card/50 p-4 backdrop-blur-sm">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Actor
              </label>
              <Select value={actorFilter} onValueChange={(v) => setActorFilter(v ?? "")}>
                <SelectTrigger className="h-8 w-[170px] text-xs">
                  <SelectValue placeholder="All members" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All members</SelectItem>
                  {members.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Action
              </label>
              <Select value={actionFilter} onValueChange={(v) => setActionFilter(v ?? "")}>
                <SelectTrigger className="h-8 w-[180px] text-xs">
                  <SelectValue placeholder="All actions" />
                </SelectTrigger>
                <SelectContent>
                  {ACTION_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                From
              </label>
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="h-8 w-[150px] text-xs"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                To
              </label>
              <Input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="h-8 w-[150px] text-xs"
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Content ── */}
      {loading ? (
        <LoadingSkeleton />
      ) : logs.length === 0 ? (
        <EmptyState hasFilters={!!hasFilters} />
      ) : (
        <>
          {/* Timeline */}
          <div className="relative rounded-xl border border-border/60 bg-card/50">
            {/* Timeline line */}
            <div className="absolute top-0 bottom-0 left-[23px] w-px bg-gradient-to-b from-border via-border/50 to-transparent" />

            <div className="divide-y divide-border/40">
              {logs.map((log, i) => {
                const category = getActionCategory(log.action);
                const styles = CATEGORY_STYLES[category];
                const Icon = getActionIcon(log.action);
                const meta = formatMetadata(log.metadata);
                const entityColor = ENTITY_COLORS[log.entityType] ?? "bg-muted/50 text-foreground/70 border-border";

                return (
                  <div
                    key={log.id}
                    className="group relative flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-muted/20"
                    style={{ animationDelay: `${Math.min(i * 30, 300)}ms` }}
                  >
                    {/* Timeline node */}
                    <div className="relative z-10 flex shrink-0 items-center justify-center">
                      <div
                        className={`flex size-6 shrink-0 items-center justify-center rounded-full border ${styles.bg} ${styles.border}`}
                      >
                        <Icon className={`size-3 shrink-0 ${styles.text}`} />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      {/* Main line */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs leading-snug">
                            <span className="inline-flex items-center gap-1.5">
                              {/* Avatar */}
                              <span className="inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[9px] font-bold tracking-tight text-primary">
                                {getInitials(log.actor.fullName)}
                              </span>
                              <span className="font-semibold text-foreground">{log.actor.fullName}</span>
                            </span>{" "}
                            <span className="text-muted-foreground">
                              {smartHumanize(log.action).toLowerCase()}
                            </span>
                          </p>

                          {/* Entity + Metadata row */}
                          <div className="mt-1 flex flex-wrap items-center gap-1.5">
                            <span
                              className={`inline-flex h-5 items-center rounded-md border px-1.5 text-[10px] font-semibold uppercase tracking-wide ${entityColor}`}
                            >
                              {log.entityType.replace(/_/g, " ")}
                            </span>

                            {meta && (
                              <span className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5">
                                {meta.map((m) => (
                                  <span
                                    key={m.label}
                                    className="inline-flex items-center gap-1 text-[11px]"
                                  >
                                    <span className="text-muted-foreground">
                                      {m.label}:
                                    </span>
                                    <span className="max-w-[200px] truncate font-mono text-[10px] text-foreground/80">
                                      {m.value}
                                    </span>
                                  </span>
                                ))}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Timestamp */}
                        <time
                          className="mt-0.5 flex shrink-0 items-center gap-1 text-[11px] tabular-nums text-muted-foreground"
                          title={format(new Date(log.createdAt), "PPpp")}
                        >
                          <Clock className="size-2.5" />
                          {formatTimestamp(log.createdAt)}
                        </time>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Pagination ── */}
          <div className="flex items-center justify-between border-t border-border/40 pt-4">
            <p className="text-xs text-muted-foreground">
              Showing{" "}
              <span className="font-medium text-foreground">
                {(page - 1) * 50 + 1}–{Math.min(page * 50, total)}
              </span>{" "}
              of {total}
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="size-7"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="size-3.5" />
              </Button>
              <span className="min-w-[4rem] text-center text-xs tabular-nums text-muted-foreground">
                {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="size-7"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="size-3.5" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── Loading Skeleton ──

function LoadingSkeleton() {
  return (
    <div className="rounded-xl border border-border/60 bg-card/50 divide-y divide-border/40">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex gap-3 px-3 py-2.5"
          style={{ opacity: 1 - i * 0.1 }}
        >
          <Skeleton className="size-6 shrink-0 rounded-full" />
          <div className="flex-1 space-y-1.5">
            <div className="flex items-center gap-2">
              <Skeleton className="size-5 rounded-full" />
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="h-3.5 w-32" />
            </div>
            <div className="flex items-center gap-1.5">
              <Skeleton className="h-5 w-20 rounded-md" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
          <Skeleton className="h-3.5 w-24 shrink-0" />
        </div>
      ))}
    </div>
  );
}

// ── Empty State ──

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/60 py-20 text-center">
      <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-muted/50">
        <FileText className="size-6 text-muted-foreground/40" />
      </div>
      <h3 className="text-sm font-medium">
        {hasFilters ? "No matching events" : "No activity yet"}
      </h3>
      <p className="mt-1 max-w-[240px] text-xs leading-relaxed text-muted-foreground">
        {hasFilters
          ? "Try adjusting your filters to see more results."
          : "Actions in this project will show up here as a timeline."}
      </p>
    </div>
  );
}
