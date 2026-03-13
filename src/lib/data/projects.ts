import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db/prisma";

export const getUserProjects = unstable_cache(
  async (userId: string) => {
    return prisma.project.findMany({
      where: {
        members: { some: { userId } },
      },
      include: {
        _count: {
          select: {
            members: true,
            environments: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  },
  ["user-projects"],
  {
    revalidate: 30,
  },
);

export const getProjectShell = unstable_cache(
  async (userId: string, projectId: string) => {
    const member = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId,
        },
      },
    });

    if (!member) {
      return null;
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { name: true },
    });

    if (!project) {
      return null;
    }

    return { member, project };
  },
  ["project-shell"],
  {
    revalidate: 60,
  },
);

export const getProjectOverview = unstable_cache(
  async (projectId: string, userId: string) => {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        environments: {
          include: { _count: { select: { entries: true } } },
          orderBy: { createdAt: "asc" },
        },
        members: {
          select: { userId: true, role: true },
        },
        auditLogs: {
          orderBy: { createdAt: "desc" },
          take: 5,
          include: { actor: { select: { fullName: true } } },
        },
      },
    });

    if (!project) {
      return null;
    }

    const membership = project.members.find((m) => m.userId === userId);
    if (!membership) {
      return null;
    }

    return { project, membership };
  },
  ["project-overview"],
  {
    revalidate: 30,
  },
);

export const getProjectMembers = unstable_cache(
  async (projectId: string) => {
    return prisma.projectMember.findMany({
      where: { projectId },
      include: {
        user: { select: { id: true, fullName: true, email: true } },
      },
      orderBy: { createdAt: "asc" },
    });
  },
  ["project-members"],
  {
    revalidate: 60,
  },
);

