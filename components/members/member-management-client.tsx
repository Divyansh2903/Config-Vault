"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { MemberRole } from "@prisma/client";
import { MoreHorizontal, UserPlus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { RoleBadge } from "@/components/members/role-badge";
import { InviteMemberDialog } from "@/components/members/invite-member-dialog";

interface Member {
  id: string;
  userId: string;
  role: MemberRole;
  canRevealSecrets: boolean;
  canShareSecrets: boolean;
  user: {
    id: string;
    fullName: string;
    email: string;
  };
}

interface MemberManagementClientProps {
  projectId: string;
  members: Member[];
  isOwner: boolean;
  currentUserId: string;
}

export function MemberManagementClient({
  projectId,
  members,
  isOwner,
  currentUserId,
}: MemberManagementClientProps) {
  const router = useRouter();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<Member | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  async function handleToggle(
    memberId: string,
    field: "canRevealSecrets" | "canShareSecrets",
    value: boolean,
  ) {
    try {
      const res = await fetch(
        `/api/projects/${projectId}/members/${memberId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ [field]: value }),
        },
      );

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error ?? "Failed to update member");
      }

      toast.success("Member updated");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  async function handleRoleChange(
    memberId: string,
    role: "EDITOR" | "VIEWER",
  ) {
    try {
      const res = await fetch(
        `/api/projects/${projectId}/members/${memberId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role }),
        },
      );

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error ?? "Failed to change role");
      }

      toast.success("Role updated");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  async function handleRemove() {
    if (!removeTarget) return;
    setIsRemoving(true);
    try {
      const res = await fetch(
        `/api/projects/${projectId}/members/${removeTarget.id}`,
        { method: "DELETE" },
      );

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error ?? "Failed to remove member");
      }

      toast.success("Member removed");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsRemoving(false);
      setRemoveTarget(null);
    }
  }

  return (
    <>
      {isOwner && (
        <div className="flex justify-end">
          <Button size="sm" onClick={() => setInviteOpen(true)}>
            <UserPlus className="size-4" />
            Invite Member
          </Button>
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Can Reveal Secrets</TableHead>
            <TableHead>Can Share Secrets</TableHead>
            {isOwner && <TableHead className="w-[50px]" />}
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => (
            <TableRow key={member.id}>
              <TableCell>
                <div>
                  <div className="font-medium">{member.user.fullName}</div>
                  <div className="text-sm text-muted-foreground">
                    {member.user.email}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <RoleBadge role={member.role} />
              </TableCell>
              <TableCell>
                {member.role === "EDITOR" && isOwner ? (
                  <Switch
                    checked={member.canRevealSecrets}
                    onCheckedChange={(checked) =>
                      handleToggle(member.id, "canRevealSecrets", checked)
                    }
                  />
                ) : member.role === "OWNER" ? (
                  <span className="text-sm text-muted-foreground">Always</span>
                ) : (
                  <span className="text-sm text-muted-foreground">&mdash;</span>
                )}
              </TableCell>
              <TableCell>
                {member.role === "EDITOR" && isOwner ? (
                  <Switch
                    checked={member.canShareSecrets}
                    onCheckedChange={(checked) =>
                      handleToggle(member.id, "canShareSecrets", checked)
                    }
                  />
                ) : member.role === "OWNER" ? (
                  <span className="text-sm text-muted-foreground">Always</span>
                ) : (
                  <span className="text-sm text-muted-foreground">&mdash;</span>
                )}
              </TableCell>
              {isOwner && (
                <TableCell>
                  {member.role !== "OWNER" && (
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={<Button variant="ghost" size="icon-sm" />}
                      >
                        <MoreHorizontal className="size-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger>
                            Change Role
                          </DropdownMenuSubTrigger>
                          <DropdownMenuSubContent>
                            <DropdownMenuItem
                              onClick={() =>
                                handleRoleChange(member.id, "EDITOR")
                              }
                            >
                              Editor
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleRoleChange(member.id, "VIEWER")
                              }
                            >
                              Viewer
                            </DropdownMenuItem>
                          </DropdownMenuSubContent>
                        </DropdownMenuSub>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => setRemoveTarget(member)}
                        >
                          <Trash2 className="size-4" />
                          Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <InviteMemberDialog
        projectId={projectId}
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        onSuccess={() => {
          setInviteOpen(false);
          router.refresh();
        }}
      />

      <AlertDialog
        open={!!removeTarget}
        onOpenChange={(open) => {
          if (!open) setRemoveTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove{" "}
              <span className="font-medium">
                {removeTarget?.user.fullName}
              </span>{" "}
              from this project? They will lose all access.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleRemove}
              disabled={isRemoving}
            >
              {isRemoving ? "Removing\u2026" : "Remove member"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
