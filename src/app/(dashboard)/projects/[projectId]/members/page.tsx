import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/get-user";
import { MemberManagementClient } from "@/components/members/member-management-client";
import { getProjectMembers } from "@/lib/data/projects";

const ROLE_ORDER = { OWNER: 0, EDITOR: 1, VIEWER: 2 } as const;

export const dynamic = "force-dynamic";

export default async function MembersPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const { profile } = await requireUser();

  const members = await getProjectMembers(projectId);

  const currentMember = members.find((m) => m.userId === profile.id);
  if (!currentMember) redirect("/projects");

  const isOwner = currentMember.role === "OWNER";

  const sortedMembers = [...members].sort(
    (a, b) => ROLE_ORDER[a.role] - ROLE_ORDER[b.role],
  );

  return (
    <div className="space-y-6">
      <div className="animate-fade-in-up">
        <h1 className="text-xl font-medium tracking-tight">Members</h1>
        <p className="mt-1 text-muted-foreground">
          Manage who has access to this project
        </p>
      </div>

      <div className="animate-fade-in-up delay-100">
        <MemberManagementClient
          projectId={projectId}
          members={sortedMembers.map((m) => ({
            id: m.id,
            userId: m.userId,
            role: m.role,
            canRevealSecrets: m.canRevealSecrets,
            canShareSecrets: m.canShareSecrets,
            user: m.user,
          }))}
          isOwner={isOwner}
          currentUserId={profile.id}
        />
      </div>
    </div>
  );
}
