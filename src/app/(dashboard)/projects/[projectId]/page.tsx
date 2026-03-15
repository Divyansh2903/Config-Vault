import Link from "next/link";
import { format } from "date-fns";
import { Plus, Activity, Layers, Users, Shield, KeyRound } from "lucide-react";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/get-user";
import { humanizeAction } from "@/lib/audit/logger";
import { Button } from "@/components/ui/button";
import { EnvironmentCard } from "@/components/projects/environment-card";
import { EmptyState } from "@/components/layout/empty-state";
import { getProjectOverviewCached } from "@/lib/data/projects";
import { cn } from "@/lib/utils";

export default async function ProjectOverviewPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const { profile } = await requireUser();

  const overview = await getProjectOverviewCached(projectId, profile.id);

  if (!overview) redirect("/projects");

  const { project, membership } = overview;

  const isOwner = membership.role === "OWNER";

  const totalEntries = project.environments.reduce(
    (sum: number, env: { _count: { entries: number } }) => sum + env._count.entries,
    0
  );

  const stats = [
    { label: "Environments", value: project.environments.length, icon: Layers },
    { label: "Config Entries", value: totalEntries, icon: KeyRound },
    { label: "Members", value: project.members.length, icon: Users },
    { label: "Audit Events", value: project.auditLogs.length, icon: Activity },
  ];

  return (
    <div className="space-y-8">
      {/* Project header */}
      <div className="animate-fade-in-up">
        <h1 className="text-xl font-medium tracking-tight">{project.name}</h1>
        {project.description && (
          <p className="mt-1 text-muted-foreground">{project.description}</p>
        )}
      </div>

      {/* Quick stats */}
      <div className="animate-fade-in-up delay-100 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex items-center gap-3 rounded-xl border border-border/60 bg-card px-4 py-3 transition-all hover:border-border hover:shadow-sm"
          >
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/8">
              <stat.icon className="size-4 text-primary" />
            </div>
            <div>
              <p className="text-lg font-medium tabular-nums leading-tight">{stat.value}</p>
              <p className="text-[11px] tracking-wide text-muted-foreground">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Environments */}
      <section className="animate-fade-in-up delay-200">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-medium">Environments</h2>
          {isOwner && (
            <Button
              size="sm"
              nativeButton={false}
              render={
                <Link href={`/projects/${projectId}/environments/new`} />
              }
              className="shadow-sm shadow-primary/10"
            >
              <Plus className="size-4" />
              Add Environment
            </Button>
          )}
        </div>

        {project.environments.length === 0 ? (
          <EmptyState
            icon={<Layers className="size-10" />}
            title="No environments yet"
            description={isOwner ? "Create one to start adding config entries." : "No environments have been created."}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {project.environments.map((env) => (
              <EnvironmentCard
                key={env.id}
                projectId={projectId}
                environment={env}
              />
            ))}
          </div>
        )}
      </section>

      {/* Recent Activity */}
      <section className="animate-fade-in-up delay-300">
        <h2 className="mb-4 text-base font-medium">Recent Activity</h2>

        {project.auditLogs.length === 0 ? (
          <EmptyState
            icon={<Activity className="size-10" />}
            title="No activity yet"
            description="Actions in this project will appear here."
          />
        ) : (
          <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
            {project.auditLogs.map((log, i) => (
              <div
                key={log.id}
                className={cn(
                  "flex items-center gap-4 px-4 py-3 transition-colors hover:bg-muted/30",
                  i !== project.auditLogs.length - 1 && "border-b border-border/40"
                )}
              >
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <Activity className="size-3.5 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-sm">
                    <span className="font-medium">{log.actor.fullName}</span>{" "}
                    <span className="text-muted-foreground">{humanizeAction(log.action).toLowerCase()}</span>
                  </span>
                </div>
                <time className="shrink-0 text-xs tabular-nums text-muted-foreground">
                  {format(log.createdAt, "MMM d, h:mm a")}
                </time>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
