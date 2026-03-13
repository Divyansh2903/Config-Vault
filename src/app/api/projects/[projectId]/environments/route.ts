import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth/get-user";
import { prisma } from "@/lib/db/prisma";
import { environmentSchema } from "@/lib/validations/schemas";
import { createAuditLog, AUDIT_ACTIONS } from "@/lib/audit/logger";

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

    const member = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: { projectId, userId: user.profile.id },
      },
    });

    if (!member || member.role !== "OWNER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = environmentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
    }

    const { name, slug } = parsed.data;

    const existing = await prisma.environment.findUnique({
      where: {
        projectId_slug: { projectId, slug },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "An environment with this slug already exists in the project" },
        { status: 409 },
      );
    }

    const environment = await prisma.environment.create({
      data: { projectId, name, slug },
    });

    await createAuditLog({
      projectId,
      actorId: user.profile.id,
      action: AUDIT_ACTIONS.ENVIRONMENT_CREATED,
      entityType: "environment",
      entityId: environment.id,
      metadata: { name, slug },
    });

    return NextResponse.json(environment, { status: 201 });
  } catch (error) {
    console.error("Failed to create environment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
