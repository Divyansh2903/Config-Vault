import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { requireUser } from "@/lib/auth/get-user";
import { prisma } from "@/lib/db/prisma";
import { can } from "@/lib/permissions";
import { ConfigTableClient } from "@/components/config/config-table-client";
import { getEnvironmentMeta } from "@/lib/data/environments";

export default async function EnvironmentDetailPage({
  params,
}: {
  params: Promise<{ projectId: string; envId: string }>;
}) {
  const { projectId, envId } = await params;
  const { profile } = await requireUser();

  if (envId === "new") {
    redirect(`/projects/${projectId}`);
  }

  const [environment, member] = await Promise.all([
    getEnvironmentMeta(envId),
    prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId: profile.id,
        },
      },
    }),
  ]);

  if (!environment || environment.projectId !== projectId) {
    redirect(`/projects/${projectId}`);
  }

  if (!member) redirect("/projects");

  const canRevealSecrets = can(member, "reveal_secret");
  const canShareSecrets = can(member, "share_secret");

  return (
    <div className="space-y-6">
      {/* Breadcrumb + title */}
      <div className="animate-fade-in-up">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Link
            href={`/projects/${projectId}`}
            className="transition-colors hover:text-foreground"
          >
            {environment.project.name}
          </Link>
          <ChevronRight className="size-3" />
          <span className="font-medium text-foreground">
            {environment.name}
          </span>
        </div>
        <h1 className="mt-2 font-display text-2xl font-bold tracking-tight">
          {environment.name}
        </h1>
      </div>

      <div className="animate-fade-in-up delay-100">
        <ConfigTableClient
          environmentId={envId}
          projectId={projectId}
          userRole={member.role}
          canRevealSecrets={canRevealSecrets}
          canShareSecrets={canShareSecrets}
        />
      </div>
    </div>
  );
}
