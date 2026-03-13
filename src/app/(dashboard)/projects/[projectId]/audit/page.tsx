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
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          Audit Log
        </h1>
        <p className="text-sm text-muted-foreground">
          Track all activity and changes within this project.
        </p>
      </div>
      <AuditLogClient projectId={projectId} members={memberList} />
    </div>
  );
}
