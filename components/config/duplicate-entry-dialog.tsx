"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { duplicateEntrySchema } from "@/lib/validations/schemas";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type DuplicateValues = z.infer<typeof duplicateEntrySchema>;

interface EnvironmentOption {
  id: string;
  name: string;
}

interface DuplicateEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entryId: string;
  entryKey: string;
  projectId: string;
  currentEnvironmentId: string;
  onSuccess: () => void;
}

export function DuplicateEntryDialog({
  open,
  onOpenChange,
  entryId,
  entryKey,
  projectId,
  currentEnvironmentId,
  onSuccess,
}: DuplicateEntryDialogProps) {
  const [environments, setEnvironments] = useState<EnvironmentOption[]>([]);
  const [fetchingEnvs, setFetchingEnvs] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    watch,
    setValue,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DuplicateValues>({
    resolver: zodResolver(duplicateEntrySchema),
    defaultValues: { targetEnvironmentId: "" },
  });

  const selectedEnvId = watch("targetEnvironmentId");

  useEffect(() => {
    if (!open) return;

    async function fetchEnvironments() {
      setFetchingEnvs(true);
      try {
        const res = await fetch(`/api/projects/${projectId}/environments`);
        if (!res.ok) throw new Error("Failed to fetch environments");
        const data: EnvironmentOption[] = await res.json();
        setEnvironments(
          data.filter((env) => env.id !== currentEnvironmentId),
        );
      } catch {
        toast.error("Failed to load environments");
      } finally {
        setFetchingEnvs(false);
      }
    }

    fetchEnvironments();
  }, [open, projectId, currentEnvironmentId]);

  async function onSubmit(data: DuplicateValues) {
    setLoading(true);
    try {
      const res = await fetch(`/api/entries/${entryId}/duplicate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? "Failed to duplicate entry");
      }

      toast.success(`Duplicated ${entryKey} to target environment`);
      reset();
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Something went wrong",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!val) reset();
        onOpenChange(val);
      }}
    >
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Duplicate Entry</DialogTitle>
          <DialogDescription>
            Copy{" "}
            <code className="font-mono font-semibold">{entryKey}</code> to
            another environment.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
          <div className="grid gap-1.5">
            <Label>Target Environment</Label>
            {fetchingEnvs ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                Loading environments…
              </div>
            ) : environments.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No other environments available.
              </p>
            ) : (
              <Select
                value={selectedEnvId}
                onValueChange={(val) =>
                  setValue("targetEnvironmentId", val ?? "", {
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select environment" />
                </SelectTrigger>
                <SelectContent>
                  {environments.map((env) => (
                    <SelectItem key={env.id} value={env.id}>
                      {env.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {errors.targetEnvironmentId && (
              <p className="text-xs text-destructive">
                {errors.targetEnvironmentId.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="submit"
              disabled={loading || fetchingEnvs || environments.length === 0}
            >
              {loading && <Loader2 className="size-4 animate-spin" />}
              Duplicate
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
