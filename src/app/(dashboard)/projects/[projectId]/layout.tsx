import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/get-user";
import { ProjectSubNav } from "@/components/projects/project-sub-nav";
import { getProjectShell } from "@/lib/data/projects";

export const dynamic = "force-dynamic";

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const { profile } = await requireUser();

  const shell = await getProjectShell(profile.id, projectId);

  if (!shell) redirect("/projects");

  const { member } = shell;

  return (
    <div>
      <ProjectSubNav projectId={projectId} isOwner={member.role === "OWNER"} />
      {children}
    </div>
  );
}
