import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth/get-user";

export async function GET() {
  const result = await getUser();
  if (!result) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    id: result.user.id,
    email: result.user.email,
  });
}

