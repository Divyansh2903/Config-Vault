import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth/get-user";
import { prisma } from "@/lib/db/prisma";
import { createProjectSchema } from "@/lib/validations/schemas";
import { AUDIT_ACTIONS } from "@/lib/audit/logger";
import { encrypt } from "@/lib/security/encryption";

const KEY_PATTERN = /^[A-Z][A-Z0-9_]*$/;

function parseEnvContent(content: string) {
  const entries: { key: string; value: string }[] = [];

  for (const rawLine of content.split("\n")) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const eqIndex = line.indexOf("=");
    if (eqIndex === -1) continue;

    const key = line.slice(0, eqIndex).trim();
    let value = line.slice(eqIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!KEY_PATTERN.test(key)) continue;

    entries.push({ key, value });
  }

  return entries;
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = createProjectSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
    }

    const { name, description, envContent, targetEnvironment = "development", treatAsSecrets = false } = parsed.data;

    const envEntries = envContent ? parseEnvContent(envContent) : [];

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

      const environments = await Promise.all([
        tx.environment.create({
          data: { projectId: project.id, name: "Development", slug: "development" },
        }),
        tx.environment.create({
          data: { projectId: project.id, name: "Staging", slug: "staging" },
        }),
        tx.environment.create({
          data: { projectId: project.id, name: "Production", slug: "production" },
        }),
      ]);

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

      // Bulk import env entries if provided
      if (envEntries.length > 0) {
        const targetEnv = environments.find((e) => e.slug === targetEnvironment);
        if (targetEnv) {
          await Promise.all(
            envEntries.map((entry) =>
              tx.configEntry.create({
                data: {
                  environmentId: targetEnv.id,
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

          await tx.auditLog.create({
            data: {
              projectId: project.id,
              actorId: user.profile.id,
              action: AUDIT_ACTIONS.CONFIG_IMPORTED,
              entityType: "environment",
              entityId: targetEnv.id,
              metadata: {
                count: envEntries.length,
                targetEnvironment,
                treatAsSecrets,
              },
            },
          });
        }
      }

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
