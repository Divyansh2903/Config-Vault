import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth/get-user";
import { prisma } from "@/lib/db/prisma";
import { createAuditLog, AUDIT_ACTIONS } from "@/lib/audit/logger";
import { can } from "@/lib/permissions";
import { decrypt } from "@/lib/security/encryption";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ entryId: string }> },
) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { entryId } = await params;

    const entry = await prisma.configEntry.findUnique({
      where: { id: entryId },
      include: { environment: { select: { projectId: true } } },
    });
    if (!entry) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    const { projectId } = entry.environment;
    const member = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId: user.profile.id } },
    });
    if (!member || !can(member, "reveal_secret")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    let value: string | null;
    if (!entry.isSecret) {
      value = entry.valuePlain;
    } else {
      if (!entry.valueEncrypted) {
        return NextResponse.json({ error: "No encrypted value found" }, { status: 404 });
      }
      value = decrypt(entry.valueEncrypted);
    }

    await createAuditLog({
      projectId,
      actorId: user.profile.id,
      action: AUDIT_ACTIONS.SECRET_REVEALED,
      entityType: "config_entry",
      entityId: entryId,
      metadata: { key: entry.key },
    });

    return NextResponse.json({ value });
  } catch (error) {
    console.error("Failed to reveal secret:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
