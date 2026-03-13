import Link from "next/link";
import { format } from "date-fns";
import { Users, GitBranch } from "lucide-react";
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
    <Link href={`/projects/${project.id}`} className="block">
      <Card className="transition-all duration-300 hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-md hover:shadow-primary/5">
        <CardHeader>
          <CardTitle className="font-display">{project.name}</CardTitle>
          {project.description && (
            <CardDescription className="line-clamp-2">
              {project.description}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="gap-1">
              <Users className="size-3" />
              {project._count.members}
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <GitBranch className="size-3" />
              {project._count.environments}
            </Badge>
          </div>
        </CardContent>
        <CardFooter>
          <span className="text-xs text-muted-foreground">
            Created {format(project.createdAt, "MMM d, yyyy")}
          </span>
        </CardFooter>
      </Card>
    </Link>
  );
}
