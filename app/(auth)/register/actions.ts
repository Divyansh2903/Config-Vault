"use server";

import { prisma } from "@/lib/db/prisma";

export async function createProfile(
  userId: string,
  fullName: string,
  email: string,
) {
  console.log("[createProfile] Upserting profile for userId:", userId, "email:", email);
  try {
    const result = await prisma.profile.upsert({
      where: { id: userId },
      update: { fullName, email },
      create: { id: userId, fullName, email },
    });
    console.log("[createProfile] Success:", result.id);
    return result;
  } catch (err) {
    console.error("[createProfile] Prisma error:", err);
    throw err;
  }
}
