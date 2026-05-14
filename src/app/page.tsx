import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-12 sm:py-20">
      <header className="mb-12">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
          SR Events – Demo
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          AI-assistent for SR Events
        </h1>
        <p className="mt-4 max-w-xl text-slate-600">
          To måter å bruke den samme «hjernen» på – velg hvilken du vil teste.
          Begge følger de samme reglene fra agentdokumentasjonen din:
          aldri dikte opp info, riktig lageradresse, anti-fluff-tone, og
          teltstørrelser fra tabellen.
        </p>
      </header>

      <div className="grid gap-5 sm:grid-cols-2">
        <Link
          href="/epost"
          className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-slate-400 hover:shadow-md"
        >
          <div className="mb-3 text-3xl">✉️</div>
          <h2 className="text-lg font-semibold text-slate-900">
            Epost-utkast
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Lim inn en kundeforespørsel og få et komplett e-postsvar tilbake.
            Slik vil en utkast-funksjon i Outlook fungere.
          </p>
          <p className="mt-4 text-sm font-medium text-slate-900 group-hover:underline">
            Test epost-modus →
          </p>
        </Link>

        <Link
          href="/chat"
          className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-slate-400 hover:shadow-md"
        >
          <div className="mb-3 text-3xl">💬</div>
          <h2 className="text-lg font-semibold text-slate-900">
            Chat-samtale
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Snakk med AI-en frem og tilbake – som en widget på nettsiden din.
            Stiller ett spørsmål av gangen og samler info bit for bit.
          </p>
          <p className="mt-4 text-sm font-medium text-slate-900 group-hover:underline">
            Test chat-modus →
          </p>
        </Link>
      </div>

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
