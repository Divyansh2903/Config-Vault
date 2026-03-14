import Link from "next/link";
import { Plus, FolderOpen } from "lucide-react";
import { requireUser } from "@/lib/auth/get-user";
import { Button } from "@/components/ui/button";
import { ProjectCard } from "@/components/projects/project-card";
import { EmptyState } from "@/components/layout/empty-state";
import { getUserProjects } from "@/lib/data/projects";

export default async function ProjectsPage() {
  const { profile } = await requireUser();

  const projects = await getUserProjects(profile.id);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Projects</h1>
        <Button nativeButton={false} render={<Link href="/projects/new" />}>
          <Plus className="size-4" />
          New Project
        </Button>
      </div>

      {projects.length === 0 ? (
        <EmptyState
          icon={<FolderOpen className="size-10" />}
          title="No projects yet"
          description="Create your first project to start managing configuration and secrets."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
