import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { supabase } from "./supabase";

const LOG_DIR = path.join(process.cwd(), "logs");
const LOG_FILE = path.join(LOG_DIR, "ai-interactions.log");

const IS_SERVERLESS = !!process.env.VERCEL || !!process.env.AWS_LAMBDA_FUNCTION_NAME;

export async function logInteraction(entry: {
  endpoint: string;
  input: unknown;
  output: string;
  sessionId?: string;
}) {
  const timestamp = new Date().toISOString();
  const inputText =
    typeof entry.input === "string"
      ? entry.input
      : JSON.stringify(entry.input, null, 2);

  if (supabase) {
    try {
      const { error } = await supabase.from("chat_interactions").insert({
        endpoint: entry.endpoint,
        input: typeof entry.input === "string" ? { text: entry.input } : entry.input,
        output: entry.output,
        session_id: entry.sessionId ?? null,
      });
      if (error) console.error("Supabase log error:", error);
    } catch (err) {
      console.error("Supabase log error:", err);
    }
  }

  if (IS_SERVERLESS) {
    console.log(
      `\n===== ${timestamp} — ${entry.endpoint} =====\n--- INPUT ---\n${inputText}\n--- OUTPUT ---\n${entry.output}\n`,
    );
    return;
  }

  try {
    await mkdir(LOG_DIR, { recursive: true });
    const block = [
      `===== ${timestamp} — ${entry.endpoint} =====`,
      "--- INPUT ---",
      inputText,
      "--- OUTPUT ---",
      entry.output,
      "",
      "",
    ].join("\n");
    await appendFile(LOG_FILE, block, "utf8");
  } catch (err) {
    console.error("Log error:", err);
  }
}
