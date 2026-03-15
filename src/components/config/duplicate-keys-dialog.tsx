"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Loader2, Layers, CheckCircle2, AlertTriangle, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DuplicateKey {
  key: string;
  presentIn: string[];
  missingIn: string[];
  isSecret: boolean;
  isRequired: boolean;
}

interface EnvInfo {
  id: string;
  name: string;
}

interface DuplicateKeysDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
}

export function DuplicateKeysDialog({
  open,
  onOpenChange,
  projectId,
}: DuplicateKeysDialogProps) {
  const [loading, setLoading] = useState(false);
  const [duplicates, setDuplicates] = useState<DuplicateKey[]>([]);
  const [environments, setEnvironments] = useState<EnvInfo[]>([]);
  const [search, setSearch] = useState("");
  const [fetched, setFetched] = useState(false);

  const fetchDuplicates = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/duplicate-keys`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setDuplicates(data.duplicates);
      setEnvironments(data.environments);
      setFetched(true);
    } catch {
      toast.error("Failed to check for duplicate keys");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (open && !fetched) {
      fetchDuplicates();
    }
  }, [open, fetched, fetchDuplicates]);

  function handleClose(next: boolean) {
    if (!next) {
      setSearch("");
      setFetched(false);
    }
    onOpenChange(next);
  }

  const filtered = search
    ? duplicates.filter((d) =>
        d.key.toLowerCase().includes(search.toLowerCase()),
      )
    : duplicates;

  const withMissing = filtered.filter((d) => d.missingIn.length > 0);
  const fullyPresent = filtered.filter((d) => d.missingIn.length === 0);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-3xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Layers className="size-4 text-blue-500" />
            Duplicate Keys Across Environments
          </DialogTitle>
          <DialogDescription>
            Keys that exist in multiple environments.
            {environments.length > 0 && (
              <span className="ml-1">
                Checking across{" "}
                <span className="font-medium text-foreground">
                  {environments.length}
                </span>{" "}
                environments.
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-12 text-muted-foreground">
            <Loader2 className="size-6 animate-spin" />
            <span className="text-sm">Scanning environments…</span>
          </div>
        ) : duplicates.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-muted-foreground">
            <CheckCircle2 className="size-8 text-green-500" />
            <p className="text-sm font-medium text-foreground">No duplicate keys found</p>
            <p className="text-xs">
              Each key currently exists in only one environment.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 overflow-hidden">
            {/* Summary */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="tabular-nums">
                <span className="font-medium text-foreground">
                  {duplicates.length}
                </span>{" "}
                shared keys
              </span>
              {duplicates.filter((d) => d.missingIn.length > 0).length > 0 && (
                <span className="flex items-center gap-1 tabular-nums text-amber-600 dark:text-amber-400">
                  <AlertTriangle className="size-3" />
                  <span className="font-medium">
                    {duplicates.filter((d) => d.missingIn.length > 0).length}
                  </span>{" "}
                  inconsistent
                </span>
              )}
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/60" />
              <Input
                placeholder="Filter by key name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>

            {/* Table */}
            <div className="overflow-auto rounded-xl border border-border/60">
              <TooltipProvider delay={200}>
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="font-semibold">Key</TableHead>
                      <TableHead className="font-semibold">Type</TableHead>
                      {environments.map((env) => (
                        <TableHead
                          key={env.id}
                          className="text-center font-semibold"
                        >
                          {env.name}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {withMissing.map((dup) => (
                      <TableRow key={dup.key}>
                        <TableCell>
                          <code className="rounded bg-muted/50 px-1.5 py-0.5 font-mono text-xs font-medium">
                            {dup.key}
                          </code>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {dup.isSecret && (
                              <Badge
                                variant="destructive"
                                className="text-[10px]"
                              >
                                secret
                              </Badge>
                            )}
                            {dup.isRequired && (
                              <Badge
                                variant="secondary"
                                className="text-[10px]"
                              >
                                required
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        {environments.map((env) => {
                          const present = dup.presentIn.includes(env.id);
                          return (
                            <TableCell key={env.id} className="text-center">
                              <Tooltip>
                                <TooltipTrigger
                                  render={
                                    <span
                                      className={`inline-flex size-5 items-center justify-center rounded-full text-xs font-medium ${
                                        present
                                          ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"
                                          : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"
                                      }`}
                                    />
                                  }
                                >
                                  {present ? "\u2713" : "\u2014"}
                                </TooltipTrigger>
                                <TooltipContent>
                                  {present
                                    ? `Present in ${env.name}`
                                    : `Missing in ${env.name}`}
                                </TooltipContent>
                              </Tooltip>
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                    {fullyPresent.map((dup) => (
                      <TableRow key={dup.key}>
                        <TableCell>
                          <code className="rounded bg-muted/50 px-1.5 py-0.5 font-mono text-xs font-medium">
                            {dup.key}
                          </code>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {dup.isSecret && (
                              <Badge
                                variant="destructive"
                                className="text-[10px]"
                              >
                                secret
                              </Badge>
                            )}
                            {dup.isRequired && (
                              <Badge
                                variant="secondary"
                                className="text-[10px]"
                              >
                                required
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        {environments.map((env) => (
                          <TableCell key={env.id} className="text-center">
                            <Tooltip>
                              <TooltipTrigger
                                render={
                                  <span className="inline-flex size-5 items-center justify-center rounded-full bg-green-100 text-xs font-medium text-green-700 dark:bg-green-900/40 dark:text-green-400" />
                                }
                              >
                                {"\u2713"}
                              </TooltipTrigger>
                              <TooltipContent>
                                Present in {env.name}
                              </TooltipContent>
                            </Tooltip>
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                    {filtered.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={2 + environments.length}
                          className="py-8 text-center text-sm text-muted-foreground"
                        >
                          No matching keys found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TooltipProvider>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
