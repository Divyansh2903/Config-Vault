import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth/get-user";
import { prisma } from "@/lib/db/prisma";

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

    const environments = await prisma.environment.findMany({
      where: { projectId },
      orderBy: { createdAt: "asc" },
      include: {
        entries: {
          where: { isRequired: true },
          select: { key: true },
        },
      },
    });

    const requiredKeysSet = new Set<string>();
    for (const env of environments) {
      for (const entry of env.entries) {
        requiredKeysSet.add(entry.key);
      }
    }

    const requiredKeys = [...requiredKeysSet].sort();

    const envData = environments.map((env) => ({
      id: env.id,
      name: env.name,
      slug: env.slug,
      presentKeys: env.entries.map((e) => e.key).sort(),
    }));

    return NextResponse.json({ requiredKeys, environments: envData });
  } catch (error) {
    console.error("Failed to fetch readiness data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
