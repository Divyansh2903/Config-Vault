import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth/get-user";
import { prisma } from "@/lib/db/prisma";
import { updateConfigEntrySchema } from "@/lib/validations/schemas";
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

async function getEntryWithProject(entryId: string) {
  return prisma.configEntry.findUnique({
    where: { id: entryId },
    include: { environment: { select: { projectId: true } } },
  });
}

async function getMember(projectId: string, userId: string) {
  return prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } },
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ entryId: string }> },
) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { entryId } = await params;

    const entry = await getEntryWithProject(entryId);
    if (!entry) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    const { projectId } = entry.environment;
    const member = await getMember(projectId, user.profile.id);
    if (!member || !can(member, "edit_entry")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = updateConfigEntrySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
    }

    const { key, value, isSecret, description, isRequired } = parsed.data;

    if (key && key !== entry.key) {
      const existing = await prisma.configEntry.findUnique({
        where: {
          environmentId_key: { environmentId: entry.environmentId, key },
        },
      });
      if (existing) {
        return NextResponse.json(
          { error: "Key already exists in this environment" },
          { status: 409 },
        );
      }
    }

    const willBeSecret = isSecret ?? entry.isSecret;
    let valueEncrypted = entry.valueEncrypted;
    let valuePlain = entry.valuePlain;

    if (value !== undefined) {
      if (willBeSecret) {
        valueEncrypted = encrypt(value);
        valuePlain = null;
      } else {
        valuePlain = value;
        valueEncrypted = null;
      }
    } else if (isSecret !== undefined && isSecret !== entry.isSecret) {
      // isSecret toggled without a new value — migrate the existing value
      if (isSecret && entry.valuePlain) {
        valueEncrypted = encrypt(entry.valuePlain);
        valuePlain = null;
      } else if (!isSecret && entry.valueEncrypted) {
        const { decrypt } = await import("@/lib/security/encryption");
        valuePlain = decrypt(entry.valueEncrypted);
        valueEncrypted = null;
      }
    }

    const updated = await prisma.configEntry.update({
      where: { id: entryId },
      data: {
        key,
        valueEncrypted,
        valuePlain,
        isSecret: willBeSecret,
        description,
        isRequired,
        updatedBy: user.profile.id,
      },
    });

    await createAuditLog({
      projectId,
      actorId: user.profile.id,
      action: AUDIT_ACTIONS.CONFIG_UPDATED,
      entityType: "config_entry",
      entityId: entryId,
      metadata: { key: updated.key },
    });

    return NextResponse.json(safeEntry(updated));
  } catch (error) {
    console.error("Failed to update config entry:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ entryId: string }> },
) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { entryId } = await params;

    const entry = await getEntryWithProject(entryId);
    if (!entry) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    const { projectId } = entry.environment;
    const member = await getMember(projectId, user.profile.id);
    if (!member || !can(member, "delete_entry")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.configEntry.delete({ where: { id: entryId } });

    await createAuditLog({
      projectId,
      actorId: user.profile.id,
      action: AUDIT_ACTIONS.CONFIG_DELETED,
      entityType: "config_entry",
      entityId: entryId,
      metadata: { key: entry.key },
    });

    return NextResponse.json({ message: "Entry deleted" }, { status: 200 });
  } catch (error) {
    console.error("Failed to delete config entry:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
