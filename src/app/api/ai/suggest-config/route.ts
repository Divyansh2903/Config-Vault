import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth/get-user";
import { z } from "zod/v4";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const requestSchema = z.object({
  prompt: z.string().min(1).max(2000),
  existingKeys: z.array(z.string()).optional(),
});

const SYSTEM_PROMPT = `You are a config/environment variable expert for software projects.

The user may describe:
- Their project, tech stack, or architecture (e.g. "Next.js app with Supabase, Stripe, and SendGrid")
- A specific feature they're implementing (e.g. "adding OAuth with Google and GitHub")
- Project documentation or README content
- A deployment error or missing config issue
- The services/integrations they use

Based on this, suggest the relevant environment variables they would need.

Rules:
- Return ONLY a valid JSON array (no markdown, no explanation)
- Each object must have: key (string, UPPER_SNAKE_CASE), description (string, concise but helpful), is_secret (boolean — true for API keys, tokens, passwords, connection strings), is_required (boolean — true for vars the app cannot start without)
- Be specific and practical — use real naming conventions (e.g. NEXT_PUBLIC_SUPABASE_URL, not SUPABASE_URL_PUBLIC)
- If existing keys are provided, do NOT suggest duplicates
- Group related vars logically (e.g. all Stripe vars together)
- Include port/host/URL vars when relevant, not just secrets`;

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

    let userPrompt = parsed.data.prompt;
    const existingKeys = parsed.data.existingKeys;
    if (existingKeys && existingKeys.length > 0) {
      userPrompt += `\n\nAlready configured keys (do NOT suggest these again):\n${existingKeys.join(", ")}`;
    }

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [
            { role: "user", parts: [{ text: userPrompt }] },
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
