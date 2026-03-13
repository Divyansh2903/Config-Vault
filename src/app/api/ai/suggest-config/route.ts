import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth/get-user";
import { z } from "zod/v4";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const requestSchema = z.object({
  prompt: z.string().min(1).max(2000),
});

const SYSTEM_PROMPT =
  "You are a config/environment variable expert. Given a user's description of their project or deployment error, suggest relevant environment variables. Return ONLY a valid JSON array with objects having: key (string, UPPER_SNAKE_CASE), description (string), is_secret (boolean), is_required (boolean). No markdown, no explanation, just the JSON array.";

function isValidSuggestion(
  item: unknown,
): item is {
  key: string;
  description: string;
  is_secret: boolean;
  is_required: boolean;
} {
  if (typeof item !== "object" || item === null) return false;
  const obj = item as Record<string, unknown>;
  return (
    typeof obj.key === "string" &&
    typeof obj.description === "string" &&
    typeof obj.is_secret === "boolean" &&
    typeof obj.is_required === "boolean"
  );
}

export async function POST(request: NextRequest) {
  if (!GEMINI_API_KEY) {
    return NextResponse.json(
      { error: "AI features are not configured" },
      { status: 503 },
    );
  }

  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = requestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
    }

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [
            { role: "user", parts: [{ text: parsed.data.prompt }] },
          ],
        }),
      },
    );

    if (!geminiRes.ok) {
      const errBody = await geminiRes.text();
      console.error("Gemini API error:", geminiRes.status, errBody);
      return NextResponse.json(
        { error: "AI service returned an error" },
        { status: 502 },
      );
    }

    const geminiData = await geminiRes.json();
    const text: string | undefined =
      geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return NextResponse.json(
        { error: "AI returned an empty response" },
        { status: 502 },
      );
    }

    let jsonArray: unknown[];
    try {
      const cleaned = text.replace(/```json\s*/g, "").replace(/```/g, "").trim();
      jsonArray = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse Gemini response as JSON:", text);
      return NextResponse.json(
        { error: "AI returned an unparseable response" },
        { status: 502 },
      );
    }

    if (!Array.isArray(jsonArray)) {
      return NextResponse.json(
        { error: "AI returned an unexpected format" },
        { status: 502 },
      );
    }

    const suggestions = jsonArray.filter(isValidSuggestion);

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("Failed to generate config suggestions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
