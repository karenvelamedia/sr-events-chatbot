import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { supabase } from "@/lib/supabase";
import {
  buildSummaryEmail,
  type InteractionRow,
} from "@/lib/chat-summary-email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// En økt regnes som avsluttet når siste melding er minst 10 minutter gammel.
const IDLE_MINUTES = 10;

function authorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false; // Uten satt secret nekter vi alt.
  const header = req.headers.get("authorization") ?? "";
  return header === `Bearer ${secret}`;
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase er ikke konfigurert." },
      { status: 500 },
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Resend er ikke konfigurert (mangler RESEND_API_KEY)." },
      { status: 500 },
    );
  }

  const toEmail = process.env.CHAT_SUMMARY_EMAIL ?? "christian@srevents.no";
  const fromEmail = process.env.LEAD_FROM_EMAIL ?? "onboarding@resend.dev";
  const cutoffIso = new Date(Date.now() - IDLE_MINUTES * 60_000).toISOString();

  // Hent alle chat-rader som ennå ikke er oppsummert.
  const { data, error } = await supabase
    .from("chat_interactions")
    .select("id, created_at, session_id, input, output")
    .eq("endpoint", "/api/chat")
    .is("summary_sent_at", null)
    .not("session_id", "is", null)
    .order("created_at", { ascending: true })
    .limit(2000);

  if (error) {
    console.error("Cron summary: Supabase-feil ved henting:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = (data ?? []) as InteractionRow[];

  // Grupper på session_id.
  const sessions = new Map<string, InteractionRow[]>();
  for (const row of rows) {
    const sid = row.session_id;
    if (!sid) continue;
    const list = sessions.get(sid);
    if (list) list.push(row);
    else sessions.set(sid, [row]);
  }

  const resend = new Resend(apiKey);
  const sent: string[] = [];
  const skipped: string[] = [];
  const failed: string[] = [];

  for (const [sessionId, sessionRows] of sessions) {
    // Avsluttet kun hvis siste melding i økten er eldre enn cutoff.
    const lastCreatedAt = sessionRows.reduce(
      (max, r) => (r.created_at > max ? r.created_at : max),
      sessionRows[0].created_at,
    );
    if (lastCreatedAt > cutoffIso) {
      skipped.push(sessionId); // Fortsatt aktiv — vent til neste kjøring.
      continue;
    }

    const { subject, html, text } = buildSummaryEmail(sessionId, sessionRows);

    try {
      const result = await resend.emails.send({
        from: `SR Events chat <${fromEmail}>`,
        to: toEmail,
        subject,
        html,
        text,
      });

      if (result.error) {
        console.error(`Cron summary: Resend-feil (${sessionId}):`, result.error);
        failed.push(sessionId);
        continue;
      }
    } catch (err) {
      console.error(`Cron summary: sending feilet (${sessionId}):`, err);
      failed.push(sessionId);
      continue;
    }

    // Marker kun rader vi faktisk inkluderte som sendt.
    const ids = sessionRows.map((r) => r.id);
    const { error: updateError } = await supabase
      .from("chat_interactions")
      .update({ summary_sent_at: new Date().toISOString() })
      .in("id", ids);

    if (updateError) {
      // E-posten er sendt, men markering feilet — logg så vi kan rydde manuelt.
      console.error(
        `Cron summary: klarte ikke markere som sendt (${sessionId}):`,
        updateError,
      );
      failed.push(sessionId);
      continue;
    }

    sent.push(sessionId);
  }

  return NextResponse.json({
    ok: true,
    checkedSessions: sessions.size,
    sent: sent.length,
    skipped: skipped.length,
    failed: failed.length,
  });
}
