import Link from "next/link";
import { redirect } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import {
  FolderKanban,
  Activity,
  ArrowRight,
  Plus,
  Shield,
  GitBranch,
  Users,
} from "lucide-react";
import { requireUser } from "@/lib/auth/get-user";
import { humanizeAction } from "@/lib/audit/logger";
import { ProjectCard } from "@/components/projects/project-card";
import { EmptyState } from "@/components/layout/empty-state";
import { getDashboardData } from "@/lib/data/dashboard";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default async function DashboardPage() {
  let profile;
  try {
    const user = await requireUser();
    profile = user.profile;
  } catch {
    redirect("/login");
  }

  const { projects, auditLogs } = await getDashboardData(profile.id);

  const totalEnvs = projects.reduce((sum, p) => sum + p._count.environments, 0);
  const totalMembers = projects.reduce((sum, p) => sum + p._count.members, 0);

  const stats = [
    { label: "Projects", value: projects.length, icon: FolderKanban, color: "text-primary" },
    { label: "Environments", value: totalEnvs, icon: GitBranch, color: "text-emerald-600 dark:text-emerald-400" },
    { label: "Team Members", value: totalMembers, icon: Users, color: "text-blue-600 dark:text-blue-400" },
    { label: "Recent Actions", value: auditLogs.length, icon: Activity, color: "text-amber-600 dark:text-amber-400" },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome header + quick action */}
      <div className="animate-fade-in-up flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">
            {getGreeting()}, {profile.fullName}
          </h1>
          <p className="mt-1 text-muted-foreground">
            Here&apos;s what&apos;s happening across your projects.
          </p>
        </div>
        <Button nativeButton={false} render={<Link href="/projects/new" />} className="shadow-sm shadow-primary/10">
          <Plus className="size-4" />
          New Project
        </Button>
      </div>

      {/* Stats row */}
      <div className="animate-fade-in-up delay-100 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className={cn(
              "group relative overflow-hidden rounded-xl border border-border/60 bg-card p-4 transition-all duration-300 hover:border-border hover:shadow-sm",
            )}
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{stat.label}</p>
              <stat.icon className={cn("size-4", stat.color)} />
            </div>
            <p className="mt-2 font-display text-2xl font-bold tabular-nums">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Projects */}
      <section className="animate-fade-in-up delay-200 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Recent Projects</h2>
          {projects.length > 0 && (
            <Link
              href="/projects"
              className="group flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80"
            >
              View all
              <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
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

      {/* Recent Activity */}
      <section className="animate-fade-in-up delay-300 space-y-4">
        <h2 className="font-display text-lg font-semibold">Recent Activity</h2>
        {auditLogs.length === 0 ? (
          <EmptyState
            icon={<Activity className="size-10" />}
            title="No activity yet"
            description="Actions across your projects will appear here."
          />
        ) : (
          <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
            {auditLogs.map((log, i) => (
              <div
                key={log.id}
                className={cn(
                  "flex items-center gap-4 px-4 py-3 transition-colors hover:bg-muted/30",
                  i !== auditLogs.length - 1 && "border-b border-border/40"
                )}
              >
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/8">
                  <Activity className="size-3.5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">
                    {humanizeAction(log.action)}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {log.actor.fullName} in{" "}
                    <span className="font-medium text-foreground/70">{log.project.name}</span>
                  </p>
                </div>
                <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
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
