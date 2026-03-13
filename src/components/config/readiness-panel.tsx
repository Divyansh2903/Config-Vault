"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface EnvironmentReadiness {
  id: string;
  name: string;
  slug: string;
  presentKeys: string[];
}

interface ReadinessData {
  requiredKeys: string[];
  environments: EnvironmentReadiness[];
}

interface ReadinessPanelProps {
  projectId: string;
}

export function ReadinessPanel({ projectId }: ReadinessPanelProps) {
  const [data, setData] = useState<ReadinessData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchReadiness() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/projects/${projectId}/readiness`);
        if (!res.ok) throw new Error("Failed to fetch readiness data");
        const json: ReadinessData = await res.json();
        setData(json);
      } catch {
        setError("Could not load readiness data.");
      } finally {
        setLoading(false);
      }
    }

    fetchReadiness();
  }, [projectId]);

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-sm text-destructive">{error}</p>
    );
  }

  if (!data || data.requiredKeys.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-6 text-center">
        <p className="text-sm text-muted-foreground">
          No required keys defined. Mark config entries as required to track
          readiness across environments.
        </p>
      </div>
    );
  }

  const totalCells = data.requiredKeys.length * data.environments.length;
  let presentCount = 0;
  const presentSets = new Map<string, Set<string>>();

  for (const env of data.environments) {
    const keySet = new Set(env.presentKeys);
    presentSets.set(env.id, keySet);
    for (const key of data.requiredKeys) {
      if (keySet.has(key)) presentCount++;
    }
  }

  const missingCount = totalCells - presentCount;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <p className="text-sm font-medium">
          {presentCount} of {totalCells} required keys are present across all
          environments
        </p>
        {missingCount > 0 && (
          <Badge variant="destructive" className="gap-1">
            <AlertTriangle className="size-3" />
            {missingCount} missing
          </Badge>
        )}
      </div>

      <div className="overflow-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="sticky left-0 bg-background">Key</TableHead>
              {data.environments.map((env) => (
                <TableHead key={env.id} className="text-center">
                  {env.name}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.requiredKeys.map((key) => (
              <TableRow key={key}>
                <TableCell className="sticky left-0 bg-background font-mono text-sm">
                  {key}
                </TableCell>
                {data.environments.map((env) => {
                  const has = presentSets.get(env.id)?.has(key);
                  return (
                    <TableCell key={env.id} className="text-center">
                      {has ? (
                        <CheckCircle className="mx-auto size-5 text-green-500" />
                      ) : (
                        <XCircle className="mx-auto size-5 text-red-500" />
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
