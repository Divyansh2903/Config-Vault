"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function CopyShareValue({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    toast.success("Value copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="relative">
      <pre className="overflow-x-auto rounded-lg border border-border/60 bg-muted/40 p-4 pr-12 font-mono text-sm leading-relaxed">
        {value}
      </pre>
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-2 text-muted-foreground hover:text-foreground"
        onClick={handleCopy}
      >
        {copied ? (
          <Check className="size-4 text-green-500" />
        ) : (
          <Copy className="size-4" />
        )}
      </Button>
    </div>
  );
}
