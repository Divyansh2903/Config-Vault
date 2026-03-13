import type { MemberRole } from "@prisma/client";

export interface SafeConfigEntry {
  id: string;
  environmentId: string;
  key: string;
  value: string | null;
  isSecret: boolean;
  description: string | null;
  isRequired: boolean;
  lastRotatedAt: string | null;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectWithCounts {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  createdAt: string;
  _count: {
    members: number;
    environments: number;
  };
}

export interface MemberWithProfile {
  id: string;
  projectId: string;
  userId: string;
  role: MemberRole;
  canRevealSecrets: boolean;
  canShareSecrets: boolean;
  createdAt: string;
  user: {
    id: string;
    fullName: string;
    email: string;
  };
}

export interface AuditLogEntry {
  id: string;
  projectId: string;
  actorId: string;
  action: string;
  entityType: string;
  entityId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  actor: {
    fullName: string;
    email: string;
  };
}

export interface ReadinessData {
  keys: string[];
  environments: {
    id: string;
    name: string;
    slug: string;
    presentKeys: string[];
  }[];
}

export interface ShareLinkData {
  id: string;
  token: string;
  expiresAt: string;
  maxViews: number;
  currentViews: number;
  revokedAt: string | null;
  createdAt: string;
  creator: {
    fullName: string;
  };
}
