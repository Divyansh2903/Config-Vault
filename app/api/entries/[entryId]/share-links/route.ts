import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { getUser } from "@/lib/auth/get-user";
import { prisma } from "@/lib/db/prisma";
import { shareLinkSchema } from "@/lib/validations/schemas";
import { createAuditLog, AUDIT_ACTIONS } from "@/lib/audit/logger";
import { can } from "@/lib/permissions";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ entryId: string }> },
) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { entryId } = await params;

    const entry = await prisma.configEntry.findUnique({
      where: { id: entryId },
      include: { environment: { select: { projectId: true } } },
    });
    if (!entry) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    const { projectId } = entry.environment;
    const member = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId: user.profile.id } },
    });
    if (!member || !can(member, "share_secret")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = shareLinkSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
    }

    const token = nanoid(32);
    const expiresAt = new Date(
      Date.now() + parsed.data.expiresInHours * 60 * 60 * 1000,
    );

    const shareLink = await prisma.shareLink.create({
      data: {
        configEntryId: entryId,
        token,
        createdBy: user.profile.id,
        expiresAt,
        maxViews: parsed.data.maxViews,
      },
    });

    await createAuditLog({
      projectId,
      actorId: user.profile.id,
      action: AUDIT_ACTIONS.SHARE_LINK_CREATED,
      entityType: "share_link",
      entityId: shareLink.id,
      metadata: { token, expiresAt: expiresAt.toISOString(), maxViews: parsed.data.maxViews },
    });

    return NextResponse.json(
      {
        id: shareLink.id,
        token,
        url: `/share/${token}`,
        expiresAt,
        maxViews: shareLink.maxViews,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Failed to create share link:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
