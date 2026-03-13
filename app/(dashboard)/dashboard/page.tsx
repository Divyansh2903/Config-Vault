import Link from "next/link";
import { redirect } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { FolderKanban, Activity } from "lucide-react";
import { requireUser } from "@/lib/auth/get-user";
import { humanizeAction } from "@/lib/audit/logger";
import { ProjectCard } from "@/components/projects/project-card";
import { EmptyState } from "@/components/layout/empty-state";
import { getDashboardData } from "@/lib/data/dashboard";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  let profile;
  try {
    const user = await requireUser();
    profile = user.profile;
  } catch {
    redirect("/login");
  }

  const { projects, auditLogs } = await getDashboardData(profile.id);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">
          Welcome back, {profile.fullName}
        </h1>
        <p className="text-muted-foreground">
          Here&apos;s what&apos;s happening across your projects.
        </p>
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Recent Projects</h2>
          {projects.length > 0 && (
            <Link
              href="/projects"
              className="text-sm text-primary hover:underline"
            >
              View all
            </Link>
          )}
        </div>
        {projects.length === 0 ? (
          <EmptyState
            icon={<FolderKanban className="size-10" />}
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
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-lg font-semibold">Recent Activity</h2>
        {auditLogs.length === 0 ? (
          <EmptyState
            icon={<Activity className="size-10" />}
            title="No activity yet"
            description="Actions across your projects will appear here."
          />
        ) : (
          <div className="divide-y rounded-lg border">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-start justify-between gap-4 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium">
                    {humanizeAction(log.action)}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {log.actor.fullName} in {log.project.name}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {formatDistanceToNow(log.createdAt, { addSuffix: true })}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
