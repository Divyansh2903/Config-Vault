import { Lock, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SecretBadgeProps {
  isSecret: boolean;
}

export function SecretBadge({ isSecret }: SecretBadgeProps) {
  if (isSecret) {
    return (
      <Badge variant="secondary" className="gap-1">
        <Lock className="size-3" />
        Secret
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="gap-1">
      <FileText className="size-3" />
      Config
    </Badge>
  );
}
