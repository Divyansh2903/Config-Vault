import Link from "next/link";
import { format } from "date-fns";
import { Users, GitBranch, ArrowUpRight } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ProjectCardProps {
  project: {
    id: string;
    name: string;
    description: string | null;
    createdAt: Date;
    _count: {
      members: number;
      environments: number;
    };
  };
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link href={`/projects/${project.id}`} className="group block">
      <Card className="relative overflow-hidden border-border/60 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5">
        <div className="pointer-events-none absolute top-0 right-0 p-3 text-muted-foreground/0 transition-all duration-300 group-hover:text-muted-foreground/40">
          <ArrowUpRight className="size-4" />
        </div>
        <CardHeader className="pb-2">
          <CardTitle className="font-display text-base">{project.name}</CardTitle>
          {project.description && (
            <CardDescription className="line-clamp-2 text-[13px]">
              {project.description}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="gap-1 text-xs">
              <Users className="size-3" />
              {project._count.members}
            </Badge>
            <Badge variant="secondary" className="gap-1 text-xs">
              <GitBranch className="size-3" />
              {project._count.environments}
            </Badge>
          </div>
        </CardContent>
        <CardFooter className="border-t border-border/40 pt-3">
          <span className="text-xs text-muted-foreground">
            Created {format(project.createdAt, "MMM d, yyyy")}
          </span>
        </CardFooter>
      </Card>
    </Link>
  );
}
