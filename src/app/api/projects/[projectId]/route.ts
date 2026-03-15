import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth/get-user";
import { prisma } from "@/lib/db/prisma";
import { projectSchema } from "@/lib/validations/schemas";
import { createAuditLog, AUDIT_ACTIONS } from "@/lib/audit/logger";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> },
) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId } = await params;

    const member = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: { projectId, userId: user.profile.id },
      },
    });

    if (!member) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error("Failed to fetch project:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

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
    const parsed = projectSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
    }

    const updated = await prisma.project.update({
      where: { id: projectId },
      data: parsed.data,
    });

    await createAuditLog({
      projectId,
      actorId: user.profile.id,
      action: AUDIT_ACTIONS.PROJECT_UPDATED,
      entityType: "project",
      entityId: projectId,
      metadata: { name: updated.name },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update project:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
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

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    await createAuditLog({
      projectId,
      actorId: user.profile.id,
      action: AUDIT_ACTIONS.PROJECT_DELETED,
      entityType: "project",
      entityId: projectId,
      metadata: { name: project.name },
    });

    await prisma.project.delete({ where: { id: projectId } });

    return NextResponse.json({ message: "Project deleted" }, { status: 200 });
  } catch (error) {
    console.error("Failed to delete project:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
