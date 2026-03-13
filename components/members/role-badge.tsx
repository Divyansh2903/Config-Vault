import type { MemberRole } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const roleConfig: Record<MemberRole, { label: string; className: string }> = {
  OWNER: {
    label: "Owner",
    className:
      "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  },
  EDITOR: {
    label: "Editor",
    className:
      "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  },
  VIEWER: {
    label: "Viewer",
    className:
      "bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-400",
  },
};

export function RoleBadge({ role }: { role: MemberRole }) {
  const config = roleConfig[role];
  return (
    <Badge variant="secondary" className={cn(config.className)}>
      {config.label}
    </Badge>
  );
}
