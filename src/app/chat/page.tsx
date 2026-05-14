import Link from "next/link";
import { ChatWidget } from "@/components/chat-widget";

export default function ChatPage() {
  return (
    <main className="mx-auto flex h-dvh max-w-2xl flex-col px-5 py-6">
      <div className="mb-4">
        <Link
          href="/"
          className="text-sm text-slate-500 hover:text-slate-900"
        >
          ← Tilbake
        </Link>
      </div>

      <header className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
          SR Events
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          Chat med oss
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Vi hjelper deg med tilbud på utleie av telt, lys, varme og annet
          eventutstyr.
        </p>
      </header>

      <ChatWidget className="flex-1" />
    </main>
  );
}
