import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth/get-user";
import { prisma } from "@/lib/db/prisma";
import { configEntrySchema } from "@/lib/validations/schemas";
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

async function getMember(projectId: string, userId: string) {
  return prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } },
  });
}

export async function GET(
  _request: NextRequest,
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
      return NextResponse.json({ error: "Environment not found" }, { status: 404 });
    }

    const member = await getMember(environment.projectId, user.profile.id);
    if (!member) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const entries = await prisma.configEntry.findMany({
      where: { environmentId: envId },
      orderBy: { key: "asc" },
    });

    return NextResponse.json(entries.map(safeEntry));
  } catch (error) {
    console.error("Failed to fetch config entries:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
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
      return NextResponse.json({ error: "Environment not found" }, { status: 404 });
    }

    const member = await getMember(environment.projectId, user.profile.id);
    if (!member) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!can(member, "create_entry")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = configEntrySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
    }

    const { key, value, isSecret, description, isRequired } = parsed.data;

    const existing = await prisma.configEntry.findUnique({
      where: { environmentId_key: { environmentId: envId, key } },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Key already exists in this environment" },
        { status: 409 },
      );
    }

    const entry = await prisma.configEntry.create({
      data: {
        environmentId: envId,
        key,
        valueEncrypted: isSecret ? encrypt(value) : null,
        valuePlain: isSecret ? null : value,
        isSecret,
        description,
        isRequired,
        createdBy: user.profile.id,
        updatedBy: user.profile.id,
      },
    });

    await createAuditLog({
      projectId: environment.projectId,
      actorId: user.profile.id,
      action: AUDIT_ACTIONS.CONFIG_CREATED,
      entityType: "config_entry",
      entityId: entry.id,
      metadata: { key, environmentId: envId, isSecret },
    });

    return NextResponse.json(safeEntry(entry), { status: 201 });
  } catch (error) {
    console.error("Failed to create config entry:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
