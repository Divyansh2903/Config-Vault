import { NextResponse } from "next/server";
import { registerUser, createSession } from "@/lib/auth/auth";
import { setSessionCookie } from "@/lib/auth/cookies";
import { registerSchema } from "@/lib/validations/schemas";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid registration data." },
        { status: 400 },
      );
    }

    const { fullName, email, password } = parsed.data;

    const { userAuth } = await registerUser({ fullName, email, password });
    const { sessionToken, expiresAt } = await createSession(userAuth.id);
    await setSessionCookie(sessionToken, expiresAt);

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("[Auth] Register error", error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}

