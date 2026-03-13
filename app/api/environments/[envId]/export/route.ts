import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth/get-user";
import { prisma } from "@/lib/db/prisma";
import { createAuditLog, AUDIT_ACTIONS } from "@/lib/audit/logger";
import { can } from "@/lib/permissions";
import { decrypt } from "@/lib/security/encryption";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ envId: string }> },
) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { envId } = await params;

    const environment = await prisma.environment.findUnique({
      where: { id: envId },
    });
    if (!environment) {
      return NextResponse.json(
        { error: "Environment not found" },
        { status: 404 },
      );
    }

    const member = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId: environment.projectId,
          userId: user.profile.id,
        },
      },
    });
    if (!member) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const includeSecrets =
      request.nextUrl.searchParams.get("includeSecrets") === "true";

    const hasRevealPermission =
      includeSecrets && can(member, "reveal_secret");

    const entries = await prisma.configEntry.findMany({
      where: { environmentId: envId },
      orderBy: { key: "asc" },
    });

    const lines: string[] = [];

    for (const entry of entries) {
      if (entry.isSecret) {
        if (hasRevealPermission && entry.valueEncrypted) {
          const decryptedValue = decrypt(entry.valueEncrypted);
          lines.push(`${entry.key}=${decryptedValue}`);
        } else {
          lines.push(`# SECRET: ${entry.key} (redacted)`);
        }
      } else {
        lines.push(`${entry.key}=${entry.valuePlain ?? ""}`);
      }
    }

    await createAuditLog({
      projectId: environment.projectId,
      actorId: user.profile.id,
      action: AUDIT_ACTIONS.CONFIG_EXPORTED,
      entityType: "environment",
      entityId: envId,
      metadata: {
        includeSecrets: hasRevealPermission,
        entryCount: entries.length,
      },
    });

    const filename = `${environment.slug}.env`;

    return new NextResponse(lines.join("\n") + "\n", {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Failed to export config entries:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
