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

type ChatWidgetProps = {
  className?: string;
};

export function ChatWidget({ className = "" }: ChatWidgetProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  async function handleSend() {
    const text = input.trim();
    if (!text || loading) return;

    const nyMeldinger: ChatMessage[] = [
      ...messages,
      { role: "user", content: text },
    ];
    setMessages(nyMeldinger);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
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

  function handleReset() {
    setMessages([WELCOME]);
    setInput("");
    setError(null);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

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
        {messages.map((msg, i) => (
          <div
            key={i}
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
              {msg.content}
            </div>
          </div>
        ))}
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
