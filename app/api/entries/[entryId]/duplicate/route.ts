import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth/get-user";
import { prisma } from "@/lib/db/prisma";
import { duplicateEntrySchema } from "@/lib/validations/schemas";
import { createAuditLog, AUDIT_ACTIONS } from "@/lib/audit/logger";
import { can } from "@/lib/permissions";
import { encrypt, decrypt } from "@/lib/security/encryption";
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

    const sourceEntry = await prisma.configEntry.findUnique({
      where: { id: entryId },
      include: { environment: { select: { projectId: true } } },
    });
    if (!sourceEntry) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    const body = await request.json();
    const parsed = duplicateEntrySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
    }

    const { targetEnvironmentId } = parsed.data;
    const sourceProjectId = sourceEntry.environment.projectId;

    const targetEnv = await prisma.environment.findUnique({
      where: { id: targetEnvironmentId },
    });
    if (!targetEnv) {
      return NextResponse.json({ error: "Target environment not found" }, { status: 404 });
    }

    if (targetEnv.projectId !== sourceProjectId) {
      return NextResponse.json(
        { error: "Target environment must be in the same project" },
        { status: 400 },
      );
    }

    const member = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: { projectId: sourceProjectId, userId: user.profile.id },
      },
    });
    if (!member || !can(member, "create_entry")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const existing = await prisma.configEntry.findUnique({
      where: {
        environmentId_key: {
          environmentId: targetEnvironmentId,
          key: sourceEntry.key,
        },
      },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Key already exists in target environment" },
        { status: 409 },
      );
    }

    let valueEncrypted: string | null = null;
    let valuePlain: string | null = null;
    if (sourceEntry.isSecret && sourceEntry.valueEncrypted) {
      const plain = decrypt(sourceEntry.valueEncrypted);
      valueEncrypted = encrypt(plain);
    } else {
      valuePlain = sourceEntry.valuePlain;
    }

    const newEntry = await prisma.configEntry.create({
      data: {
        environmentId: targetEnvironmentId,
        key: sourceEntry.key,
        valueEncrypted,
        valuePlain,
        isSecret: sourceEntry.isSecret,
        description: sourceEntry.description,
        isRequired: sourceEntry.isRequired,
        createdBy: user.profile.id,
        updatedBy: user.profile.id,
      },
    });

    await createAuditLog({
      projectId: sourceProjectId,
      actorId: user.profile.id,
      action: AUDIT_ACTIONS.CONFIG_DUPLICATED,
      entityType: "config_entry",
      entityId: newEntry.id,
      metadata: {
        key: sourceEntry.key,
        sourceEntryId: sourceEntry.id,
        sourceEnvironmentId: sourceEntry.environmentId,
        targetEnvironmentId,
      },
    });

    return NextResponse.json(safeEntry(newEntry), { status: 201 });
  } catch (error) {
    console.error("Failed to duplicate config entry:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
