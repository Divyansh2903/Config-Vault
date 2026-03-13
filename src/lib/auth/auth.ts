import crypto from "crypto";
import { prisma } from "@/lib/db/prisma";
import { hashPassword, verifyPassword } from "./password";

const SESSION_TTL_DAYS = 7;

export async function registerUser(input: {
  fullName: string;
  email: string;
  password: string;
}) {
  const existing = await prisma.userAuth.findUnique({
    where: { email: input.email },
  });
  if (existing) {
    throw new Error("An account with this email already exists.");
  }

  const passwordHash = await hashPassword(input.password);

  return prisma.$transaction(async (tx) => {
    const userAuth = await tx.userAuth.create({
      data: {
        email: input.email,
        passwordHash,
      },
    });

    const profile = await tx.profile.create({
      data: {
        id: userAuth.id,
        fullName: input.fullName,
        email: input.email,
      },
    });

    return { userAuth, profile };
  });
}

export async function authenticateUser(input: {
  email: string;
  password: string;
}) {
  const userAuth = await prisma.userAuth.findUnique({
    where: { email: input.email },
    include: { profile: true },
  });

  if (!userAuth || !userAuth.passwordHash) {
    return null;
  }

  const valid = await verifyPassword(input.password, userAuth.passwordHash);
  if (!valid) return null;

  if (!userAuth.profile) {
    // Ensure there is always a profile linked
    const profile = await prisma.profile.upsert({
      where: { id: userAuth.id },
      update: { email: userAuth.email },
      create: {
        id: userAuth.id,
        fullName: userAuth.email.split("@")[0],
        email: userAuth.email,
      },
    });
    return { userAuth, profile };
  }

  return { userAuth, profile: userAuth.profile };
}

export async function createSession(userId: string) {
  const sessionToken = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_TTL_DAYS);

  const session = await prisma.session.create({
    data: {
      userId,
      sessionToken,
      expiresAt,
    },
  });

  return { sessionToken, expiresAt, session };
}

export async function getUserFromSessionToken(token: string) {
  const session = await prisma.session.findUnique({
    where: { sessionToken: token },
    include: {
      user: {
        include: { profile: true },
      },
    },
  });

  if (!session) return null;
  if (session.expiresAt < new Date()) {
    await prisma.session.delete({ where: { sessionToken: token } });
    return null;
  }

  const userAuth = session.user;
  if (!userAuth.profile) return null;

  return { userAuth, profile: userAuth.profile };
}

export async function invalidateSession(token: string) {
  await prisma.session.deleteMany({
    where: { sessionToken: token },
  });
}

export async function invalidateAllSessionsForUser(userId: string) {
  await prisma.session.deleteMany({
    where: { userId },
  });
}

