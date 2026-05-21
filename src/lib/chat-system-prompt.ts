import { readFileSync } from "node:fs";
import { join } from "node:path";
import { SYSTEM_PROMPT } from "./system-prompt";

const CHAT_INSTRUCTIONS = readFileSync(
  join(process.cwd(), "content", "chat-instructions.md"),
  "utf8",
);

export const CHAT_SYSTEM_PROMPT = `${SYSTEM_PROMPT}\n\n${CHAT_INSTRUCTIONS}`;
