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
      <div className="animate-fade-in-up mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Projects</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your configuration across all projects.
          </p>
        </div>
        <Button nativeButton={false} render={<Link href="/projects/new" />} className="shadow-sm shadow-primary/10">
          <Plus className="size-4" />
          New Project
        </Button>
      </div>

      {projects.length === 0 ? (
        <div className="animate-fade-in-up delay-100">
          <EmptyState
            icon={<FolderOpen className="size-10" />}
            title="No projects yet"
            description="Create your first project to start managing configuration and secrets."
          />
        </div>
      ) : (
        <div className="animate-fade-in-up delay-100 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
