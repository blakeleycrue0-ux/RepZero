"use client";

import { useEffect, useRef, useState } from "react";
import type { ChatMessage } from "@/lib/store/types";
import { newId } from "@/lib/id";
import { IconSend } from "@/components/icons";
import { Spinner } from "@/components/ui";

export default function Chat({
  initialMessages,
  endpoint,
  buildBody,
  onPersist,
  emptyTitle,
  emptyDescription,
  suggestions,
  disclaimer,
  placeholder = "Ask anything…",
}: {
  initialMessages: ChatMessage[];
  endpoint: string;
  buildBody: (messages: { role: "user" | "assistant"; content: string }[]) => unknown;
  onPersist: (messages: ChatMessage[]) => void;
  emptyTitle: string;
  emptyDescription: string;
  suggestions: string[];
  disclaimer?: string;
  placeholder?: string;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function send(text: string) {
    if (!text.trim() || busy) return;
    setError(null);
    const userMsg: ChatMessage = { id: newId(), role: "user", content: text.trim(), createdAt: new Date().toISOString() };
    const assistantMsg: ChatMessage = { id: newId(), role: "assistant", content: "", createdAt: new Date().toISOString() };
    const withUser = [...messages, userMsg];
    setMessages([...withUser, assistantMsg]);
    setInput("");
    setBusy(true);

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(buildBody(withUser.map((m) => ({ role: m.role, content: m.content })))),
      });
      if (!res.ok || !res.body) {
        const text = await res.text().catch(() => "");
        throw new Error(text || "Something went wrong.");
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        const finalAcc = acc;
        setMessages((prev) => {
          const next = [...prev];
          next[next.length - 1] = { ...next[next.length - 1], content: finalAcc };
          return next;
        });
      }
      const finalMessages = [...withUser, { ...assistantMsg, content: acc }];
      setMessages(finalMessages);
      onPersist(finalMessages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setMessages(withUser);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex h-full min-h-[70vh] flex-col">
      {disclaimer && (
        <p className="mb-4 rounded-xl border border-border-subtle bg-surface-1 px-4 py-2.5 text-[12px] leading-relaxed text-text-tertiary">
          {disclaimer}
        </p>
      )}

      <div ref={scrollRef} className="scroll-thin flex-1 overflow-y-auto pr-1">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-14 text-center">
            <h2 className="font-display text-xl">{emptyTitle}</h2>
            <p className="max-w-xs text-[13px] leading-relaxed text-text-secondary">{emptyDescription}</p>
            <div className="flex flex-wrap justify-center gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  className="rounded-full border border-border-subtle px-3.5 py-1.5 text-[12px] text-text-secondary transition-colors hover:border-border-strong hover:text-text-primary"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3 pb-4">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-[14px] leading-relaxed ${
                    m.role === "user"
                      ? "bg-surface-inverse text-text-inverse"
                      : "border border-border-subtle bg-surface-1"
                  }`}
                >
                  {m.content || (busy && m.role === "assistant" ? <Spinner className="text-text-tertiary" /> : "")}
                </div>
              </div>
            ))}
          </div>
        )}
        {error && (
          <p role="alert" className="mb-2 text-[13px] text-danger">
            {error}
          </p>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="mt-3 flex items-center gap-2 border-t border-border-subtle pt-3"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          disabled={busy}
          className="flex-1 rounded-full border border-border-subtle bg-surface-0 px-4 py-2.5 text-[14px] outline-none focus:border-navy-hi disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          aria-label="Send"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-inverse text-text-inverse transition-transform disabled:opacity-40 enabled:hover:scale-105"
        >
          {busy ? <Spinner /> : <IconSend width={16} height={16} />}
        </button>
      </form>
    </div>
  );
}
