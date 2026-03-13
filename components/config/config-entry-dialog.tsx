"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { configEntrySchema } from "@/lib/validations/schemas";
import type { SafeConfigEntry } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

type ConfigEntryValues = z.infer<typeof configEntrySchema>;

interface ConfigEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  environmentId: string;
  entry?: SafeConfigEntry;
  onSuccess: () => void;
}

export function ConfigEntryDialog({
  open,
  onOpenChange,
  environmentId,
  entry,
  onSuccess,
}: ConfigEntryDialogProps) {
  const [loading, setLoading] = useState(false);
  const isEdit = !!entry;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ConfigEntryValues>({
    resolver: zodResolver(configEntrySchema),
    defaultValues: {
      key: entry?.key ?? "",
      value: entry?.value ?? "",
      description: entry?.description ?? "",
      isSecret: entry?.isSecret ?? false,
      isRequired: entry?.isRequired ?? false,
    },
  });

  const isSecret = watch("isSecret");
  const isRequired = watch("isRequired");
  const keyValue = watch("key");

  useEffect(() => {
    if (open) {
      reset({
        key: entry?.key ?? "",
        value: entry?.value ?? "",
        description: entry?.description ?? "",
        isSecret: entry?.isSecret ?? false,
        isRequired: entry?.isRequired ?? false,
      });
    }
  }, [open, entry, reset]);

  const keyIsValid = /^[A-Z][A-Z0-9_]*$/.test(keyValue || "");

  async function onSubmit(data: ConfigEntryValues) {
    setLoading(true);
    try {
      const url = isEdit
        ? `/api/entries/${entry.id}`
        : `/api/environments/${environmentId}/entries`;
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? "Request failed");
      }

      toast.success(isEdit ? "Entry updated" : "Entry created");
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Entry" : "Add Entry"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the configuration entry."
              : "Add a new configuration entry to this environment."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="key">Key</Label>
            <Input
              id="key"
              placeholder="DATABASE_URL"
              aria-invalid={!!errors.key}
              {...register("key")}
            />
            {errors.key ? (
              <p className="text-xs text-destructive">{errors.key.message}</p>
            ) : keyValue && !keyIsValid ? (
              <p className="text-xs text-muted-foreground">
                Must be UPPER_SNAKE_CASE (e.g. DATABASE_URL)
              </p>
            ) : null}
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="value">Value</Label>
            <Textarea
              id="value"
              placeholder="Enter value…"
              className="font-mono text-sm"
              aria-invalid={!!errors.value}
              {...register("value")}
            />
            {errors.value && (
              <p className="text-xs text-destructive">
                {errors.value.message}
              </p>
            )}
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Optional description…"
              {...register("description")}
            />
            {errors.description && (
              <p className="text-xs text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="isSecret">Secret</Label>
            <Switch
              id="isSecret"
              checked={isSecret}
              onCheckedChange={(val) => setValue("isSecret", val)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="isRequired">Required</Label>
            <Switch
              id="isRequired"
              checked={isRequired}
              onCheckedChange={(val) => setValue("isRequired", val)}
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="size-4 animate-spin" />}
              {isEdit ? "Save Changes" : "Create Entry"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
