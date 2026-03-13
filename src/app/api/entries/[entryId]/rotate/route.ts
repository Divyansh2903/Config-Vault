import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth/get-user";
import { prisma } from "@/lib/db/prisma";
import { rotateSecretSchema } from "@/lib/validations/schemas";
import { createAuditLog, AUDIT_ACTIONS } from "@/lib/audit/logger";
import { can } from "@/lib/permissions";
import { encrypt } from "@/lib/security/encryption";
import type { ConfigEntry } from "@prisma/client";

function safeEntry(entry: ConfigEntry) {
  return {
    ...entry,
    valuePlain: entry.isSecret ? null : entry.valuePlain,
    valueEncrypted: null,
  };
}

export async function POST(
  request: NextRequest,
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

    if (!entry.isSecret) {
      return NextResponse.json(
        { error: "Only secret entries can be rotated" },
        { status: 400 },
      );
    }

    const { projectId } = entry.environment;
    const member = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId: user.profile.id } },
    });
    if (!member || !can(member, "edit_entry")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = rotateSecretSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
    }

    const updated = await prisma.configEntry.update({
      where: { id: entryId },
      data: {
        valueEncrypted: encrypt(parsed.data.newValue),
        lastRotatedAt: new Date(),
        updatedBy: user.profile.id,
      },
    });

    await createAuditLog({
      projectId,
      actorId: user.profile.id,
      action: AUDIT_ACTIONS.SECRET_ROTATED,
      entityType: "config_entry",
      entityId: entryId,
      metadata: { key: entry.key },
    });

    return NextResponse.json(safeEntry(updated));
  } catch (error) {
    console.error("Failed to rotate secret:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
