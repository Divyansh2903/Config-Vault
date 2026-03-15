import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { decrypt } from "@/lib/security/encryption";
import { createAuditLog, AUDIT_ACTIONS } from "@/lib/audit/logger";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CopyShareValue } from "./copy-button";
import { XCircle, Clock, Eye, Lock, ShieldAlert, EyeOff } from "lucide-react";
import { AppLogo } from "@/components/ui/app-logo";
import { formatDistanceToNow } from "date-fns";

export const dynamic = "force-dynamic";

interface SharePageProps {
  params: Promise<{ token: string }>;
}

type ShareError = {
  type: "not_found" | "revoked" | "expired" | "max_views";
  message: string;
  description: string;
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
    return { ok: false, error: { type: "not_found", message: "Share link not found", description: "This link may have been deleted or never existed." } };
  }

  if (shareLink.revokedAt) {
    return { ok: false, error: { type: "revoked", message: "This share link has been revoked", description: "The owner revoked access to this secret." } };
  }

  if (shareLink.expiresAt < new Date()) {
    return { ok: false, error: { type: "expired", message: "This share link has expired", description: "The link has passed its expiration time." } };
  }

  if (shareLink.currentViews >= shareLink.maxViews) {
    return { ok: false, error: { type: "max_views", message: "View limit reached", description: "This link has been viewed the maximum number of times." } };
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

const ERROR_CONFIG: Record<ShareError["type"], { icon: typeof XCircle; color: string; bg: string }> = {
  not_found: { icon: XCircle, color: "text-red-500", bg: "bg-red-500/10" },
  revoked: { icon: ShieldAlert, color: "text-red-500", bg: "bg-red-500/10" },
  expired: { icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10" },
  max_views: { icon: EyeOff, color: "text-blue-500", bg: "bg-blue-500/10" },
};

export default async function SharePage({ params }: SharePageProps) {
  const { token } = await params;
  const result = await getShareData(token);

  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center p-6">
      {/* Background effects — matching auth layout */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_40%_at_50%_-10%,oklch(0.50_0.13_175/0.08),transparent)] dark:bg-[radial-gradient(ellipse_60%_40%_at_50%_-10%,oklch(0.68_0.14_175/0.03),transparent)]" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(oklch(0.50_0.13_175/0.05)_1px,transparent_1px)] bg-size-[32px_32px] dark:bg-[radial-gradient(oklch(0.68_0.14_175/0.02)_1px,transparent_1px)]" />

      {/* Logo */}
      <Link
        href="/"
        className="animate-fade-in mb-8 flex items-center gap-2.5 transition-opacity hover:opacity-80"
      >
        <AppLogo size="lg" />
        <span className="font-display text-2xl font-bold tracking-tight">ConfigVault</span>
      </Link>

      {/* Card */}
      <div className="animate-fade-in-up delay-100 w-full max-w-lg">
        {result.ok ? (
          <Card className="border-border/60 shadow-xl shadow-black/[0.04] dark:shadow-black/25">
            <CardHeader className="space-y-1.5 pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="font-mono text-lg tracking-tight">{result.key}</CardTitle>
                <Badge variant="outline" className="gap-1 text-[10px] font-medium text-muted-foreground">
                  <Lock className="size-2.5" />
                  Shared secret
                </Badge>
              </div>
              {result.description && (
                <CardDescription className="text-[13px]">
                  {result.description}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <CopyShareValue value={result.value} />

              <div className="flex items-center justify-between rounded-lg border border-border/40 bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Eye className="size-3" />
                  {result.remainingViews} view{result.remainingViews !== 1 ? "s" : ""} remaining
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="size-3" />
                  Expires {formatDistanceToNow(result.expiresAt, { addSuffix: true })}
                </span>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-border/60 shadow-xl shadow-black/[0.04] dark:shadow-black/25">
            <CardContent className="flex flex-col items-center gap-4 py-12">
              {(() => {
                const cfg = ERROR_CONFIG[result.error.type];
                const Icon = cfg.icon;
                return (
                  <div className={`flex size-16 items-center justify-center rounded-full ${cfg.bg}`}>
                    <Icon className={`size-8 ${cfg.color}`} />
                  </div>
                );
              })()}
              <div className="space-y-1.5 text-center">
                <p className="font-display text-lg font-semibold tracking-tight">{result.error.message}</p>
                <p className="text-[13px] text-muted-foreground">
                  {result.error.description}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Trust signal footer — matching auth layout */}
      <div className="animate-fade-in delay-300 mt-6 flex items-center gap-1.5 text-xs text-muted-foreground/50">
        <Lock className="size-3" />
        <span>Shared securely via ConfigVault</span>
      </div>
    </div>
  );
}
