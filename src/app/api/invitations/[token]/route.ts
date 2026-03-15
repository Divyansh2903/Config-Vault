import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth/get-user";
import { prisma } from "@/lib/db/prisma";
import { createAuditLog, AUDIT_ACTIONS } from "@/lib/audit/logger";

// GET — fetch invitation details (public, no auth required for viewing)
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    const { token } = await params;

    const invitation = await prisma.projectInvitation.findUnique({
      where: { token },
      include: {
        project: {
          select: {
            name: true,
            description: true,
            _count: {
              select: { members: true, environments: true },
            },
          },
        },
        inviter: {
          select: { fullName: true, email: true },
        },
      },
    });

    if (!invitation) {
      return NextResponse.json(
        { error: "Invitation not found" },
        { status: 404 },
      );
    }

    if (invitation.status !== "PENDING") {
      return NextResponse.json(
        { error: "already_responded", status: invitation.status },
        { status: 410 },
      );
    }

    if (invitation.expiresAt < new Date()) {
      await prisma.projectInvitation.update({
        where: { id: invitation.id },
        data: { status: "EXPIRED" },
      });
      return NextResponse.json(
        { error: "This invitation has expired" },
        { status: 410 },
      );
    }

    return NextResponse.json({
      email: invitation.email,
      role: invitation.role,
      expiresAt: invitation.expiresAt,
      project: invitation.project,
      inviter: invitation.inviter,
    });
  } catch (error) {
    console.error("Failed to fetch invitation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST — accept or decline the invitation
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { token } = await params;

    const body = await request.json();
    const action = body.action as "accept" | "decline";

    if (action !== "accept" && action !== "decline") {
      return NextResponse.json(
        { error: "Action must be 'accept' or 'decline'" },
        { status: 400 },
      );
    }

    const invitation = await prisma.projectInvitation.findUnique({
      where: { token },
    });

    if (!invitation) {
      return NextResponse.json(
        { error: "Invitation not found" },
        { status: 404 },
      );
    }

    if (invitation.status !== "PENDING") {
      return NextResponse.json(
        { error: "This invitation has already been responded to" },
        { status: 410 },
      );
    }

    if (invitation.expiresAt < new Date()) {
      await prisma.projectInvitation.update({
        where: { id: invitation.id },
        data: { status: "EXPIRED" },
      });
      return NextResponse.json(
        { error: "This invitation has expired" },
        { status: 410 },
      );
    }

    // Verify the logged-in user's email matches the invitation
    if (user.profile.email !== invitation.email) {
      return NextResponse.json(
        { error: "This invitation was sent to a different email address" },
        { status: 403 },
      );
    }

    if (action === "decline") {
      await prisma.projectInvitation.update({
        where: { id: invitation.id },
        data: { status: "DECLINED" },
      });

      await createAuditLog({
        projectId: invitation.projectId,
        actorId: user.profile.id,
        action: AUDIT_ACTIONS.INVITATION_DECLINED,
        entityType: "invitation",
        entityId: invitation.id,
        metadata: { email: invitation.email, role: invitation.role },
      });

      return NextResponse.json({ message: "Invitation declined" });
    }

    // Accept — create member + update invitation in a transaction
    await prisma.$transaction(async (tx) => {
      await tx.projectInvitation.update({
        where: { id: invitation.id },
        data: { status: "ACCEPTED" },
      });

      // Check if already a member (edge case: invited via another path)
      const existing = await tx.projectMember.findUnique({
        where: {
          projectId_userId: {
            projectId: invitation.projectId,
            userId: user.profile.id,
          },
        },
      });

      if (!existing) {
        await tx.projectMember.create({
          data: {
            projectId: invitation.projectId,
            userId: user.profile.id,
            role: invitation.role,
          },
        });
      }
    });

    await createAuditLog({
      projectId: invitation.projectId,
      actorId: user.profile.id,
      action: AUDIT_ACTIONS.INVITATION_ACCEPTED,
      entityType: "invitation",
      entityId: invitation.id,
      metadata: { email: invitation.email, role: invitation.role },
    });

    return NextResponse.json({
      message: "Invitation accepted",
      projectId: invitation.projectId,
    });
  } catch (error) {
    console.error("Failed to respond to invitation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
