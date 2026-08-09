"use client";

import { useChannel } from "@portalsdk/react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useWarRoomChannel } from "@/components/WarRoomChannelProvider";
import { WAR_ROOM_CHANNEL } from "@/lib/war-room";

export interface ChatMessage {
  text: string;
}

type AgentStreamContent = {
  streamId?: string;
  chunk?: string;
  text?: string;
};

type AgentStreamState = {
  id: string;
  text: string;
};

type AgentStatusSnapshot = {
  status: string;
};

function statusTone(status: string) {
  if (status === "ready") return "bg-[var(--success)]";
  if (status === "connecting" || status === "reconnecting") {
    return "bg-[var(--warning)]";
  }
  return "bg-[var(--muted)]";
}

function isChatContent(content: unknown): content is ChatMessage {
  return (
    !!content &&
    typeof content === "object" &&
    typeof (content as ChatMessage).text === "string"
  );
}

function isAgentStreamContent(content: unknown): content is AgentStreamContent {
  return !!content && typeof content === "object";
}

function isAgentStatusContent(
  content: unknown,
): content is AgentStatusSnapshot {
  return (
    !!content &&
    typeof content === "object" &&
    typeof (content as { status?: unknown }).status === "string"
  );
}

export function ChatRoom() {
  const [draft, setDraft] = useState("");
  const [agentStream, setAgentStream] = useState<AgentStreamState | null>(null);
  const [liveAgentStatus, setLiveAgentStatus] = useState<string | null>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const stickToBottom = useRef(true);
  /** Prevents presence/metadata from re-opening a stream after the final reply lands. */
  const completedStreamIds = useRef(new Set<string>());

  const {
    roomId,
    messages,
    send,
    loadPrevious,
    hasPrevious,
    isLoadingPrevious,
    status,
    typing,
    sendTyping,
    presence,
  } = useWarRoomChannel();

  // Dedicated listener for live agent token stream + extension status (same channel).
  const { ext } = useChannel({
    ...WAR_ROOM_CHANNEL,
    channelId: roomId,
    onMessage: (msg) => {
      if (msg.type === "agent.status" && isAgentStatusContent(msg.content)) {
        setLiveAgentStatus(msg.content.status);
        return;
      }

      if (msg.type === "agent-stream" && isAgentStreamContent(msg.content)) {
        const streamId = msg.content.streamId;
        if (!streamId || completedStreamIds.current.has(streamId)) return;

        // Preferred: full assembled text from durable stream flushes.
        if (typeof msg.content.text === "string" && msg.content.text.length > 0) {
          setAgentStream({ id: streamId, text: msg.content.text });
          return;
        }

        // Fallback: append ephemeral token chunks (if the SDK delivers them).
        if (msg.ephemeral && typeof msg.content.chunk === "string") {
          const chunk = msg.content.chunk;
          setAgentStream((current) => {
            if (current?.id === streamId) {
              return { id: streamId, text: current.text + chunk };
            }
            return { id: streamId, text: chunk };
          });
        }
        return;
      }

      if (
        !msg.ephemeral &&
        msg.type !== "cursor" &&
        msg.type !== "agent-stream" &&
        msg.type !== "agent.status" &&
        isChatContent(msg.content)
      ) {
        const finalText = msg.content.text.trim();
        setAgentStream((current) => {
          if (!current) return null;
          // Final agent reply replaces the live bubble (avoid duplicate boxes).
          if (finalText === current.text.trim()) {
            completedStreamIds.current.add(current.id);
            return null;
          }
          return current;
        });
      }
    },
  });

  const agentSnapshot = ext?.["agentState"] as AgentStatusSnapshot | undefined;
  const agentStatus =
    liveAgentStatus ?? agentSnapshot?.status ?? "Standing by";
  const agentBusy = agentStatus !== "Standing by";

  // Presence fallback if stream messages are delayed — also clears when metadata drops.
  useEffect(() => {
    if (presence?.kind !== "detailed") return;

    let found: AgentStreamState | null = null;
    for (const p of presence.participants) {
      const stream = p.metadata?.agentStream as
        | { streamId?: string; text?: string }
        | undefined;
      if (!stream?.streamId || typeof stream.text !== "string") continue;
      if (completedStreamIds.current.has(stream.streamId)) continue;
      found = { id: stream.streamId, text: stream.text };
      break;
    }

    if (found) {
      setAgentStream(found);
      return;
    }

    // Metadata cleared after the final reply — drop the streaming bubble.
    setAgentStream((current) => {
      if (!current) return null;
      if (completedStreamIds.current.has(current.id)) return null;
      // Keep message-driven streams alive until the final reply marks them complete.
      return current;
    });
  }, [presence]);

  const chatMessages = messages.filter(
    (m) =>
      !m.ephemeral &&
      m.type !== "cursor" &&
      m.type !== "agent-stream" &&
      m.type !== "agent.status" &&
      isChatContent(m.content),
  );

  // Hide the streaming bubble once the same answer is already in the log.
  const committedStream =
    !!agentStream &&
    chatMessages.some(
      (m) =>
        isChatContent(m.content) &&
        m.content.text.trim() === agentStream.text.trim(),
    );
  const visibleAgentStream = committedStream ? null : agentStream;

  useEffect(() => {
    if (!committedStream || !agentStream) return;
    completedStreamIds.current.add(agentStream.id);
    setAgentStream(null);
  }, [committedStream, agentStream]);

  useEffect(() => {
    const el = listRef.current;
    if (!el || !stickToBottom.current) return;
    el.scrollTop = el.scrollHeight;
  }, [chatMessages.length, typing.length, visibleAgentStream?.text]);

  function onScroll() {
    const el = listRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    stickToBottom.current = distanceFromBottom < 80;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    stickToBottom.current = true;
    await send({ content: { text } });
    setDraft("");
  }

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <div
        data-testid="agent-status-bar"
        className={`flex items-center gap-2 border-b border-[var(--border)] px-4 py-2 ${
          agentBusy
            ? "bg-[color-mix(in_oklab,var(--primary)_14%,transparent)]"
            : "bg-[color-mix(in_oklab,var(--background)_70%,transparent)]"
        }`}
        aria-live="polite"
      >
        <span
          className={`size-2 shrink-0 rounded-full ${
            agentBusy
              ? "animate-pulse bg-[var(--primary)]"
              : "bg-[var(--muted)]"
          }`}
          aria-hidden
        />
        <p className="font-mono text-[11px] font-medium tracking-wide text-[var(--foreground)]">
          <span className="text-[var(--muted)]">Agent Status:</span>{" "}
          <span className={agentBusy ? "animate-pulse" : ""}>{agentStatus}</span>
        </p>
      </div>

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

      <ul
        ref={listRef}
        onScroll={onScroll}
        className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-4 py-4"
      >
        {chatMessages.length === 0 && !visibleAgentStream ? (
          <li className="m-auto max-w-sm list-none text-center">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--primary)]">
              channel quiet
            </p>
            <p className="mt-2 text-sm text-[var(--muted)]">
              No messages yet. Send the first transmission below.
            </p>
          </li>
        ) : (
          chatMessages.map((m) => (
            <li
              key={m.id}
              className="list-none rounded-lg border border-[var(--border)] bg-[color-mix(in_oklab,var(--background)_55%,transparent)] px-3 py-2.5"
            >
              <p className="font-mono text-[10px] font-semibold uppercase tracking-wide text-[var(--primary)]">
                {m.sender.id}
              </p>
              <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-[var(--foreground)]">
                {isChatContent(m.content) ? m.content.text : ""}
              </p>
            </li>
          ))
        )}

        {visibleAgentStream ? (
          <li
            data-testid="agent-stream"
            className="list-none rounded-lg border border-dashed border-[var(--primary)] bg-[color-mix(in_oklab,var(--primary)_10%,transparent)] px-3 py-2.5"
          >
            <p className="font-mono text-[10px] font-semibold uppercase tracking-wide text-[var(--primary)]">
              Agent · streaming
            </p>
            <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-[var(--foreground)]">
              {visibleAgentStream.text}
              <span className="ml-0.5 inline-block h-4 w-1 animate-pulse bg-[var(--primary)] align-middle" />
            </p>
          </li>
        ) : null}
      </ul>

      {typing.length > 0 ? (
        <p
          className="animate-pulse border-t border-[var(--border)] px-4 pt-2 font-mono text-sm text-[var(--muted)]"
          aria-live="polite"
        >
          {typing.join(", ")} is typing...
        </p>
      ) : null}

      <form
        onSubmit={onSubmit}
        className={`flex gap-2 p-3 sm:p-4 ${
          typing.length > 0 ? "" : "border-t border-[var(--border)]"
        }`}
      >
        <input
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            sendTyping();
          }}
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
