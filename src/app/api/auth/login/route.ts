import { NextResponse } from "next/server";
import { authenticateUser, createSession } from "@/lib/auth/auth";
import { setSessionCookie } from "@/lib/auth/cookies";
import { loginSchema } from "@/lib/validations/schemas";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid credentials." },
        { status: 400 },
      );
    }

    const { email, password } = parsed.data;
    const result = await authenticateUser({ email, password });

    if (!result) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 },
      );
    }

    const { sessionToken, expiresAt } = await createSession(result.userAuth.id);
    await setSessionCookie(sessionToken, expiresAt);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[Auth] Login error", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}

