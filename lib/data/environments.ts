import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db/prisma";

export const getEnvironmentMeta = unstable_cache(
  async (envId: string) => {
    return prisma.environment.findUnique({
      where: { id: envId },
      include: {
        project: { select: { id: true, name: true } },
      },
    });
  },
  ["environment-meta"],
  {
    revalidate: 60,
  },
);

