import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/get-user";
import { AuditLogClient } from "@/components/audit/audit-log-client";
import { getProjectMembers } from "@/lib/data/projects";

export const dynamic = "force-dynamic";

export default async function AuditLogPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { profile } = await requireUser();
  const { projectId } = await params;

  const members = await getProjectMembers(projectId);

  const member = members.find((m) => m.userId === profile.id);
  if (!member) redirect("/projects");

  const memberList = members.map((m) => ({
    id: m.user.id,
    fullName: m.user.fullName,
  }));

  return (
    <div className="space-y-6">
      <div className="animate-fade-in-up">
        <h1 className="text-xl font-medium tracking-tight">
          Audit Log
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track all activity and changes within this project.
        </p>
      </div>
      <div className="animate-fade-in-up delay-100">
        <AuditLogClient projectId={projectId} members={memberList} />
      </div>
    </div>
  );
}
