import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";

const LOG_DIR = path.join(process.cwd(), "logs");
const LOG_FILE = path.join(LOG_DIR, "ai-interactions.log");

const IS_SERVERLESS = !!process.env.VERCEL || !!process.env.AWS_LAMBDA_FUNCTION_NAME;

export async function logInteraction(entry: {
  endpoint: string;
  input: unknown;
  output: string;
}) {
  const timestamp = new Date().toISOString();
  const inputText =
    typeof entry.input === "string"
      ? entry.input
      : JSON.stringify(entry.input, null, 2);

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
