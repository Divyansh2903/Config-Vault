"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Sparkles, AlertCircle } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Suggestion {
  key: string;
  description: string;
  is_secret: boolean;
  is_required: boolean;
}

interface SmartConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  environmentId: string;
  onImport: (suggestions: Suggestion[]) => void;
}

export function SmartConfigDialog({
  open,
  onOpenChange,
  onImport,
}: SmartConfigDialogProps) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);

  function handleClose(next: boolean) {
    if (!next) {
      setPrompt("");
      setSuggestions([]);
      setSelected(new Set());
      setError(null);
    }
    onOpenChange(next);
  }

  async function handleSuggest() {
    setLoading(true);
    setError(null);
    setSuggestions([]);
    setSelected(new Set());

    try {
      const res = await fetch("/api/ai/suggest-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (res.status === 503) {
        setError(
          "AI features are not configured. Set GEMINI_API_KEY to enable.",
        );
        return;
      }

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? "Failed to get suggestions");
      }

      const data = await res.json();
      const items: Suggestion[] = data.suggestions ?? [];

      if (items.length === 0) {
        setError("No suggestions were returned. Try a more specific prompt.");
        return;
      }

      setSuggestions(items);
      setSelected(new Set(items.map((_, i) => i)));
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Something went wrong",
      );
    } finally {
      setLoading(false);
    }
  }

  function toggleRow(index: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  function handleImportSelected() {
    const items = suggestions.filter((_, i) => selected.has(i));
    onImport(items);
    toast.success(`Imported ${items.length} suggested config entries`);
    handleClose(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="size-4 text-amber-500" />
            Smart Config Assistant
          </DialogTitle>
          <DialogDescription>
            Describe your project or paste an error — the AI will suggest
            relevant environment variables.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="ai-prompt">What do you need?</Label>
            <Textarea
              id="ai-prompt"
              placeholder="e.g. I need env vars for a Next.js app with Supabase and Stripe"
              className="min-h-[100px] text-sm"
              value={prompt}
              onChange={(e) => {
                setPrompt(e.target.value);
                setError(null);
              }}
              disabled={loading}
            />
          </div>

          <Button
            onClick={handleSuggest}
            disabled={loading || prompt.trim().length === 0}
            className="w-fit"
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Thinking…
              </>
            ) : (
              <>
                <Sparkles className="size-4" />
                Suggest
              </>
            )}
          </Button>

          {error && (
            <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              {error}
            </div>
          )}

          {suggestions.length > 0 && (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10" />
                    <TableHead>Key</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="w-24 text-center">Flags</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {suggestions.map((s, i) => (
                    <TableRow
                      key={s.key}
                      className="cursor-pointer"
                      onClick={() => toggleRow(i)}
                    >
                      <TableCell>
                        <Checkbox
                          checked={selected.has(i)}
                          onCheckedChange={() => toggleRow(i)}
                        />
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {s.key}
                      </TableCell>
                      <TableCell className="max-w-[260px] truncate text-muted-foreground">
                        {s.description}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-center gap-1">
                          {s.is_secret && (
                            <Badge variant="destructive" className="text-[10px]">
                              secret
                            </Badge>
                          )}
                          {s.is_required && (
                            <Badge variant="secondary" className="text-[10px]">
                              required
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleClose(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          {suggestions.length > 0 && (
            <Button onClick={handleImportSelected} disabled={selected.size === 0}>
              <Sparkles className="size-4" />
              Import Selected ({selected.size})
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
