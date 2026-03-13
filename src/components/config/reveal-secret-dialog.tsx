"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Copy, Loader2, AlertCircle } from "lucide-react";
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

interface RevealSecretDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entryId: string;
  entryKey: string;
}

export function RevealSecretDialog({
  open,
  onOpenChange,
  entryId,
  entryKey,
}: RevealSecretDialogProps) {
  const [value, setValue] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setValue(null);
      setError(null);
      return;
    }

    async function reveal() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/entries/${entryId}/reveal`, {
          method: "POST",
        });
        if (res.status === 403) {
          throw new Error("You don't have permission to reveal this secret");
        }
        if (!res.ok) throw new Error("Failed to reveal secret");
        const data = await res.json();
        setValue(data.value);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Something went wrong",
        );
      } finally {
        setLoading(false);
      }
    }

    reveal();
  }, [open, entryId]);

  function handleCopy() {
    if (value) {
      navigator.clipboard.writeText(value);
      toast.success("Secret copied to clipboard");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reveal Secret</DialogTitle>
          <DialogDescription>
            Viewing decrypted value for{" "}
            <code className="font-mono font-semibold">{entryKey}</code>
          </DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="size-4 shrink-0" />
            {error}
          </div>
        )}

        {value !== null && !loading && !error && (
          <div className="space-y-2">
            <Textarea
              readOnly
              value={value}
              className="min-h-[80px] font-mono text-sm"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="w-full"
            >
              <Copy className="size-4" />
              Copy to clipboard
            </Button>
          </div>
        )}

        <DialogFooter showCloseButton />
      </DialogContent>
    </Dialog>
  );
}
