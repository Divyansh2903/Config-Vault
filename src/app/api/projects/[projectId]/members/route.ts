import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth/get-user";
import { prisma } from "@/lib/db/prisma";
import { inviteMemberSchema } from "@/lib/validations/schemas";
import { createAuditLog, AUDIT_ACTIONS } from "@/lib/audit/logger";
import { sendProjectInvitationEmail } from "@/lib/email/resend";
import { getAppUrl } from "@/lib/utils";

const INVITATION_TTL_DAYS = 7;

async function requireOwner(projectId: string, userId: string) {
  const member = await prisma.projectMember.findUnique({
    where: {
      projectId_userId: { projectId, userId },
    },
  });

  if (!member || member.role !== "OWNER") {
    return null;
  }

  return member;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> },
) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId } = await params;

    const owner = await requireOwner(projectId, user.profile.id);
    if (!owner) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = inviteMemberSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues },
        { status: 400 },
      );
    }

    const { email, role } = parsed.data;

    // Check if user is already a member
    const existingProfile = await prisma.profile.findUnique({
      where: { email },
    });

    if (existingProfile) {
      const existingMember = await prisma.projectMember.findUnique({
        where: {
          projectId_userId: { projectId, userId: existingProfile.id },
        },
      });

      if (existingMember) {
        return NextResponse.json(
          { error: "User is already a member of this project" },
          { status: 409 },
        );
      }
    }

    // Check for an existing pending invitation for this email + project
    const existingInvitation = await prisma.projectInvitation.findFirst({
      where: {
        projectId,
        email,
        status: "PENDING",
        expiresAt: { gt: new Date() },
      },
    });

    if (existingInvitation) {
      return NextResponse.json(
        { error: "An invitation has already been sent to this email" },
        { status: 409 },
      );
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { name: true },
    });

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(
      Date.now() + INVITATION_TTL_DAYS * 24 * 60 * 60 * 1000,
    );

    const invitation = await prisma.projectInvitation.create({
      data: {
        projectId,
        email,
        role,
        token,
        invitedBy: user.profile.id,
        expiresAt,
      },
    });

    await createAuditLog({
      projectId,
      actorId: user.profile.id,
      action: AUDIT_ACTIONS.INVITATION_SENT,
      entityType: "invitation",
      entityId: invitation.id,
      metadata: { email, role },
    });

    // Send invitation email
    const inviteUrl = `${getAppUrl()}/invitations/${token}`;
    try {
      await sendProjectInvitationEmail(
        email,
        user.profile.fullName,
        project?.name ?? "a project",
        role,
        inviteUrl,
      );
    } catch {
      // Email failed but invitation was created — don't block
      console.error("Invitation created but email delivery failed");
    }

    return NextResponse.json(
      { message: "Invitation sent", id: invitation.id },
      { status: 201 },
    );
  } catch (error) {
    console.error("Failed to invite member:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
