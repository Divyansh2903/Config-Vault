import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { decrypt } from "@/lib/security/encryption";
import { createAuditLog, AUDIT_ACTIONS } from "@/lib/audit/logger";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    const { token } = await params;

    const shareLink = await prisma.shareLink.findUnique({
      where: { token },
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

    if (shareLink.revokedAt) {
      return NextResponse.json(
        { error: "This share link has been revoked" },
        { status: 410 },
      );
    }

    if (shareLink.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "This share link has expired" },
        { status: 410 },
      );
    }

    if (shareLink.currentViews >= shareLink.maxViews) {
      return NextResponse.json(
        { error: "This share link has reached its maximum views" },
        { status: 410 },
      );
    }

    const updated = await prisma.shareLink.update({
      where: { id: shareLink.id },
      data: { currentViews: { increment: 1 } },
    });

    const entry = shareLink.configEntry;
    const value = entry.isSecret
      ? decrypt(entry.valueEncrypted!)
      : entry.valuePlain;

    const { projectId } = entry.environment;
    await createAuditLog({
      projectId,
      actorId: shareLink.createdBy,
      action: AUDIT_ACTIONS.SHARE_LINK_VIEWED,
      entityType: "share_link",
      entityId: shareLink.id,
    });

    return NextResponse.json({
      key: entry.key,
      value,
      description: entry.description,
      remainingViews: shareLink.maxViews - updated.currentViews,
      expiresAt: shareLink.expiresAt,
    });
  } catch (error) {
    console.error("Failed to access share link:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
