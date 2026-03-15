-- CreateEnum
CREATE TYPE "InvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED');

-- DropIndex
DROP INDEX "project_members_user_id_project_id_idx";

-- CreateTable
CREATE TABLE "project_invitations" (
    "id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "role" "MemberRole" NOT NULL DEFAULT 'VIEWER',
    "token" TEXT NOT NULL,
    "status" "InvitationStatus" NOT NULL DEFAULT 'PENDING',
    "invited_by" UUID NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_invitations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "project_invitations_token_key" ON "project_invitations"("token");

-- CreateIndex
CREATE INDEX "project_invitations_email_status_idx" ON "project_invitations"("email", "status");

-- AddForeignKey
ALTER TABLE "project_invitations" ADD CONSTRAINT "project_invitations_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_invitations" ADD CONSTRAINT "project_invitations_invited_by_fkey" FOREIGN KEY ("invited_by") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
