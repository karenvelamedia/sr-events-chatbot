import { readFileSync } from "node:fs";
import { join } from "node:path";

export const SYSTEM_PROMPT = readFileSync(
  join(process.cwd(), "content", "system-prompt.md"),
  "utf8",
);
