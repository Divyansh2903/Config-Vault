"use client";

import { useState, useMemo } from "react";
import { toast } from "sonner";
import { Loader2, Upload, FileWarning } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

const KEY_PATTERN = /^[A-Z][A-Z0-9_]*$/;

function parsePreview(content: string) {
  const keys: string[] = [];
  const invalid: string[] = [];

  for (const rawLine of content.split("\n")) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const eqIndex = line.indexOf("=");
    if (eqIndex === -1) {
      invalid.push(line.slice(0, 40));
      continue;
    }

    const key = line.slice(0, eqIndex).trim();
    if (KEY_PATTERN.test(key)) {
      keys.push(key);
    } else {
      invalid.push(key);
    }
  }

  return { keys, invalid };
}

interface ImportResult {
  imported: number;
  skipped: string[];
  errors: string[];
}

interface ImportEnvDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  environmentId: string;
  onSuccess: () => void;
}

export function ImportEnvDialog({
  open,
  onOpenChange,
  environmentId,
  onSuccess,
}: ImportEnvDialogProps) {
  const [content, setContent] = useState("");
  const [treatAsSecrets, setTreatAsSecrets] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  const preview = useMemo(
    () => (content.trim() ? parsePreview(content) : null),
    [content],
  );

  function handleClose(open: boolean) {
    if (!open) {
      setContent("");
      setTreatAsSecrets(false);
      setResult(null);
    }
    onOpenChange(open);
  }

  async function handleImport() {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`/api/environments/${environmentId}/import`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, treatAsSecrets }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? "Import failed");
      }

      const data: ImportResult = await res.json();
      setResult(data);

      if (data.imported > 0) {
        toast.success(`Imported ${data.imported} config entries`);
        onSuccess();
      } else {
        toast.info("No new entries were imported");
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Something went wrong",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Import .env File</DialogTitle>
          <DialogDescription>
            Paste the contents of your .env file below. Each line should follow
            the KEY=value format.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="env-content">Environment variables</Label>
            <Textarea
              id="env-content"
              placeholder={"DATABASE_URL=postgres://...\nAPI_KEY=sk-..."}
              className="min-h-[160px] font-mono text-sm"
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                setResult(null);
              }}
              disabled={loading}
            />
          </div>

          <div className="flex items-center gap-3">
            <Switch
              id="treat-secrets"
              checked={treatAsSecrets}
              onCheckedChange={setTreatAsSecrets}
              disabled={loading}
            />
            <Label htmlFor="treat-secrets">
              Treat imported values as secrets
            </Label>
          </div>

          {preview && preview.keys.length > 0 && !result && (
            <div className="rounded-md border bg-muted/50 p-3">
              <p className="mb-2 text-xs font-medium text-muted-foreground">
                Preview — {preview.keys.length} key{preview.keys.length !== 1 && "s"} detected
              </p>
              <div className="flex flex-wrap gap-1.5">
                {preview.keys.map((key) => (
                  <Badge key={key} variant="secondary" className="font-mono text-xs">
                    {key}
                  </Badge>
                ))}
              </div>
              {preview.invalid.length > 0 && (
                <p className="mt-2 text-xs text-destructive">
                  <FileWarning className="mr-1 inline size-3" />
                  {preview.invalid.length} invalid line{preview.invalid.length !== 1 && "s"} will be skipped
                </p>
              )}
            </div>
          )}

          {result && (
            <div className="space-y-2 rounded-md border p-3 text-sm">
              <p>
                <span className="font-medium text-green-600">
                  {result.imported}
                </span>{" "}
                imported
              </p>
              {result.skipped.length > 0 && (
                <div>
                  <p className="text-muted-foreground">
                    Skipped (already exist):
                  </p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {result.skipped.map((key) => (
                      <Badge
                        key={key}
                        variant="outline"
                        className="font-mono text-xs"
                      >
                        {key}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {result.errors.length > 0 && (
                <div>
                  <p className="text-destructive">Errors:</p>
                  <ul className="mt-1 list-inside list-disc text-xs text-destructive">
                    {result.errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleClose(false)}
            disabled={loading}
          >
            {result ? "Close" : "Cancel"}
          </Button>
          {!result && (
            <Button
              onClick={handleImport}
              disabled={loading || !preview || preview.keys.length === 0}
            >
              {loading && <Loader2 className="size-4 animate-spin" />}
              <Upload className="size-4" />
              Import
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
