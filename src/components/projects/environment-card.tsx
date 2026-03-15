import Link from "next/link";
import { Layers } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface EnvironmentCardProps {
  projectId: string;
  environment: {
    id: string;
    name: string;
    slug: string;
    _count: {
      entries: number;
    };
  };
}

const ENV_COLORS: Record<string, string> = {
  development:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  staging:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  production:
    "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

const ENV_ACCENT: Record<string, string> = {
  development: "from-green-400/60 to-green-500/20",
  staging: "from-yellow-400/60 to-yellow-500/20",
  production: "from-red-400/60 to-red-500/20",
};

export function EnvironmentCard({
  projectId,
  environment,
}: EnvironmentCardProps) {
  const colorClass =
    ENV_COLORS[environment.slug] ?? "bg-secondary text-secondary-foreground";
  const accentClass =
    ENV_ACCENT[environment.slug] ?? "from-primary/40 to-primary/10";

  return (
    <Link
      href={`/projects/${projectId}/environments/${environment.id}`}
      className="group block"
    >
      <Card className="relative overflow-hidden border-border/60 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/15 hover:shadow-lg hover:shadow-primary/5">
        {/* Left accent bar */}
        <div className={cn(
          "absolute top-0 left-0 h-full w-1 bg-linear-to-b opacity-60 transition-opacity duration-300 group-hover:opacity-100",
          accentClass
        )} />
        <CardHeader className="pl-5">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">{environment.name}</CardTitle>
            <Badge className={cn(colorClass, "transition-transform duration-200 group-hover:scale-105")}>
              {environment.slug}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pl-5">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Layers className="size-3.5 transition-transform duration-200 group-hover:scale-110" />
            {environment._count.entries}{" "}
            {environment._count.entries === 1 ? "entry" : "entries"}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
