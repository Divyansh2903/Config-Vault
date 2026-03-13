import type { MemberRole } from "@prisma/client";

export type Action =
  | "manage_members"
  | "delete_project"
  | "edit_project"
  | "create_entry"
  | "edit_entry"
  | "delete_entry"
  | "reveal_secret"
  | "share_secret"
  | "create_environment"
  | "delete_environment"
  | "view_audit";

interface MemberPermissions {
  role: MemberRole;
  canRevealSecrets: boolean;
  canShareSecrets: boolean;
}

const ROLE_PERMISSIONS: Record<MemberRole, Set<Action>> = {
  OWNER: new Set([
    "manage_members",
    "delete_project",
    "edit_project",
    "create_entry",
    "edit_entry",
    "delete_entry",
    "reveal_secret",
    "share_secret",
    "create_environment",
    "delete_environment",
    "view_audit",
  ]),
  EDITOR: new Set([
    "create_entry",
    "edit_entry",
    "delete_entry",
    "view_audit",
  ]),
  VIEWER: new Set([
    "view_audit",
  ]),
};

export function can(member: MemberPermissions, action: Action): boolean {
  if (ROLE_PERMISSIONS[member.role].has(action)) {
    return true;
  }

  if (action === "reveal_secret" && member.role === "EDITOR" && member.canRevealSecrets) {
    return true;
  }

  if (action === "share_secret" && member.role === "EDITOR" && member.canShareSecrets) {
    return true;
  }

  return false;
}
