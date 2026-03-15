import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/60 bg-card/50 py-14 text-center">
      <div className="mb-4 text-muted-foreground/50">{icon}</div>
      <h3 className="text-sm font-medium">{title}</h3>
      <p className="mt-1.5 max-w-xs text-sm text-muted-foreground">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction} className="mt-5 shadow-sm shadow-primary/10">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
