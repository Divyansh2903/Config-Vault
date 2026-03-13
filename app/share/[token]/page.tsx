import { prisma } from "@/lib/db/prisma";
import { decrypt } from "@/lib/security/encryption";
import { createAuditLog, AUDIT_ACTIONS } from "@/lib/audit/logger";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CopyShareValue } from "./copy-button";
import { XCircle, Clock, Eye, Shield } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export const dynamic = "force-dynamic";

interface SharePageProps {
  params: Promise<{ token: string }>;
}

type ShareError = {
  type: "not_found" | "revoked" | "expired" | "max_views";
  message: string;
};

async function getShareData(token: string): Promise<
  | { ok: true; key: string; value: string; description: string | null; remainingViews: number; expiresAt: Date }
  | { ok: false; error: ShareError }
> {
  const shareLink = await prisma.shareLink.findUnique({
    where: { token },
    include: {
      configEntry: {
        include: { environment: { select: { projectId: true } } },
      },
    },
  });

  if (!shareLink) {
    return { ok: false, error: { type: "not_found", message: "Share link not found" } };
  }

  if (shareLink.revokedAt) {
    return { ok: false, error: { type: "revoked", message: "This share link has been revoked" } };
  }

  if (shareLink.expiresAt < new Date()) {
    return { ok: false, error: { type: "expired", message: "This share link has expired" } };
  }

  if (shareLink.currentViews >= shareLink.maxViews) {
    return { ok: false, error: { type: "max_views", message: "This share link has reached its maximum views" } };
  }

  const updated = await prisma.shareLink.update({
    where: { id: shareLink.id },
    data: { currentViews: { increment: 1 } },
  });

  const entry = shareLink.configEntry;
  const value = entry.isSecret ? decrypt(entry.valueEncrypted!) : (entry.valuePlain ?? "");

  const { projectId } = entry.environment;
  await createAuditLog({
    projectId,
    actorId: shareLink.createdBy,
    action: AUDIT_ACTIONS.SHARE_LINK_VIEWED,
    entityType: "share_link",
    entityId: shareLink.id,
  });

  return {
    ok: true,
    key: entry.key,
    value,
    description: entry.description,
    remainingViews: shareLink.maxViews - updated.currentViews,
    expiresAt: shareLink.expiresAt,
  };
}

const ERROR_CONFIG: Record<ShareError["type"], { icon: typeof XCircle; color: string }> = {
  not_found: { icon: XCircle, color: "text-red-500" },
  revoked: { icon: XCircle, color: "text-red-500" },
  expired: { icon: Clock, color: "text-amber-500" },
  max_views: { icon: Eye, color: "text-blue-500" },
};

export default async function SharePage({ params }: SharePageProps) {
  const { token } = await params;
  const result = await getShareData(token);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(oklch(0.55_0.15_195/0.05)_1px,transparent_1px)] bg-size-[32px_32px] dark:bg-[radial-gradient(oklch(0.55_0.15_195/0.03)_1px,transparent_1px)]" />
      <div className="mb-8 flex items-center gap-2">
        <div className="flex size-9 items-center justify-center rounded-xl bg-linear-to-br from-primary to-primary/80 shadow-md shadow-primary/20">
          <Shield className="size-5 text-primary-foreground" />
        </div>
        <span className="font-display text-2xl font-bold tracking-tight">ConfigVault</span>
      </div>

      <div className="w-full max-w-lg">
        {result.ok ? (
          <Card>
            <CardHeader>
              <CardTitle className="font-mono text-lg">{result.key}</CardTitle>
              {result.description && (
                <p className="text-sm text-muted-foreground">{result.description}</p>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <CopyShareValue value={result.value} />

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Eye className="size-3" />
                  {result.remainingViews} view{result.remainingViews !== 1 ? "s" : ""} remaining
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="size-3" />
                  Expires {formatDistanceToNow(result.expiresAt, { addSuffix: true })}
                </span>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center gap-4 py-12">
              {(() => {
                const cfg = ERROR_CONFIG[result.error.type];
                const Icon = cfg.icon;
                return <Icon className={`size-12 ${cfg.color}`} />;
              })()}
              <p className="text-center text-lg font-medium">{result.error.message}</p>
              <p className="text-center text-sm text-muted-foreground">
                The shared secret is no longer accessible.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <p className="mt-8 text-xs text-muted-foreground">
        This secret was shared securely via ConfigVault
      </p>
    </div>
  );
}
