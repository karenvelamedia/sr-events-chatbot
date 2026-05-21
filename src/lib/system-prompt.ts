import { readFileSync } from "node:fs";
import { join } from "node:path";

export function getSystemPrompt(): string {
  return readFileSync(
    join(process.cwd(), "content", "system-prompt.md"),
    "utf8",
  );
}
