import Link from "next/link";
import { format } from "date-fns";
import { Plus, Activity } from "lucide-react";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/get-user";
import { humanizeAction } from "@/lib/audit/logger";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EnvironmentCard } from "@/components/projects/environment-card";
import { getProjectOverviewCached } from "@/lib/data/projects";

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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold">{project.name}</h1>
        {project.description && (
          <p className="mt-1 text-muted-foreground">{project.description}</p>
        )}
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Environments</h2>
          {isOwner && (
            <Button
              size="sm"
              nativeButton={false}
              render={
                <Link href={`/projects/${projectId}/environments/new`} />
              }
            >
              <Plus className="size-4" />
              Add Environment
            </Button>
          )}
        </div>

        {project.environments.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No environments yet.{" "}
            {isOwner && "Create one to start adding config entries."}
          </p>
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

      <section>
        <h2 className="mb-4 font-display text-lg font-semibold">Recent Activity</h2>

        {project.auditLogs.length === 0 ? (
          <p className="text-sm text-muted-foreground">No activity yet.</p>
        ) : (
          <Card>
            <CardContent className="divide-y">
              {project.auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                >
                  <div className="flex items-center gap-2">
                    <Activity className="size-3.5 text-muted-foreground" />
                    <span className="text-sm">
                      <span className="font-medium">
                        {log.actor.fullName}
                      </span>{" "}
                      {humanizeAction(log.action).toLowerCase()}
                    </span>
                  </div>
                  <time className="text-xs text-muted-foreground">
                    {format(log.createdAt, "MMM d, h:mm a")}
                  </time>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}
