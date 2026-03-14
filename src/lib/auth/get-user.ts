import { cache } from "react";
import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME } from "./cookies";
import { getUserFromSessionToken } from "./auth";
import type { Profile } from "@prisma/client";

const getCachedUserByToken = cache(
  async (token: string): Promise<{ user: { id: string; email: string }; profile: Profile } | null> => {
    const result = await getUserFromSessionToken(token);
    if (!result) return null;
    const { userAuth, profile } = result;
    return {
      user: { id: userAuth.id, email: userAuth.email },
      profile,
    };
  },
);

export async function getUser(): Promise<{ user: { id: string; email: string }; profile: Profile } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return getCachedUserByToken(token);
}

export async function requireUser() {
  const user = await getUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}
