import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import {
  buildLeadEmail,
  extractLeadDetails,
  type ContactInfo,
} from "@/lib/lead-email";
import { logInteraction } from "@/lib/log";

export const runtime = "nodejs";
export const maxDuration = 60;

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

function parseContact(raw: unknown): ContactInfo | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const navn = typeof r.navn === "string" ? r.navn.trim() : "";
  const epost = typeof r.epost === "string" ? r.epost.trim() : "";
  const telefon = typeof r.telefon === "string" ? r.telefon.trim() : "";
  if (!navn || !epost || !telefon) return null;
  const epostOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(epost);
  if (!epostOk) return null;
  return { navn, epost, telefon };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const contact = parseContact(body?.contact);
    const messages = body?.messages as ChatMessage[] | undefined;

    if (!contact) {
      return NextResponse.json(
        { error: "Mangler eller ugyldig kontaktinfo." },
        { status: 400 },
      );
    }
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Mangler samtalehistorikk." },
        { status: 400 },
      );
    }

    const apiKey = process.env.RESEND_API_KEY;
    const toEmail = process.env.LEAD_TO_EMAIL ?? "christian@srevents.no";
    const ccEmail = process.env.LEAD_CC_EMAIL ?? "";
    const fromEmail = process.env.LEAD_FROM_EMAIL ?? "onboarding@resend.dev";

    if (!apiKey) {
      return NextResponse.json(
        { error: "Resend er ikke konfigurert (mangler RESEND_API_KEY)." },
        { status: 500 },
      );
    }

    const details = await extractLeadDetails(messages);
    const { subject, html, text } = buildLeadEmail(contact, details, messages);

    const resend = new Resend(apiKey);
    const sendResult = await resend.emails.send({
      from: `SR Events chat <${fromEmail}>`,
      to: toEmail,
      cc: ccEmail ? [ccEmail] : undefined,
      replyTo: contact.epost,
      subject,
      html,
      text,
    });

    if (sendResult.error) {
      console.error("Resend error:", sendResult.error);
      return NextResponse.json(
        { error: `Kunne ikke sende epost: ${sendResult.error.message}` },
        { status: 502 },
      );
    }

    await logInteraction({
      endpoint: "/api/lead",
      input: { contact, messages },
      output: JSON.stringify(
        { subject, details, resendId: sendResult.data?.id ?? null },
        null,
        2,
      ),
    });

    return NextResponse.json({
      ok: true,
      svar:
        "Supert, da hører dere fra Christian innen kort tid. Ha en fin dag!",
    });
  } catch (err) {
    console.error("Lead error:", err);
    const message =
      err instanceof Error ? err.message : "Noe gikk galt under sending.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
