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
  Filter,
  Layers,
} from "lucide-react";
import type { SafeConfigEntry } from "@/types";
import { cn } from "@/lib/utils";
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
import { DuplicateKeysDialog } from "@/components/config/duplicate-keys-dialog";
import { ShareSecretDialog } from "@/components/config/share-secret-dialog";

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
  const [duplicateKeysOpen, setDuplicateKeysOpen] = useState(false);
  const [shareEntry, setShareEntry] = useState<{
    id: string;
    key: string;
  } | null>(null);

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

  const secretCount = entries.filter((e) => e.isSecret).length;
  const requiredCount = entries.filter((e) => e.isRequired).length;

  return (
    <>
      <div className="space-y-4">
        {/* Summary bar */}
        {entries.length > 0 && (
          <div className="animate-fade-in flex items-center gap-4 text-sm text-muted-foreground">
            <span className="tabular-nums">
              <span className="font-medium text-foreground">{entries.length}</span> entries
            </span>
            {secretCount > 0 && (
              <span className="tabular-nums">
                <span className="font-medium text-foreground">{secretCount}</span> secrets
              </span>
            )}
            {requiredCount > 0 && (
              <span className="tabular-nums">
                <span className="font-medium text-foreground">{requiredCount}</span> required
              </span>
            )}
          </div>
        )}

        {/* Toolbar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-sm flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/60" />
            <Input
              placeholder="Filter by key name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
          <div className="flex items-center gap-2">
            {userRole === "OWNER" && (
              <Button
                variant="outline"
                onClick={() => setDuplicateKeysOpen(true)}
                className="gap-1.5"
              >
                <Layers className="size-4" />
                Find Duplicates
              </Button>
            )}
            {canEdit && (
              <Button onClick={() => setCreateOpen(true)} className="shadow-sm shadow-primary/10">
                <Plus className="size-4" />
                Add Entry
              </Button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-border/60 bg-muted/30 p-0.5">
            {(["all", "secrets", "required"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "rounded-md px-3 py-1 text-xs font-medium transition-all duration-200",
                  filter === f
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {f === "all"
                  ? "All"
                  : f === "secrets"
                    ? "Secrets"
                    : "Required"}
              </button>
            ))}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSort((s) => (s === "key" ? "updated" : "key"))}
            className="ml-auto gap-1.5 text-xs text-muted-foreground"
          >
            <ArrowUpDown className="size-3" />
            {sort === "key" ? "A-Z" : "Recent"}
          </Button>
        </div>

        {/* Table */}
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
          <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-semibold">Key</TableHead>
                  <TableHead className="font-semibold">Value</TableHead>
                  <TableHead className="font-semibold">Type</TableHead>
                  <TableHead className="font-semibold">Required</TableHead>
                  <TableHead className="font-semibold">Description</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((entry) => (
                  <TableRow key={entry.id} className="group/row transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <code className="rounded bg-muted/50 px-1.5 py-0.5 font-mono text-sm font-medium">
                          {entry.key}
                        </code>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => handleCopyKey(entry.key)}
                          className="opacity-0 transition-opacity group-hover/row:opacity-100"
                        >
                          <Copy className="size-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px]">
                      {entry.isSecret ? (
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-sm tracking-wider text-muted-foreground">
                            ********
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
                              className="opacity-0 transition-opacity group-hover/row:opacity-100"
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
                        <Badge variant="outline" className="text-xs">Required</Badge>
                      )}
                    </TableCell>
                    <TableCell className="max-w-[150px]">
                      <span className="block truncate text-sm text-muted-foreground">
                        {entry.description || "\u2014"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              className="opacity-0 transition-opacity group-hover/row:opacity-100"
                            />
                          }
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
                                setShareEntry({
                                  id: entry.id,
                                  key: entry.key,
                                })
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
                                  ? "Deleting\u2026"
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

      <DuplicateKeysDialog
        open={duplicateKeysOpen}
        onOpenChange={setDuplicateKeysOpen}
        projectId={projectId}
      />

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

      {shareEntry && (
        <ShareSecretDialog
          open={!!shareEntry}
          onOpenChange={(open) => !open && setShareEntry(null)}
          entryId={shareEntry.id}
          entryKey={shareEntry.key}
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
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-7 w-20 ml-auto" />
      </div>
      <div className="overflow-hidden rounded-xl border border-border/60">
        <div className="space-y-0">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={cn("flex items-center gap-4 px-4 py-3", i !== 5 && "border-b border-border/40")}>
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
