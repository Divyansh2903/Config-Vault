import { prisma } from "@/lib/db/prisma";

export { AUDIT_ACTIONS, humanizeAction } from "./actions";

interface AuditLogParams {
  projectId: string;
  actorId: string;
  action: string;
  entityType: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}

export async function createAuditLog(params: AuditLogParams) {
  await prisma.auditLog.create({
    data: {
      projectId: params.projectId,
      actorId: params.actorId,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      metadata: params.metadata ? (params.metadata as object) : undefined,
    },
  });
}
