"use client";

import { useCallback, useEffect, useState } from "react";
import { format, formatDistanceToNow, isAfter, subDays } from "date-fns";
import { FileText, RotateCcw, X } from "lucide-react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
  { value: "member.role_changed", label: "Member Role Changed" },
  { value: "member.removed", label: "Member Removed" },
  { value: "environment.created", label: "Environment Created" },
  { value: "environment.deleted", label: "Environment Deleted" },
  { value: "config.created", label: "Config Created" },
  { value: "config.updated", label: "Config Updated" },
  { value: "config.deleted", label: "Config Deleted" },
  { value: "secret.revealed", label: "Secret Revealed" },
  { value: "secret.rotated", label: "Secret Rotated" },
  { value: "share_link.created", label: "Share Link Created" },
  { value: "share_link.revoked", label: "Share Link Revoked" },
  { value: "share_link.viewed", label: "Share Link Viewed" },
  { value: "config.imported", label: "Config Imported" },
  { value: "config.exported", label: "Config Exported" },
] as const;

function formatTimestamp(dateStr: string) {
  const date = new Date(dateStr);
  const twoDaysAgo = subDays(new Date(), 2);

  if (isAfter(date, twoDaysAgo)) {
    return formatDistanceToNow(date, { addSuffix: true });
  }

  return format(date, "MMM d, yyyy 'at' h:mm a");
}

function summarizeMetadata(metadata: Record<string, unknown> | null): string {
  if (!metadata || Object.keys(metadata).length === 0) return "—";

  const parts: string[] = [];
  for (const [key, value] of Object.entries(metadata)) {
    if (value === null || value === undefined) continue;
    const display = typeof value === "object" ? JSON.stringify(value) : String(value);
    parts.push(`${key}: ${display}`);
  }

  const summary = parts.join(", ");
  return summary.length > 80 ? summary.slice(0, 77) + "…" : summary;
}

const ENTITY_VARIANT: Record<string, "default" | "secondary" | "outline"> = {
  project: "default",
  member: "secondary",
  environment: "outline",
  config: "secondary",
  secret: "default",
  share_link: "outline",
};

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

  const [actorFilter, setActorFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const hasFilters = actorFilter || actionFilter || fromDate || toDate;

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
        `/api/projects/${projectId}/audit?${params.toString()}`,
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
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Actor
          </label>
          <Select value={actorFilter} onValueChange={(v) => setActorFilter(v ?? "")}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Members" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Members</SelectItem>
              {members.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.fullName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Action
          </label>
          <Select value={actionFilter} onValueChange={(v) => setActionFilter(v ?? "")}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All Actions" />
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

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            From
          </label>
          <Input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="w-[160px]"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            To
          </label>
          <Input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="w-[160px]"
          />
        </div>

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="mr-1 size-3" />
            Clear filters
          </Button>
        )}

        <Button variant="outline" size="icon" onClick={fetchLogs} className="ml-auto">
          <RotateCcw className="size-4" />
        </Button>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSkeleton />
      ) : logs.length === 0 ? (
        <EmptyState hasFilters={!!hasFilters} />
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Entity Type</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell
                    className="text-muted-foreground"
                    title={format(new Date(log.createdAt), "PPpp")}
                  >
                    {formatTimestamp(log.createdAt)}
                  </TableCell>
                  <TableCell className="font-medium">
                    {log.actor.fullName}
                  </TableCell>
                  <TableCell>{humanizeAction(log.action)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={ENTITY_VARIANT[log.entityType] ?? "outline"}
                    >
                      {log.entityType}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-[260px] truncate text-muted-foreground">
                    {summarizeMetadata(log.metadata)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex items-center justify-between text-sm">
            <p className="text-muted-foreground">
              {total} {total === 1 ? "entry" : "entries"} total
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <span className="tabular-nums text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex gap-3">
          {Array.from({ length: 5 }).map((_, j) => (
            <Skeleton key={j} className="h-8 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
      <FileText className="mb-3 size-10 text-muted-foreground/50" />
      <h3 className="text-sm font-medium">No audit logs found</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        {hasFilters
          ? "Try adjusting your filters to see more results."
          : "Activity in this project will appear here."}
      </p>
    </div>
  );
}
