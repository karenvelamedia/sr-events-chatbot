type Role = "user" | "assistant";

export type InteractionRow = {
  id: number | string;
  created_at: string;
  session_id: string | null;
  input: unknown;
  output: string | null;
};

export type SummaryMessage = {
  role: Role;
  content: string;
  at: string; // ISO-tidsstempel for meldingen (per utveksling)
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Henter siste bruker-melding fra en lagret `input` (array av {role, content}).
 * I /api/chat lagres hele samtalehistorikken i `input`; den siste user-meldingen
 * er den nye brukerteksten for denne utvekslingen.
 */
function lastUserContent(input: unknown): string | null {
  if (!Array.isArray(input)) return null;
  for (let i = input.length - 1; i >= 0; i--) {
    const m = input[i];
    if (
      m &&
      typeof m === "object" &&
      (m as { role?: unknown }).role === "user" &&
      typeof (m as { content?: unknown }).content === "string"
    ) {
      return (m as { content: string }).content;
    }
  }
  return null;
}

/**
 * Bygger en kronologisk samtale fra alle rader i en økt.
 * Hver rad = én utveksling (bruker → bot), tidsstemplet med radens created_at.
 */
export function buildConversation(rows: InteractionRow[]): SummaryMessage[] {
  const sorted = [...rows].sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );

  const messages: SummaryMessage[] = [];
  for (const row of sorted) {
    const userText = lastUserContent(row.input);
    if (userText && userText.trim().length > 0) {
      messages.push({ role: "user", content: userText, at: row.created_at });
    }
    if (typeof row.output === "string" && row.output.trim().length > 0) {
      messages.push({
        role: "assistant",
        content: row.output,
        at: row.created_at,
      });
    }
  }
  return messages;
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("nb-NO", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "Europe/Oslo",
  });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("nb-NO", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Oslo",
  });
}

export function buildSummaryEmail(
  sessionId: string,
  rows: InteractionRow[],
): { subject: string; html: string; text: string } {
  const messages = buildConversation(rows);
  const lastAt =
    messages.length > 0
      ? messages[messages.length - 1].at
      : rows[0]?.created_at ?? new Date().toISOString();

  const subject = `SR Events chat – ${formatDateTime(lastAt)}`;

  const bubbles = messages
    .map((m) => {
      const isUser = m.role === "user";
      const label = isUser ? "Kunde" : "SR Events-bot";
      const align = isUser ? "flex-end" : "flex-start";
      const bg = isUser ? "#1d1d1f" : "#f0f0f3";
      const color = isUser ? "#ffffff" : "#1d1d1f";
      return `
      <div style="display: flex; justify-content: ${align}; margin-bottom: 12px;">
        <div style="max-width: 80%;">
          <div style="font-size: 11px; color: #8e8e93; margin: 0 4px 2px; text-align: ${isUser ? "right" : "left"};">${label} · ${escapeHtml(formatTime(m.at))}</div>
          <div style="background: ${bg}; color: ${color}; border-radius: 14px; padding: 10px 14px; font-size: 14px; line-height: 1.5; white-space: pre-wrap; word-break: break-word;">${escapeHtml(m.content)}</div>
        </div>
      </div>`;
    })
    .join("");

  const html = `<!doctype html>
<html lang="nb">
<head><meta charset="utf-8" /><title>${escapeHtml(subject)}</title></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif; margin: 0; padding: 24px; background: #f5f5f7; color: #1d1d1f;">
  <div style="max-width: 640px; margin: 0 auto; background: #fff; border: 1px solid #e5e5ea; border-radius: 12px; overflow: hidden;">
    <div style="padding: 20px 24px; border-bottom: 1px solid #e5e5ea; background: #fafafa;">
      <p style="font-size: 18px; font-weight: 600; margin: 0;">${escapeHtml(subject)}</p>
      <p style="font-size: 12px; color: #8e8e93; margin: 6px 0 0;">Økt-ID: ${escapeHtml(sessionId)} · ${messages.length} meldinger</p>
    </div>
    <div style="padding: 24px;">
      ${bubbles || '<p style="color:#8e8e93;">Ingen meldinger i denne økten.</p>'}
    </div>
  </div>
</body>
</html>`;

  const text =
    `${subject}\nØkt-ID: ${sessionId}\n\n` +
    messages
      .map((m) => {
        const label = m.role === "user" ? "Kunde" : "Bot";
        return `[${formatTime(m.at)}] ${label}: ${m.content}`;
      })
      .join("\n\n");

  return { subject, html, text };
}
