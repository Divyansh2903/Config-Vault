import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth/get-user";
import { prisma } from "@/lib/db/prisma";
import { projectSchema } from "@/lib/validations/schemas";
import { AUDIT_ACTIONS } from "@/lib/audit/logger";

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = projectSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
    }

    const { name, description } = parsed.data;

    const project = await prisma.$transaction(async (tx) => {
      const project = await tx.project.create({
        data: {
          name,
          description,
          ownerId: user.profile.id,
        },
      });

      await tx.projectMember.create({
        data: {
          projectId: project.id,
          userId: user.profile.id,
          role: "OWNER",
          canRevealSecrets: true,
          canShareSecrets: true,
        },
      });

      await tx.environment.createMany({
        data: [
          { projectId: project.id, name: "Development", slug: "development" },
          { projectId: project.id, name: "Staging", slug: "staging" },
          { projectId: project.id, name: "Production", slug: "production" },
        ],
      });

      await tx.auditLog.create({
        data: {
          projectId: project.id,
          actorId: user.profile.id,
          action: AUDIT_ACTIONS.PROJECT_CREATED,
          entityType: "project",
          entityId: project.id,
          metadata: { name: project.name },
        },
      });

      return project;
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error("Failed to create project:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
