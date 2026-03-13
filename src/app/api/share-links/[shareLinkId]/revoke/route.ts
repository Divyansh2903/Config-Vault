import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth/get-user";
import { prisma } from "@/lib/db/prisma";
import { createAuditLog, AUDIT_ACTIONS } from "@/lib/audit/logger";
import { can } from "@/lib/permissions";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ shareLinkId: string }> },
) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { shareLinkId } = await params;

    const shareLink = await prisma.shareLink.findUnique({
      where: { id: shareLinkId },
      include: {
        configEntry: {
          include: { environment: { select: { projectId: true } } },
        },
      },
    });
    if (!shareLink) {
      return NextResponse.json(
        { error: "Share link not found" },
        { status: 404 },
      );
    }

    const { projectId } = shareLink.configEntry.environment;
    const member = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId: user.profile.id } },
    });
    if (
      !member ||
      (!can(member, "share_secret") && !can(member, "manage_members"))
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (shareLink.revokedAt) {
      return NextResponse.json(
        { error: "Share link is already revoked" },
        { status: 400 },
      );
    }

    await prisma.shareLink.update({
      where: { id: shareLinkId },
      data: { revokedAt: new Date() },
    });

    await createAuditLog({
      projectId,
      actorId: user.profile.id,
      action: AUDIT_ACTIONS.SHARE_LINK_REVOKED,
      entityType: "share_link",
      entityId: shareLinkId,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to revoke share link:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
