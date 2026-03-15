"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { toast } from "sonner";
import { Copy, Check, UserPlus } from "lucide-react";
import { inviteMemberSchema } from "@/lib/validations/schemas";
import { getAppUrl } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type InviteFormData = z.infer<typeof inviteMemberSchema>;

interface InviteMemberDialogProps {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function InviteMemberDialog({
  projectId,
  open,
  onOpenChange,
  onSuccess,
}: InviteMemberDialogProps) {
  const [notRegistered, setNotRegistered] = useState(false);
  const [copied, setCopied] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InviteFormData>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: {
      email: "",
      role: "VIEWER",
    },
  });

  const registerUrl = `${getAppUrl()}/register`;

  function handleClose(isOpen: boolean) {
    if (!isOpen) {
      reset();
      setNotRegistered(false);
      setCopied(false);
    }
    onOpenChange(isOpen);
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(registerUrl);
      setCopied(true);
      toast.success("Registration link copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  }

  async function onSubmit(data: InviteFormData) {
    setNotRegistered(false);
    try {
      const res = await fetch(`/api/projects/${projectId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const body = await res.json();

        if (body.error === "not_registered") {
          setNotRegistered(true);
          return;
        }

        throw new Error(
          typeof body.error === "string"
            ? body.error
            : body.message ?? "Failed to invite member",
        );
      }

      toast.success("Member invited successfully");
      reset();
      setNotRegistered(false);
      onSuccess();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite Member</DialogTitle>
          <DialogDescription>
            Add a team member to this project. They must already have an
            account.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="invite-email">Email</Label>
            <Input
              id="invite-email"
              type="email"
              placeholder="colleague@example.com"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-destructive">
                {errors.email.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="invite-role">Role</Label>
            <select
              id="invite-role"
              {...register("role")}
              className="flex h-8 w-full rounded-lg border border-input bg-background px-2.5 py-1.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="VIEWER">Viewer</option>
              <option value="EDITOR">Editor</option>
            </select>
            {errors.role && (
              <p className="text-sm text-destructive">{errors.role.message}</p>
            )}
          </div>

          {notRegistered && (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 space-y-2.5">
              <div className="flex items-start gap-2">
                <UserPlus className="mt-0.5 size-4 shrink-0 text-amber-500" />
                <p className="text-sm text-amber-200">
                  This person doesn&apos;t have a ConfigVault account yet. Share
                  this registration link with them, then invite again once
                  they&apos;ve signed up.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  readOnly
                  value={registerUrl}
                  className="h-8 flex-1 text-xs bg-background/50"
                  onFocus={(e) => e.target.select()}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shrink-0 gap-1.5"
                  onClick={copyLink}
                >
                  {copied ? (
                    <Check className="size-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="size-3.5" />
                  )}
                  {copied ? "Copied" : "Copy"}
                </Button>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Inviting\u2026" : "Send Invite"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
