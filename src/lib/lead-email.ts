import Anthropic from "@anthropic-ai/sdk";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type ContactInfo = {
  navn: string;
  epost: string;
  telefon: string;
};

export type LeadDetails = {
  typeArrangement: string;
  antallGjester: string;
  dato: string;
  sted: string;
  underlag: string;
  strom: string;
  rigging: string;
  budsjett: string;
  tilleggsutstyr: string;
  anbefaltTelt: string;
};

const EXTRACTION_PROMPT = `Du er en data-ekstraktor. Du får en chat-samtale mellom en kunde og en SR Events-bot. Trekk ut nøyaktig disse 10 feltene basert på det som faktisk er sagt i samtalen. Svar KUN med gyldig JSON i dette formatet:

{
  "typeArrangement": "Bryllup, firmafest, bursdag, festival osv. – eller 'Ikke oppgitt'",
  "antallGjester": "Antall som tall eller intervall – eller 'Ikke oppgitt'",
  "dato": "Dato slik kunden oppga den – eller 'Ikke oppgitt'",
  "sted": "By + adresse hvis oppgitt, ellers bare by + '(adresse ikke avklart)' – eller 'Ikke oppgitt'",
  "underlag": "Gress, grus, asfalt osv. – eller 'Ikke oppgitt'",
  "strom": "Tilgjengelig / Trenger fra SR Events – eller 'Ikke oppgitt'",
  "rigging": "Dugnad / SR Events rigger – eller 'Ikke oppgitt'",
  "budsjett": "Beløp eller intervall – eller 'Ikke oppgitt'",
  "tilleggsutstyr": "Hva kunden ønsker eller har selv – eller 'Ingen / har det selv' eller 'Ikke oppgitt'",
  "anbefaltTelt": "Teltstørrelsen boten anbefalte (f.eks. '12x12 meter') – eller 'Ikke nevnt'"
}

Ikke dikt opp informasjon. Hvis noe ikke er nevnt, skriv 'Ikke oppgitt'.`;

export async function extractLeadDetails(
  conversation: ChatMessage[],
): Promise<LeadDetails> {
  const client = new Anthropic();
  const transcript = conversation
    .map((m) => `${m.role === "user" ? "Kunde" : "Bot"}: ${m.content}`)
    .join("\n\n");

  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 800,
    system: EXTRACTION_PROMPT,
    messages: [{ role: "user", content: transcript }],
  });

  const text = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim();

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Klarte ikke parse strukturert data fra samtalen.");
  }
  return JSON.parse(jsonMatch[0]) as LeadDetails;
}

