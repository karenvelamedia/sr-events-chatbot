"use client";

import { useEffect, useRef, useState } from "react";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const WELCOME: ChatMessage = {
  role: "assistant",
  content:
    "Hei! Hva kan vi hjelpe deg med i dag? Trenger du telt, utstyr eller hjelp til ett arrangement?",
};

const FORM_MARKER = "[KONTAKTSKJEMA]";

const SESSION_STORAGE_KEY = "sr-events-chat-session";

function newSessionId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  // Fallback for eldre nettlesere uten crypto.randomUUID
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "";
  try {
    const existing = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (existing) return existing;
    const fresh = newSessionId();
    window.localStorage.setItem(SESSION_STORAGE_KEY, fresh);
    return fresh;
  } catch {
    // localStorage utilgjengelig (privat modus o.l.) — kjør uten persistens
    return newSessionId();
  }
}

type ChatWidgetProps = {
  className?: string;
};

export function ChatWidget({ className = "" }: ChatWidgetProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [form, setForm] = useState({ navn: "", epost: "", telefon: "" });
  const [formError, setFormError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sessionIdRef = useRef<string>("");

  useEffect(() => {
    sessionIdRef.current = getOrCreateSessionId();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  async function sendMessage(userText: string) {
    const nyMeldinger: ChatMessage[] = [
      ...messages,
      { role: "user", content: userText },
    ];
    setMessages(nyMeldinger);
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionIdRef.current,
          messages: nyMeldinger.map(({ role, content }) => ({ role, content })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? "Noe gikk galt. Prøv igjen.");
        setMessages(nyMeldinger);
      } else {
        setMessages([
          ...nyMeldinger,
          { role: "assistant", content: data.svar ?? "" },
        ]);
      }
    } catch {
      setError("Kunne ikke nå serveren. Sjekk internett og prøv igjen.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSend() {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    await sendMessage(text);
  }

  function handleReset() {
    // Ny samtale = ny økt, slik at sammendraget gjelder én samtale
    const fresh = newSessionId();
    sessionIdRef.current = fresh;
    try {
      window.localStorage.setItem(SESSION_STORAGE_KEY, fresh);
    } catch {
      // ignorer hvis localStorage er utilgjengelig
    }
    setMessages([WELCOME]);
    setInput("");
    setError(null);
    setContactSubmitted(false);
    setForm({ navn: "", epost: "", telefon: "" });
    setFormError(null);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function onBeforeInput(e: React.FormEvent<HTMLTextAreaElement>) {
    const inputType = (e.nativeEvent as InputEvent).inputType;
    if (inputType === "insertLineBreak") {
      e.preventDefault();
      handleSend();
    }
  }

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    const navn = form.navn.trim();
    const epost = form.epost.trim();
    const telefon = form.telefon.trim();

    if (!navn || !epost || !telefon) {
      setFormError("Fyll inn navn, e-post og telefonnummer.");
      return;
    }

    const epostRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!epostRegex.test(epost)) {
      setFormError("E-postadressen ser ikke riktig ut.");
      return;
    }

    setLoading(true);
    setError(null);
    const summaryAsUserMessage: ChatMessage = {
      role: "user",
      content: `Navn: ${navn}\nE-post: ${epost}\nTelefon: ${telefon}`,
    };
    const updatedMessages = [...messages, summaryAsUserMessage];
    setMessages(updatedMessages);
    setContactSubmitted(true);

    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contact: { navn, epost, telefon },
          messages: updatedMessages.map(({ role, content }) => ({
            role,
            content,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(
          data?.error ?? "Klarte ikke sende forespørselen. Prøv igjen.",
        );
        setContactSubmitted(false);
        setMessages(messages);
      } else {
        setMessages([
          ...updatedMessages,
          {
            role: "assistant",
            content:
              data.svar ??
              "Supert, da hører dere fra Christian innen kort tid. Ha en fin dag!",
          },
        ]);
      }
    } catch {
      setError("Kunne ikke nå serveren. Sjekk internett og prøv igjen.");
      setContactSubmitted(false);
      setMessages(messages);
    } finally {
      setLoading(false);
    }
  }

  const lastAssistantIndex = (() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === "assistant") return i;
    }
    return -1;
  })();

  return (
    <div className={`flex h-full flex-col ${className}`}>
      <div className="mb-2 flex justify-end">
        <button
          type="button"
          onClick={handleReset}
          className="text-xs text-slate-500 hover:text-slate-900"
        >
          Start ny samtale
        </button>
      </div>

      <div
        ref={scrollRef}
        className="mb-4 flex-1 space-y-3 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
      >
        {messages.map((msg, i) => {
          const hasFormMarker = msg.content.includes(FORM_MARKER);
          const displayContent = msg.content.replace(FORM_MARKER, "").trim();
          const showForm =
            hasFormMarker && i === lastAssistantIndex && !contactSubmitted;

          return (
            <div key={i}>
              <div
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-[15px] leading-relaxed ${
                    msg.role === "user"
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-900"
                  }`}
                >
                  {displayContent}
                </div>
              </div>
              {showForm && (
                <form
                  onSubmit={handleFormSubmit}
                  className="mt-3 flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <label className="flex flex-col gap-1 text-sm text-slate-700">
                    Navn
                    <input
                      type="text"
                      value={form.navn}
                      onChange={(e) =>
                        setForm({ ...form, navn: e.target.value })
                      }
                      required
                      autoComplete="name"
                      className="rounded-xl border border-slate-300 px-3 py-2 text-[15px] outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-sm text-slate-700">
                    E-post
                    <input
                      type="email"
                      value={form.epost}
                      onChange={(e) =>
                        setForm({ ...form, epost: e.target.value })
                      }
                      required
                      autoComplete="email"
                      className="rounded-xl border border-slate-300 px-3 py-2 text-[15px] outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-sm text-slate-700">
                    Telefonnummer
                    <input
                      type="tel"
                      value={form.telefon}
                      onChange={(e) =>
                        setForm({ ...form, telefon: e.target.value })
                      }
                      required
                      autoComplete="tel"
                      className="rounded-xl border border-slate-300 px-3 py-2 text-[15px] outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                    />
                  </label>
                  {formError && (
                    <p className="text-sm text-red-700">{formError}</p>
                  )}
                  <button
                    type="submit"
                    disabled={loading}
                    className="mt-1 rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Send til Christian
                  </button>
                </form>
              )}
            </div>
          );
        })}
        {loading && (
          <div className="flex justify-start">
            <div className="rounded-2xl bg-slate-100 px-4 py-2.5 text-slate-500">
              <span className="inline-flex gap-1">
                <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" />
              </span>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex items-end gap-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          onBeforeInput={onBeforeInput}
          enterKeyHint="send"
          placeholder="Skriv en melding…"
          rows={2}
          maxLength={2000}
          disabled={loading}
          className="flex-1 resize-none rounded-2xl border border-slate-300 bg-white p-3 text-[15px] shadow-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:opacity-60"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );
}
