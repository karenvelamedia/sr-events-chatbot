import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";

const LOG_DIR = path.join(process.cwd(), "logs");
const LOG_FILE = path.join(LOG_DIR, "ai-interactions.log");

export async function logInteraction(entry: {
  endpoint: string;
  input: unknown;
  output: string;
}) {
  try {
    await mkdir(LOG_DIR, { recursive: true });
    const timestamp = new Date().toISOString();
    const block = [
      `===== ${timestamp} — ${entry.endpoint} =====`,
      "--- INPUT ---",
      typeof entry.input === "string"
        ? entry.input
        : JSON.stringify(entry.input, null, 2),
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
