import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth/get-user";
import { prisma } from "@/lib/db/prisma";
import { createAuditLog, AUDIT_ACTIONS } from "@/lib/audit/logger";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ projectId: string; envId: string }> },
) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId, envId } = await params;

    const member = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: { projectId, userId: user.profile.id },
      },
    });

    if (!member || member.role !== "OWNER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const environment = await prisma.environment.findUnique({
      where: { id: envId },
    });

    if (!environment || environment.projectId !== projectId) {
      return NextResponse.json(
        { error: "Environment not found" },
        { status: 404 },
      );
    }

    await prisma.environment.delete({ where: { id: envId } });

    await createAuditLog({
      projectId,
      actorId: user.profile.id,
      action: AUDIT_ACTIONS.ENVIRONMENT_DELETED,
      entityType: "environment",
      entityId: envId,
      metadata: { name: environment.name, slug: environment.slug },
    });

    return NextResponse.json(
      { message: "Environment deleted" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Failed to delete environment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
