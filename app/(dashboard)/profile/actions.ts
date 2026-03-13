"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/get-user";

export async function updateProfile(fullName: string) {
  const { user } = await requireUser();

  await prisma.profile.update({
    where: { id: user.id },
    data: { fullName },
  });

  revalidatePath("/dashboard/profile");
  return { success: true };
}