function buildSubject(details: LeadDetails): string {
  const parts = [details.typeArrangement, `${details.antallGjester} gjester`, details.dato]
    .filter((p) => p && p !== "Ikke oppgitt" && !p.includes("Ikke oppgitt"));
  return parts.length > 0
    ? `Ny forespørsel — ${parts.join(", ")}`
    : "Ny forespørsel fra srevents.no";
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function buildLeadEmail(
  contact: ContactInfo,
  details: LeadDetails,
  conversation: ChatMessage[] = [],
) {
  const subject = buildSubject(details);
  const c = {
    navn: escapeHtml(contact.navn),
    epost: escapeHtml(contact.epost),
    telefon: escapeHtml(contact.telefon),
  };
  const d = {
    typeArrangement: escapeHtml(details.typeArrangement),
    antallGjester: escapeHtml(details.antallGjester),
    dato: escapeHtml(details.dato),
    sted: escapeHtml(details.sted),
    underlag: escapeHtml(details.underlag),
    strom: escapeHtml(details.strom),
    rigging: escapeHtml(details.rigging),
    budsjett: escapeHtml(details.budsjett),
    tilleggsutstyr: escapeHtml(details.tilleggsutstyr),
    anbefaltTelt: escapeHtml(details.anbefaltTelt),
  };

  const html = `<!doctype html>
<html lang="nb">
<head><meta charset="utf-8" /><title>${escapeHtml(subject)}</title></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif; margin: 0; padding: 24px; background: #f5f5f7; color: #1d1d1f;">
  <div style="max-width: 720px; margin: 0 auto; background: #fff; border: 1px solid #e5e5ea; border-radius: 12px; overflow: hidden;">
    <div style="padding: 20px 24px; border-bottom: 1px solid #e5e5ea; background: #fafafa;">
      <p style="font-size: 18px; font-weight: 600; margin: 0;">${escapeHtml(subject)}</p>
    </div>
    <div style="padding: 24px;">
      <h2 style="font-size: 16px; margin: 0 0 8px;">Kontaktinfo</h2>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 16px;">
        <tr><td style="padding: 8px 0; border-bottom: 1px solid #f0f0f3; color: #6e6e73; width: 160px;">Navn</td><td style="padding: 8px 0; border-bottom: 1px solid #f0f0f3;">${c.navn}</td></tr>
        <tr><td style="padding: 8px 0; border-bottom: 1px solid #f0f0f3; color: #6e6e73;">E-post</td><td style="padding: 8px 0; border-bottom: 1px solid #f0f0f3;"><a href="mailto:${c.epost}">${c.epost}</a></td></tr>
        <tr><td style="padding: 8px 0; border-bottom: 1px solid #f0f0f3; color: #6e6e73;">Telefon</td><td style="padding: 8px 0; border-bottom: 1px solid #f0f0f3;"><a href="tel:${c.telefon}">${c.telefon}</a></td></tr>
      </table>

      <h2 style="font-size: 16px; margin: 24px 0 8px;">Forespørsel</h2>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr><td style="padding: 8px 0; border-bottom: 1px solid #f0f0f3; color: #6e6e73; width: 160px;">Type arrangement</td><td style="padding: 8px 0; border-bottom: 1px solid #f0f0f3;">${d.typeArrangement}</td></tr>
        <tr><td style="padding: 8px 0; border-bottom: 1px solid #f0f0f3; color: #6e6e73;">Antall gjester</td><td style="padding: 8px 0; border-bottom: 1px solid #f0f0f3;">${d.antallGjester}</td></tr>
        <tr><td style="padding: 8px 0; border-bottom: 1px solid #f0f0f3; color: #6e6e73;">Dato</td><td style="padding: 8px 0; border-bottom: 1px solid #f0f0f3;">${d.dato}</td></tr>
        <tr><td style="padding: 8px 0; border-bottom: 1px solid #f0f0f3; color: #6e6e73;">Sted</td><td style="padding: 8px 0; border-bottom: 1px solid #f0f0f3;">${d.sted}</td></tr>
        <tr><td style="padding: 8px 0; border-bottom: 1px solid #f0f0f3; color: #6e6e73;">Underlag</td><td style="padding: 8px 0; border-bottom: 1px solid #f0f0f3;">${d.underlag}</td></tr>
        <tr><td style="padding: 8px 0; border-bottom: 1px solid #f0f0f3; color: #6e6e73;">Strøm</td><td style="padding: 8px 0; border-bottom: 1px solid #f0f0f3;">${d.strom}</td></tr>
        <tr><td style="padding: 8px 0; border-bottom: 1px solid #f0f0f3; color: #6e6e73;">Rigging</td><td style="padding: 8px 0; border-bottom: 1px solid #f0f0f3;">${d.rigging}</td></tr>
        <tr><td style="padding: 8px 0; border-bottom: 1px solid #f0f0f3; color: #6e6e73;">Budsjett</td><td style="padding: 8px 0; border-bottom: 1px solid #f0f0f3;">${d.budsjett}</td></tr>
        <tr><td style="padding: 8px 0; border-bottom: 1px solid #f0f0f3; color: #6e6e73;">Tilleggsutstyr</td><td style="padding: 8px 0; border-bottom: 1px solid #f0f0f3;">${d.tilleggsutstyr}</td></tr>
        <tr><td style="padding: 8px 0; color: #6e6e73;">Boten anbefalte</td><td style="padding: 8px 0;">${d.anbefaltTelt}</td></tr>
      </table>

      ${
        conversation.length > 0
          ? `<h2 style="font-size: 16px; margin: 24px 0 8px;">Full samtale</h2>
      <div style="background: #f5f5f7; border-radius: 10px; padding: 16px; font-size: 13px; line-height: 1.6; white-space: pre-wrap;">${conversation
        .map((m) => {
          const label = m.role === "user" ? "Kunde" : "Bot";
          const color = m.role === "user" ? "#1d1d1f" : "#6e6e73";
          return `<div style="margin-bottom: 8px;"><strong style="color: ${color};">${label}:</strong> ${escapeHtml(m.content)}</div>`;
        })
        .join("")}</div>`
          : ""
      }
    </div>
  </div>
</body>
</html>`;

  const text = `${subject}

Kontaktinfo
Navn: ${contact.navn}
E-post: ${contact.epost}
Telefon: ${contact.telefon}

Forespørsel
Type arrangement: ${details.typeArrangement}
Antall gjester: ${details.antallGjester}
Dato: ${details.dato}
Sted: ${details.sted}
Underlag: ${details.underlag}
Strøm: ${details.strom}
Rigging: ${details.rigging}
Budsjett: ${details.budsjett}
Tilleggsutstyr: ${details.tilleggsutstyr}
Boten anbefalte: ${details.anbefaltTelt}${
    conversation.length > 0
      ? `\n\nFull samtale\n${conversation
          .map(
            (m) => `${m.role === "user" ? "Kunde" : "Bot"}: ${m.content}`,
          )
          .join("\n\n")}`
      : ""
  }`;

  return { subject, html, text };
}
