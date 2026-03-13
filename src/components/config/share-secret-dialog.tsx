"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Copy, Check, Link } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ShareSecretDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entryId: string;
  entryKey: string;
  onSuccess: () => void;
}

const DURATION_OPTIONS = [
  { label: "1 hour", value: "1" },
  { label: "6 hours", value: "6" },
  { label: "24 hours", value: "24" },
  { label: "7 days", value: "168" },
];

const MAX_VIEWS_OPTIONS = [
  { label: "1", value: "1" },
  { label: "3", value: "3" },
  { label: "5", value: "5" },
];

interface ShareResult {
  id: string;
  token: string;
  url: string;
  expiresAt: string;
  maxViews: number;
}

export function ShareSecretDialog({
  open,
  onOpenChange,
  entryId,
  entryKey,
  onSuccess,
}: ShareSecretDialogProps) {
  const [loading, setLoading] = useState(false);
  const [expiresInHours, setExpiresInHours] = useState("24");
  const [maxViews, setMaxViews] = useState("1");
  const [result, setResult] = useState<ShareResult | null>(null);
  const [copied, setCopied] = useState(false);

  function resetState() {
    setExpiresInHours("24");
    setMaxViews("1");
    setResult(null);
    setCopied(false);
  }

  async function handleSubmit() {
    setLoading(true);
    try {
      const res = await fetch(`/api/entries/${entryId}/share-links`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          expiresInHours: Number(expiresInHours),
          maxViews: Number(maxViews),
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? "Failed to create share link");
      }

      const data: ShareResult = await res.json();
      setResult(data);
      onSuccess();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Something went wrong",
      );
    } finally {
      setLoading(false);
    }
  }

  function getFullUrl() {
    if (!result) return "";
    return `${window.location.origin}${result.url}`;
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(getFullUrl());
    setCopied(true);
    toast.success("Link copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!val) resetState();
        onOpenChange(val);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link className="size-4" />
            Share Secret
          </DialogTitle>
          <DialogDescription>
            Create a secure, temporary link for{" "}
            <code className="font-mono font-semibold">{entryKey}</code>
          </DialogDescription>
        </DialogHeader>

        {!result ? (
          <div className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="duration">Link Duration</Label>
              <Select value={expiresInHours} onValueChange={(v) => setExpiresInHours(v ?? "24")}>
                <SelectTrigger id="duration">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DURATION_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="maxViews">Maximum Views</Label>
              <Select value={maxViews} onValueChange={(v) => setMaxViews(v ?? "1")}>
                <SelectTrigger id="maxViews">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MAX_VIEWS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button onClick={handleSubmit} disabled={loading}>
                {loading && <Loader2 className="size-4 animate-spin" />}
                Generate Link
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="grid gap-4">
            <div className="grid gap-1.5">
              <Label>Share URL</Label>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={getFullUrl()}
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopy}
                  className="shrink-0"
                >
                  {copied ? (
                    <Check className="size-4 text-green-500" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                </Button>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              This link will expire in{" "}
              {DURATION_OPTIONS.find((o) => o.value === expiresInHours)?.label} and
              can be viewed {maxViews} time{maxViews !== "1" ? "s" : ""}.
            </p>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  resetState();
                  onOpenChange(false);
                }}
              >
                Done
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
