import { supabase } from "../src/lib/supabase";

const RESET = "\x1b[0m";
const DIM = "\x1b[2m";
const BOLD = "\x1b[1m";
const CYAN = "\x1b[36m";
const GREEN = "\x1b[32m";
const MAGENTA = "\x1b[35m";
const YELLOW = "\x1b[33m";

type Row = {
  created_at: string;
  endpoint: string;
  input: unknown;
  output: string;
};

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("nb-NO", {
    dateStyle: "short",
    timeStyle: "medium",
  });
}

function printUser(text: string) {
  console.log(`${CYAN}${BOLD}BRUKER:${RESET}`);
  console.log(indent(text));
}

function printBot(text: string) {
  console.log(`${GREEN}${BOLD}BOT:${RESET}`);
  console.log(indent(text));
}

function indent(text: string, prefix = "  "): string {
  return text
    .split("\n")
    .map((l) => prefix + l)
    .join("\n");
}

function renderInput(input: unknown): void {
  if (Array.isArray(input)) {
    for (const msg of input) {
      if (
        msg &&
        typeof msg === "object" &&
        "role" in msg &&
        "content" in msg &&
        typeof (msg as { content: unknown }).content === "string"
      ) {
        const m = msg as { role: string; content: string };
        if (m.role === "assistant") {
          printBot(m.content);
        } else {
          printUser(m.content);
        }
        console.log();
      }
    }
    return;
  }

  if (input && typeof input === "object") {
    const obj = input as Record<string, unknown>;
    if (typeof obj.text === "string") {
      printUser(obj.text);
      return;
    }
    if (Array.isArray(obj.messages)) {
      if (obj.contact) {
        console.log(`${YELLOW}${BOLD}KONTAKT:${RESET}`);
        console.log(indent(JSON.stringify(obj.contact, null, 2)));
        console.log();
      }
      renderInput(obj.messages);
      return;
    }
    console.log(`${YELLOW}${BOLD}INPUT (json):${RESET}`);
    console.log(indent(JSON.stringify(obj, null, 2)));
    return;
  }

  if (typeof input === "string") {
    printUser(input);
    return;
  }

  console.log(`${DIM}(tom input)${RESET}`);
}

async function main() {
  if (!supabase) {
    console.error(
      "Supabase-klienten er ikke konfigurert. Sett SUPABASE_URL og SUPABASE_SERVICE_ROLE_KEY i .env.local.",
    );
    process.exit(1);
  }

  const { data, error } = await supabase
    .from("chat_interactions")
    .select("created_at, endpoint, input, output")
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    console.error("Klarte ikke å hente logger:", error.message);
    process.exit(1);
  }

  const rows = (data ?? []) as Row[];

  if (rows.length === 0) {
    console.log("Ingen interaksjoner funnet.");
    return;
  }

  console.log(
    `${BOLD}Siste ${rows.length} interaksjon(er) — nyeste først${RESET}\n`,
  );

  for (const row of rows) {
    const ts = formatTimestamp(row.created_at);
    console.log(
      `${MAGENTA}${"=".repeat(72)}${RESET}\n${DIM}${ts}${RESET}  ${BOLD}${row.endpoint}${RESET}\n`,
    );
    renderInput(row.input);
    console.log();
    printBot(row.output ?? "");
    console.log();
  }
}

main().catch((err) => {
  console.error("Uventet feil:", err);
  process.exit(1);
});
