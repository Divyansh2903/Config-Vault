import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db/prisma";

export const getDashboardData = unstable_cache(
  async (userId: string) => {
    const [projects, auditLogs] = await Promise.all([
      prisma.project.findMany({
        where: {
          members: { some: { userId } },
        },
        include: {
          _count: { select: { members: true, environments: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 6,
      }),
      prisma.auditLog.findMany({
        where: {
          project: {
            members: { some: { userId } },
          },
        },
        include: { actor: true, project: true },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
    ]);

    return { projects, auditLogs };
  },
  ["dashboard-data"],
  {
    revalidate: 30,
  },
);

export async function getPendingInvitations(email: string): Promise<
  {
    id: string;
    token: string;
    role: string;
    project: { name: string };
    inviter: { fullName: string };
  }[]
> {
  return prisma.projectInvitation.findMany({
    where: {
      email,
      status: "PENDING",
      expiresAt: { gt: new Date() },
    },
    include: {
      project: { select: { name: true } },
      inviter: { select: { fullName: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

