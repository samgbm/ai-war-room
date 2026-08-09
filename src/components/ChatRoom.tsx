"use client";

import { useChannel } from "@portalsdk/react";
import { useState, type FormEvent } from "react";

export interface ChatMessage {
  text: string;
}

type ChatRoomProps = {
  roomId: string;
};

function statusTone(status: string) {
  if (status === "ready") return "bg-[var(--success)]";
  if (status === "connecting" || status === "reconnecting") {
    return "bg-[var(--warning)]";
  }
  return "bg-[var(--muted)]";
}

export function ChatRoom({ roomId }: ChatRoomProps) {
  const [draft, setDraft] = useState("");
  const {
    messages,
    send,
    loadPrevious,
    hasPrevious,
    isLoadingPrevious,
    status,
  } = useChannel<ChatMessage>({ channelId: roomId, history: 50 });

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    await send({ content: { text } });
    setDraft("");
  }

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <header className="flex items-center justify-between gap-3 border-b border-[var(--border)] px-4 py-3">
        <div className="min-w-0">
          <h2 className="font-display text-sm font-semibold text-[var(--foreground)]">
            Mission Log / Chat
          </h2>
          <p className="mt-0.5 truncate font-mono text-xs text-[var(--muted)]">
            {roomId}
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--background)] px-2.5 py-1.5">
          <span
            className={`size-2 shrink-0 rounded-full ${statusTone(status)} ${
              status === "ready" ? "animate-pulse-soft" : ""
            }`}
            aria-hidden
          />
          <span className="font-mono text-[11px] text-[var(--foreground)]">
            {status}
          </span>
        </div>
      </header>

      <div className="border-b border-[var(--border)] px-4 py-2">
        <button
          type="button"
          onClick={() => loadPrevious()}
          disabled={!hasPrevious || isLoadingPrevious}
          className="rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 font-mono text-xs font-medium text-[var(--foreground)] transition hover:border-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isLoadingPrevious ? "Loading…" : "Load Older"}
        </button>
      </div>

      <ul className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <li className="m-auto max-w-sm list-none text-center">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--primary)]">
              channel quiet
            </p>
            <p className="mt-2 text-sm text-[var(--muted)]">
              No messages yet. Send the first transmission below.
            </p>
          </li>
        ) : (
          messages.map((m) => (
            <li
              key={m.id}
              className="list-none rounded-lg border border-[var(--border)] bg-[color-mix(in_oklab,var(--background)_55%,transparent)] px-3 py-2.5"
            >
              <p className="font-mono text-[10px] font-semibold uppercase tracking-wide text-[var(--primary)]">
                {m.sender.id}
              </p>
              <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-[var(--foreground)]">
                {m.content.text}
              </p>
            </li>
          ))
        )}
      </ul>

      <form
        onSubmit={onSubmit}
        className="flex gap-2 border-t border-[var(--border)] p-3 sm:p-4"
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Transmit to the war room…"
          aria-label="Chat message"
          className="min-w-0 flex-1 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none ring-[var(--primary)] placeholder:text-[var(--muted)] focus:ring-2"
        />
        <button
          type="submit"
          className="rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-[var(--primary-foreground)] transition hover:opacity-90"
        >
          Send
        </button>
      </form>
    </div>
  );
}
