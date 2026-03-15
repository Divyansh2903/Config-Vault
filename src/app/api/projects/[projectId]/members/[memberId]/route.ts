import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { getUser } from "@/lib/auth/get-user";
import { prisma } from "@/lib/db/prisma";
import { updateMemberSchema } from "@/lib/validations/schemas";
import { createAuditLog, AUDIT_ACTIONS } from "@/lib/audit/logger";

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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; memberId: string }> },
) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId, memberId } = await params;

    const owner = await requireOwner(projectId, user.profile.id);
    if (!owner) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = updateMemberSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues },
        { status: 400 },
      );
    }

    const targetMember = await prisma.projectMember.findUnique({
      where: { id: memberId, projectId },
      include: { user: { select: { email: true } } },
    });

    if (!targetMember) {
      return NextResponse.json(
        { error: "Member not found" },
        { status: 404 },
      );
    }

    if (targetMember.userId === user.profile.id) {
      return NextResponse.json(
        { error: "Cannot modify your own membership" },
        { status: 400 },
      );
    }

    const updated = await prisma.projectMember.update({
      where: { id: memberId },
      data: parsed.data,
      include: {
        user: { select: { id: true, fullName: true, email: true } },
      },
    });

    await createAuditLog({
      projectId,
      actorId: user.profile.id,
      action: AUDIT_ACTIONS.MEMBER_ROLE_CHANGED,
      entityType: "member",
      entityId: memberId,
      metadata: {
        oldRole: targetMember.role,
        newRole: updated.role,
        email: targetMember.user.email,
      },
    });

    revalidateTag("project-members");

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update member:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ projectId: string; memberId: string }> },
) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId, memberId } = await params;

    const owner = await requireOwner(projectId, user.profile.id);
    if (!owner) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const targetMember = await prisma.projectMember.findUnique({
      where: { id: memberId, projectId },
      include: { user: { select: { email: true } } },
    });

    if (!targetMember) {
      return NextResponse.json(
        { error: "Member not found" },
        { status: 404 },
      );
    }

    if (targetMember.userId === user.profile.id) {
      return NextResponse.json(
        { error: "Cannot remove yourself from the project" },
        { status: 400 },
      );
    }

    await prisma.projectMember.delete({ where: { id: memberId } });

    await createAuditLog({
      projectId,
      actorId: user.profile.id,
      action: AUDIT_ACTIONS.MEMBER_REMOVED,
      entityType: "member",
      entityId: memberId,
      metadata: { email: targetMember.user.email },
    });

    revalidateTag("project-members");

    return NextResponse.json({ message: "Member removed" }, { status: 200 });
  } catch (error) {
    console.error("Failed to remove member:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
