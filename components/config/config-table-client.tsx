"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "sonner";
import {
  Plus,
  Search,
  Copy,
  MoreHorizontal,
  Pencil,
  Eye,
  RotateCcw,
  CopyPlus,
  Share2,
  Trash2,
  ArrowUpDown,
  Settings2,
} from "lucide-react";
import type { SafeConfigEntry } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/layout/empty-state";
import { SecretBadge } from "@/components/config/secret-badge";
import { ConfigEntryDialog } from "@/components/config/config-entry-dialog";
import { RevealSecretDialog } from "@/components/config/reveal-secret-dialog";
import { RotateSecretDialog } from "@/components/config/rotate-secret-dialog";
import { DuplicateEntryDialog } from "@/components/config/duplicate-entry-dialog";

interface ConfigTableClientProps {
  environmentId: string;
  projectId: string;
  userRole: string;
  canRevealSecrets: boolean;
  canShareSecrets: boolean;
}

type FilterType = "all" | "secrets" | "required";
type SortType = "key" | "updated";

export function ConfigTableClient({
  environmentId,
  projectId,
  userRole,
  canRevealSecrets,
  canShareSecrets,
}: ConfigTableClientProps) {
  const [entries, setEntries] = useState<SafeConfigEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [sort, setSort] = useState<SortType>("key");

  const [createOpen, setCreateOpen] = useState(false);
  const [editEntry, setEditEntry] = useState<SafeConfigEntry | null>(null);
  const [revealEntry, setRevealEntry] = useState<{
    id: string;
    key: string;
  } | null>(null);
  const [rotateEntry, setRotateEntry] = useState<{
    id: string;
    key: string;
  } | null>(null);
  const [duplicateEntry, setDuplicateEntry] = useState<{
    id: string;
    key: string;
  } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const canEdit = userRole === "OWNER" || userRole === "EDITOR";

  const fetchEntries = useCallback(async () => {
    try {
      const res = await fetch(`/api/environments/${environmentId}/entries`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setEntries(data);
    } catch {
      toast.error("Failed to load config entries");
    } finally {
      setLoading(false);
    }
  }, [environmentId]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const filtered = useMemo(() => {
    let result = entries;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter((e) => e.key.toLowerCase().includes(q));
    }

    if (filter === "secrets") {
      result = result.filter((e) => e.isSecret);
    } else if (filter === "required") {
      result = result.filter((e) => e.isRequired);
    }

    return [...result].sort((a, b) => {
      if (sort === "key") return a.key.localeCompare(b.key);
      return (
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
    });
  }, [entries, search, filter, sort]);

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/entries/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Entry deleted");
      fetchEntries();
    } catch {
      toast.error("Failed to delete entry");
    } finally {
      setDeletingId(null);
    }
  }

  function handleCopyKey(key: string) {
    navigator.clipboard.writeText(key);
    toast.success("Key copied to clipboard");
  }

  if (loading) {
    return <TableSkeleton />;
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Filter by key name…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
          {canEdit && (
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="size-4" />
              Add Entry
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {(["all", "secrets", "required"] as const).map((f) => (
              <Button
                key={f}
                variant={filter === f ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setFilter(f)}
              >
                {f === "all"
                  ? "All"
                  : f === "secrets"
                    ? "Secrets Only"
                    : "Required Only"}
              </Button>
            ))}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSort((s) => (s === "key" ? "updated" : "key"))}
          >
            <ArrowUpDown className="size-3.5" />
            {sort === "key" ? "Key (A-Z)" : "Last Updated"}
          </Button>
        </div>

        {filtered.length === 0 ? (
          entries.length === 0 ? (
            <EmptyState
              icon={<Settings2 className="size-10" />}
              title="No config entries yet"
              description="Add your first configuration entry to get started."
              actionLabel={canEdit ? "Add Entry" : undefined}
              onAction={canEdit ? () => setCreateOpen(true) : undefined}
            />
          ) : (
            <EmptyState
              icon={<Search className="size-10" />}
              title="No matching entries"
              description="Try adjusting your search or filter criteria."
            />
          )
        ) : (
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Key</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Required</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <code className="font-mono text-sm font-medium">
                          {entry.key}
                        </code>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => handleCopyKey(entry.key)}
                        >
                          <Copy className="size-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px]">
                      {entry.isSecret ? (
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-muted-foreground">
                            ••••••••
                          </span>
                          {canRevealSecrets && (
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              onClick={() =>
                                setRevealEntry({
                                  id: entry.id,
                                  key: entry.key,
                                })
                              }
                            >
                              <Eye className="size-3" />
                            </Button>
                          )}
                        </div>
                      ) : (
                        <span className="block max-w-[200px] truncate font-mono text-sm">
                          {entry.value}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <SecretBadge isSecret={entry.isSecret} />
                    </TableCell>
                    <TableCell>
                      {entry.isRequired && (
                        <Badge variant="outline">Required</Badge>
                      )}
                    </TableCell>
                    <TableCell className="max-w-[150px]">
                      <span className="block truncate text-sm text-muted-foreground">
                        {entry.description || "—"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={<Button variant="ghost" size="icon-xs" />}
                        >
                          <MoreHorizontal className="size-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {canEdit && (
                            <DropdownMenuItem
                              onClick={() => setEditEntry(entry)}
                            >
                              <Pencil className="size-4" />
                              Edit
                            </DropdownMenuItem>
                          )}
                          {entry.isSecret && canRevealSecrets && (
                            <DropdownMenuItem
                              onClick={() =>
                                setRevealEntry({
                                  id: entry.id,
                                  key: entry.key,
                                })
                              }
                            >
                              <Eye className="size-4" />
                              Reveal
                            </DropdownMenuItem>
                          )}
                          {entry.isSecret && canEdit && (
                            <DropdownMenuItem
                              onClick={() =>
                                setRotateEntry({
                                  id: entry.id,
                                  key: entry.key,
                                })
                              }
                            >
                              <RotateCcw className="size-4" />
                              Rotate
                            </DropdownMenuItem>
                          )}
                          {canEdit && (
                            <DropdownMenuItem
                              onClick={() =>
                                setDuplicateEntry({
                                  id: entry.id,
                                  key: entry.key,
                                })
                              }
                            >
                              <CopyPlus className="size-4" />
                              Duplicate
                            </DropdownMenuItem>
                          )}
                          {entry.isSecret && canShareSecrets && (
                            <DropdownMenuItem
                              onClick={() =>
                                toast.info("Share link feature coming soon")
                              }
                            >
                              <Share2 className="size-4" />
                              Create Share Link
                            </DropdownMenuItem>
                          )}
                          {canEdit && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                variant="destructive"
                                disabled={deletingId === entry.id}
                                onClick={() => handleDelete(entry.id)}
                              >
                                <Trash2 className="size-4" />
                                {deletingId === entry.id
                                  ? "Deleting…"
                                  : "Delete"}
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <ConfigEntryDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        environmentId={environmentId}
        onSuccess={fetchEntries}
      />

      {editEntry && (
        <ConfigEntryDialog
          open={!!editEntry}
          onOpenChange={(open) => !open && setEditEntry(null)}
          environmentId={environmentId}
          entry={editEntry}
          onSuccess={fetchEntries}
        />
      )}

      {revealEntry && (
        <RevealSecretDialog
          open={!!revealEntry}
          onOpenChange={(open) => !open && setRevealEntry(null)}
          entryId={revealEntry.id}
          entryKey={revealEntry.key}
        />
      )}

      {rotateEntry && (
        <RotateSecretDialog
          open={!!rotateEntry}
          onOpenChange={(open) => !open && setRotateEntry(null)}
          entryId={rotateEntry.id}
          entryKey={rotateEntry.key}
          onSuccess={fetchEntries}
        />
      )}

      {duplicateEntry && (
        <DuplicateEntryDialog
          open={!!duplicateEntry}
          onOpenChange={(open) => !open && setDuplicateEntry(null)}
          entryId={duplicateEntry.id}
          entryKey={duplicateEntry.key}
          projectId={projectId}
          currentEnvironmentId={environmentId}
          onSuccess={fetchEntries}
        />
      )}
    </>
  );
}

function TableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-8 w-24" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-7 w-16" />
        <Skeleton className="h-7 w-24" />
        <Skeleton className="h-7 w-28" />
      </div>
      <div className="rounded-lg border">
        <div className="space-y-3 p-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 flex-1" />
              <Skeleton className="h-5 w-8" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
