import Link from "next/link";
import { Layers } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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

export function EnvironmentCard({
  projectId,
  environment,
}: EnvironmentCardProps) {
  const colorClass =
    ENV_COLORS[environment.slug] ?? "bg-secondary text-secondary-foreground";

  return (
    <Link
      href={`/projects/${projectId}/environments/${environment.id}`}
      className="block"
    >
      <Card className="transition-all duration-300 hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-md hover:shadow-primary/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="font-display">{environment.name}</CardTitle>
            <Badge className={colorClass}>{environment.slug}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Layers className="size-3.5" />
            {environment._count.entries}{" "}
            {environment._count.entries === 1 ? "entry" : "entries"}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
