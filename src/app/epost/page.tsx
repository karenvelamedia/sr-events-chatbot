"use client";

import { useState } from "react";
import Link from "next/link";
import { EXAMPLES } from "@/lib/examples";

export default function EpostPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleSubmit() {
    if (!input.trim() || loading) return;
    setLoading(true);
    setError(null);
    setOutput("");
    setCopied(false);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ foresporsel: input }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? "Noe gikk galt. Prøv igjen.");
      } else {
        setOutput(data.svar ?? "");
      }
    } catch {
      setError("Kunne ikke nå serveren. Sjekk internett og prøv igjen.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <main className="mx-auto max-w-3xl px-5 py-10 sm:py-16">
      <Link
        href="/"
        className="mb-6 inline-flex items-center text-sm text-slate-500 hover:text-slate-900"
      >
        ← Tilbake
      </Link>

      <header className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
          SR Events
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          Epost-utkast – demo
        </h1>
        <p className="mt-3 max-w-xl text-slate-600">
          Lim inn en kundeforespørsel under, så ser du hvordan AI-en svarer.
          Den følger anti-fluff-reglene, foreslår riktig teltstørrelse fra
          tabellen, og bruker den faktiske lageradressen.
        </p>
      </header>

      <section className="mb-4">
        <p className="mb-2 text-sm font-medium text-slate-700">
          Prøv et eksempel:
        </p>
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex.label}
              type="button"
              onClick={() => setInput(ex.text)}
              disabled={loading}
              className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 transition hover:border-slate-400 hover:bg-slate-100 disabled:opacity-50"
            >
              {ex.label}
            </button>
          ))}
        </div>
      </section>

      <section className="mb-6">
        <label
          htmlFor="foresporsel"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          Kundens forespørsel
        </label>
        <textarea
          id="foresporsel"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Lim inn kundeforespørselen her…"
          rows={8}
          maxLength={5000}
          className="w-full resize-y rounded-xl border border-slate-300 bg-white p-4 text-base shadow-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
        />
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            {input.length}/5000 tegn
          </span>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !input.trim()}
            className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Genererer…" : "Generer svar"}
          </button>
        </div>
      </section>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {(loading || output) && (
        <section>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-medium text-slate-700">
              Forslag til svar
            </h2>
            {output && (
              <button
                type="button"
                onClick={handleCopy}
                className="text-xs font-medium text-slate-600 hover:text-slate-900"
              >
                {copied ? "Kopiert ✓" : "Kopier"}
              </button>
            )}
          </div>
          <article className="whitespace-pre-wrap rounded-xl border border-slate-200 bg-white p-6 font-[ui-serif,Georgia,serif] text-[15px] leading-relaxed text-slate-900 shadow-sm">
            {loading && !output ? (
              <span className="text-slate-400">Skriver svar…</span>
            ) : (
              output
            )}
          </article>
        </section>
      )}

      <footer className="mt-16 border-t border-slate-200 pt-6 text-center text-xs text-slate-500">
        Demo laget av{" "}
        <a
          href="https://velamedia.no"
          className="font-medium text-slate-700 hover:text-slate-900"
          target="_blank"
          rel="noreferrer"
        >
          Vela Media
        </a>{" "}
        for SR Events.
      </footer>
    </main>
  );
}
