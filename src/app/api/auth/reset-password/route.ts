import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { hashPassword } from "@/lib/auth/password";
import { invalidateAllSessionsForUser } from "@/lib/auth/auth";
import { resetPasswordSchema } from "@/lib/validations/schemas";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = resetPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
    }

    const { token, password } = parsed.data;

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken) {
      return NextResponse.json(
        { error: "Invalid or expired reset link." },
        { status: 400 },
      );
    }

    if (resetToken.usedAt) {
      return NextResponse.json(
        { error: "This reset link has already been used." },
        { status: 400 },
      );
    }

    if (resetToken.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "This reset link has expired. Please request a new one." },
        { status: 400 },
      );
    }

    const passwordHash = await hashPassword(password);

    await prisma.$transaction(async (tx) => {
      // Update the password
      await tx.userAuth.update({
        where: { id: resetToken.userId },
        data: { passwordHash },
      });

      // Mark the token as used
      await tx.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() },
      });
    });

    // Invalidate all existing sessions so user must log in with new password
    await invalidateAllSessionsForUser(resetToken.userId);

    return NextResponse.json({
      ok: true,
      message: "Password has been reset successfully.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
