import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { getChatSystemPrompt } from "@/lib/chat-system-prompt";
import { logInteraction } from "@/lib/log";

export const runtime = "nodejs";
export const maxDuration = 60;

const client = new Anthropic();

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages = body?.messages as ChatMessage[] | undefined;
    const sessionId =
      typeof body?.session_id === "string" && body.session_id.trim().length > 0
        ? body.session_id.trim().slice(0, 100)
        : undefined;

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Mangler meldinger." },
        { status: 400 },
      );
    }

    if (messages.length > 40) {
      return NextResponse.json(
        { error: "Samtalen er for lang. Start på nytt." },
        { status: 400 },
      );
    }

    const sanitized = messages
      .filter(
        (m) =>
          (m.role === "user" || m.role === "assistant") &&
          typeof m.content === "string" &&
          m.content.trim().length > 0,
      )
      .map((m) => ({
        role: m.role,
        content: m.content.slice(0, 5000),
      }));

    if (sanitized.length === 0 || sanitized[sanitized.length - 1].role !== "user") {
      return NextResponse.json(
        { error: "Siste melding må være fra brukeren." },
        { status: 400 },
      );
    }

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 600,
      system: [
        {
          type: "text",
          text: getChatSystemPrompt(),
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: sanitized,
    });

    const text = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("\n");

    await logInteraction({
      endpoint: "/api/chat",
      input: sanitized,
      output: text,
      sessionId,
    });

    return NextResponse.json({ svar: text });
  } catch (err) {
    console.error("Chat error:", err);
    const message =
      err instanceof Anthropic.APIError
        ? `API-feil (${err.status}): ${err.message}`
        : "Noe gikk galt under generering. Prøv igjen.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
