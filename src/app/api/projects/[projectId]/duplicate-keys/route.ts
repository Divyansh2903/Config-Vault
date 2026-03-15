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
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });

    const envIds = environments.map((e) => e.id);
    if (envIds.length < 2) {
      return NextResponse.json({ duplicates: [], environments });
    }

    // Fetch all keys across all environments (no values!)
    const entries = await prisma.configEntry.findMany({
      where: { environmentId: { in: envIds } },
      select: {
        key: true,
        environmentId: true,
        isSecret: true,
        isRequired: true,
      },
      orderBy: { key: "asc" },
    });

    // Group by key
    const keyMap = new Map<
      string,
      { environmentId: string; isSecret: boolean; isRequired: boolean }[]
    >();

    for (const entry of entries) {
      const list = keyMap.get(entry.key) ?? [];
      list.push({
        environmentId: entry.environmentId,
        isSecret: entry.isSecret,
        isRequired: entry.isRequired,
      });
      keyMap.set(entry.key, list);
    }

    // Find keys present in 2+ environments
    const duplicates: {
      key: string;
      presentIn: string[];
      missingIn: string[];
      isSecret: boolean;
      isRequired: boolean;
    }[] = [];

    for (const [key, envEntries] of keyMap) {
      if (envEntries.length >= 2) {
        const presentIds = envEntries.map((e) => e.environmentId);
        const missingIds = envIds.filter((id) => !presentIds.includes(id));
        duplicates.push({
          key,
          presentIn: presentIds,
          missingIn: missingIds,
          isSecret: envEntries.some((e) => e.isSecret),
          isRequired: envEntries.some((e) => e.isRequired),
        });
      }
    }

    return NextResponse.json({ duplicates, environments });
  } catch (error) {
    console.error("Failed to find duplicate keys:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
