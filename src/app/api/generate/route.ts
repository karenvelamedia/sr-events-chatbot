import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { getSystemPrompt } from "@/lib/system-prompt";
import { logInteraction } from "@/lib/log";

export const runtime = "nodejs";
export const maxDuration = 60;

const client = new Anthropic();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const foresporsel = String(body?.foresporsel ?? "").trim();

    if (!foresporsel) {
      return NextResponse.json(
        { error: "Mangler forespørsel." },
        { status: 400 },
      );
    }

    if (foresporsel.length > 5000) {
      return NextResponse.json(
        { error: "Forespørselen er for lang (maks 5000 tegn)." },
        { status: 400 },
      );
    }

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1500,
      system: [
        {
          type: "text",
          text: getSystemPrompt(),
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [
        {
          role: "user",
          content: `Her er kundens forespørsel:\n\n---\n${foresporsel}\n---\n\nSkriv et komplett e-postsvar klar til å sendes. Bruk ren tekst med tydelig luft mellom avsnitt og spørsmål.`,
        },
      ],
    });

    const text = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("\n");

    await logInteraction({
      endpoint: "/api/generate",
      input: foresporsel,
      output: text,
    });

    return NextResponse.json({ svar: text });
  } catch (err) {
    console.error("Generate error:", err);
    const message =
      err instanceof Anthropic.APIError
        ? `API-feil (${err.status}): ${err.message}`
        : "Noe gikk galt under generering. Prøv igjen.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
