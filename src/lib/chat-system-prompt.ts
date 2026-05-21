import { readFileSync } from "node:fs";
import { join } from "node:path";
import { getSystemPrompt } from "./system-prompt";

export function getChatSystemPrompt(): string {
  const chatInstructions = readFileSync(
    join(process.cwd(), "content", "chat-instructions.md"),
    "utf8",
  );
  return `${getSystemPrompt()}\n\n${chatInstructions}`;
}
