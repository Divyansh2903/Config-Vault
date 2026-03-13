"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { toast } from "sonner";
import { Loader2, AlertTriangle } from "lucide-react";
import { rotateSecretSchema } from "@/lib/validations/schemas";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

type RotateValues = z.infer<typeof rotateSecretSchema>;

interface RotateSecretDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entryId: string;
  entryKey: string;
  onSuccess: () => void;
}

export function RotateSecretDialog({
  open,
  onOpenChange,
  entryId,
  entryKey,
  onSuccess,
}: RotateSecretDialogProps) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RotateValues>({
    resolver: zodResolver(rotateSecretSchema),
  });

  async function onSubmit(data: RotateValues) {
    setLoading(true);
    try {
      const res = await fetch(`/api/entries/${entryId}/rotate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? "Failed to rotate secret");
      }

      toast.success("Secret rotated successfully");
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rotate Secret</DialogTitle>
          <DialogDescription>
            Replace the value of{" "}
            <code className="font-mono font-semibold">{entryKey}</code> with a
            new secret.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2 rounded-lg border border-amber-500/50 bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-400">
          <AlertTriangle className="size-4 shrink-0" />
          This action will overwrite the current value. Any services using this
          secret may need to be updated.
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="newValue">New Value</Label>
            <Textarea
              id="newValue"
              placeholder="Enter new secret value…"
              className="font-mono text-sm"
              aria-invalid={!!errors.newValue}
              {...register("newValue")}
            />
            {errors.newValue && (
              <p className="text-xs text-destructive">
                {errors.newValue.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="size-4 animate-spin" />}
              Rotate Secret
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
