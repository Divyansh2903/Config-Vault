import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth/get-user";
import { prisma } from "@/lib/db/prisma";
import { importEnvSchema } from "@/lib/validations/schemas";
import { createAuditLog, AUDIT_ACTIONS } from "@/lib/audit/logger";
import { can } from "@/lib/permissions";
import { encrypt } from "@/lib/security/encryption";

const KEY_PATTERN = /^[A-Z][A-Z0-9_]*$/;

function parseEnvContent(content: string) {
  const entries: { key: string; value: string }[] = [];
  const errors: string[] = [];

  for (const rawLine of content.split("\n")) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const eqIndex = line.indexOf("=");
    if (eqIndex === -1) {
      errors.push(`Invalid line (no = sign): ${line.slice(0, 60)}`);
      continue;
    }

    const key = line.slice(0, eqIndex).trim();
    let value = line.slice(eqIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!KEY_PATTERN.test(key)) {
      errors.push(
        `Invalid key "${key}": must match ^[A-Z][A-Z0-9_]*$`,
      );
      continue;
    }

    entries.push({ key, value });
  }

  return { entries, errors };
}

export async function POST(
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
    if (!can(member, "create_entry")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = importEnvSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues },
        { status: 400 },
      );
    }

    const { content, treatAsSecrets } = parsed.data;
    const { entries, errors } = parseEnvContent(content);

    const existingEntries = await prisma.configEntry.findMany({
      where: { environmentId: envId, key: { in: entries.map((e) => e.key) } },
      select: { key: true },
    });
    const existingKeys = new Set(existingEntries.map((e) => e.key));

    const toCreate: { key: string; value: string }[] = [];
    const skipped: string[] = [];

    for (const entry of entries) {
      if (existingKeys.has(entry.key)) {
        skipped.push(entry.key);
      } else {
        toCreate.push(entry);
      }
    }

    await prisma.$transaction(
      toCreate.map((entry) =>
        prisma.configEntry.create({
          data: {
            environmentId: envId,
            key: entry.key,
            valueEncrypted: treatAsSecrets ? encrypt(entry.value) : null,
            valuePlain: treatAsSecrets ? null : entry.value,
            isSecret: treatAsSecrets,
            createdBy: user.profile.id,
            updatedBy: user.profile.id,
          },
        }),
      ),
    );

    await createAuditLog({
      projectId: environment.projectId,
      actorId: user.profile.id,
      action: AUDIT_ACTIONS.CONFIG_IMPORTED,
      entityType: "environment",
      entityId: envId,
      metadata: {
        count: toCreate.length,
        skipped: skipped.length,
        treatAsSecrets,
      },
    });

    return NextResponse.json({
      imported: toCreate.length,
      skipped,
      errors,
    });
  } catch (error) {
    console.error("Failed to import config entries:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
