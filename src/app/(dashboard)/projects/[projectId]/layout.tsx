import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/get-user";
import { ProjectSubNav } from "@/components/projects/project-sub-nav";
import { getProjectOverviewCached } from "@/lib/data/projects";

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const { profile } = await requireUser();

  const overview = await getProjectOverviewCached(projectId, profile.id);

  if (!overview) redirect("/projects");

  return (
    <div>
      <ProjectSubNav projectId={projectId} isOwner={overview.membership.role === "OWNER"} />
      {children}
    </div>
  );
}
