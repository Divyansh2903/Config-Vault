"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  FolderKanban,
  Users,
  GitBranch,
  Lock,
  Check,
  X,
  Loader2,
  Clock,
  XCircle,
} from "lucide-react";
import { AppLogo } from "@/components/ui/app-logo";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";

interface InvitationData {
  email: string;
  role: string;
  expiresAt: string;
  project: {
    name: string;
    description: string | null;
    _count: { members: number; environments: number };
  };
  inviter: {
    fullName: string;
    email: string;
  };
}

export default function InvitationPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const [data, setData] = useState<InvitationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [alreadyResponded, setAlreadyResponded] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState<"accept" | "decline" | null>(
    null,
  );
  const [done, setDone] = useState<"accepted" | "declined" | null>(null);
  const [acceptedProjectId, setAcceptedProjectId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    async function fetchInvitation() {
      try {
        const res = await fetch(`/api/invitations/${token}`);
        if (!res.ok) {
          const body = await res.json().catch(() => null);
          if (body?.error === "already_responded") {
            setAlreadyResponded(body.status);
          } else {
            setError(body?.error ?? "Invitation not found");
          }
          return;
        }
        const invitation = await res.json();
        setData(invitation);
      } catch {
        setError("Failed to load invitation");
      } finally {
        setLoading(false);
      }
    }
    fetchInvitation();
  }, [token]);

  async function handleRespond(action: "accept" | "decline") {
    setResponding(action);
    try {
      const res = await fetch(`/api/invitations/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      const body = await res.json();

      if (res.status === 401) {
        toast.error("Please log in first to respond to this invitation");
        router.push(`/login?redirect=/invitations/${token}`);
        return;
      }

      if (res.status === 403) {
        toast.error(body.error);
        return;
      }

      if (!res.ok) {
        throw new Error(body.error ?? "Something went wrong");
      }

      if (action === "accept") {
        setDone("accepted");
        setAcceptedProjectId(body.projectId);
        toast.success("You've joined the project!");
      } else {
        setDone("declined");
        toast.info("Invitation declined");
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Something went wrong",
      );
    } finally {
      setResponding(null);
    }
  }

  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center p-6">
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_40%_at_50%_-10%,oklch(0.50_0.13_175/0.08),transparent)] dark:bg-[radial-gradient(ellipse_60%_40%_at_50%_-10%,oklch(0.68_0.14_175/0.03),transparent)]" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(oklch(0.50_0.13_175/0.05)_1px,transparent_1px)] bg-size-[32px_32px] dark:bg-[radial-gradient(oklch(0.68_0.14_175/0.02)_1px,transparent_1px)]" />

      {/* Logo */}
      <Link
        href="/"
        className="animate-fade-in mb-8 flex items-center gap-2.5 transition-opacity hover:opacity-80"
      >
        <AppLogo size="lg" />
        <span className="font-display text-2xl font-bold tracking-tight">
          ConfigVault
        </span>
      </Link>

      <div className="animate-fade-in-up delay-100 w-full max-w-lg">
        {loading ? (
          <Card className="border-border/60 shadow-xl shadow-black/[0.04] dark:shadow-black/25">
            <CardContent className="flex flex-col items-center gap-4 py-16">
              <Loader2 className="size-8 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Loading invitation...
              </p>
            </CardContent>
          </Card>
        ) : error ? (
          <Card className="border-border/60 shadow-xl shadow-black/[0.04] dark:shadow-black/25">
            <CardContent className="flex flex-col items-center gap-4 py-12">
              <div className="flex size-16 items-center justify-center rounded-full bg-red-500/10">
                <XCircle className="size-8 text-red-500" />
              </div>
              <div className="space-y-1.5 text-center">
                <p className="font-display text-lg font-semibold tracking-tight">
                  {error}
                </p>
                <p className="text-[13px] text-muted-foreground">
                  This invitation may have expired or been revoked.
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => router.push("/dashboard")}
                className="mt-2"
              >
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        ) : alreadyResponded ? (
          <Card className="border-border/60 shadow-xl shadow-black/[0.04] dark:shadow-black/25">
            <CardContent className="flex flex-col items-center gap-4 py-12">
              <div className="flex size-16 items-center justify-center rounded-full bg-amber-500/10">
                <Clock className="size-8 text-amber-500" />
              </div>
              <div className="space-y-1.5 text-center">
                <p className="font-display text-lg font-semibold tracking-tight">
                  Invitation already{" "}
                  {alreadyResponded.toLowerCase()}
                </p>
                <p className="text-[13px] text-muted-foreground">
                  This invitation has already been responded to.
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => router.push("/dashboard")}
                className="mt-2"
              >
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        ) : done ? (
          <Card className="border-border/60 shadow-xl shadow-black/[0.04] dark:shadow-black/25">
            <CardContent className="flex flex-col items-center gap-4 py-12">
              <div
                className={`flex size-16 items-center justify-center rounded-full ${
                  done === "accepted"
                    ? "bg-emerald-500/10"
                    : "bg-muted"
                }`}
              >
                {done === "accepted" ? (
                  <Check className="size-8 text-emerald-500" />
                ) : (
                  <X className="size-8 text-muted-foreground" />
                )}
              </div>
              <div className="space-y-1.5 text-center">
                <p className="font-display text-lg font-semibold tracking-tight">
                  {done === "accepted"
                    ? "You've joined the project!"
                    : "Invitation declined"}
                </p>
                <p className="text-[13px] text-muted-foreground">
                  {done === "accepted"
                    ? `You're now a member of ${data?.project.name}.`
                    : "You can always ask the owner to invite you again."}
                </p>
              </div>
              <Button
                onClick={() =>
                  router.push(
                    done === "accepted" && acceptedProjectId
                      ? `/projects/${acceptedProjectId}`
                      : "/dashboard",
                  )
                }
                className="mt-2"
              >
                {done === "accepted"
                  ? "Go to Project"
                  : "Go to Dashboard"}
              </Button>
            </CardContent>
          </Card>
        ) : data ? (
          <Card className="border-border/60 shadow-xl shadow-black/[0.04] dark:shadow-black/25">
            <CardHeader className="space-y-1.5 pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg tracking-tight">
                  Project Invitation
                </CardTitle>
                <Badge
                  variant="secondary"
                  className="text-[10px] font-medium uppercase"
                >
                  {data.role}
                </Badge>
              </div>
              <CardDescription className="text-[13px]">
                <strong>{data.inviter.fullName}</strong> invited you to join
                this project
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Project info */}
              <div className="rounded-lg border border-border/60 bg-muted/30 p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                    <FolderKanban className="size-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium tracking-tight">
                      {data.project.name}
                    </p>
                    {data.project.description && (
                      <p className="truncate text-xs text-muted-foreground">
                        {data.project.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Users className="size-3" />
                    {data.project._count.members} member
                    {data.project._count.members !== 1 && "s"}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <GitBranch className="size-3" />
                    {data.project._count.environments} environment
                    {data.project._count.environments !== 1 && "s"}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="size-3" />
                    Expires{" "}
                    {formatDistanceToNow(new Date(data.expiresAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  onClick={() => handleRespond("accept")}
                  disabled={responding !== null}
                  className="flex-1 shadow-sm shadow-primary/10"
                >
                  {responding === "accept" ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Check className="size-4" />
                  )}
                  Accept
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleRespond("decline")}
                  disabled={responding !== null}
                  className="flex-1"
                >
                  {responding === "decline" ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <X className="size-4" />
                  )}
                  Decline
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>

      {/* Footer */}
      <div className="animate-fade-in delay-300 mt-6 flex items-center gap-1.5 text-xs text-muted-foreground/50">
        <Lock className="size-3" />
        <span>Secured by ConfigVault</span>
      </div>
    </div>
  );
}
