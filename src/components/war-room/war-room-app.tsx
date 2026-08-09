"use client";

import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { useChannel } from "@portalsdk/react";
import {
  AGENTS,
  MOCK_MESSAGES,
  OBJECTIVES,
  OPS_STATS,
  WAR_ROOMS,
  displayNameFromId,
  type Agent,
  type MockMessage,
} from "@/lib/mock-data";
import { ThemeSwitcher } from "@/components/theme-switcher";

type ChatContent = {
  body: string;
  kind?: "operator" | "agent" | "system";
  agentName?: string;
};

type AgentRole = "scout" | "analyst" | "writer" | "fixer" | "sentinel";

function priorityClass(priority: string) {
  if (priority === "P0") return "text-[var(--danger)]";
  if (priority === "P1") return "text-[var(--warning)]";
  return "text-[var(--muted)]";
}

function statusDot(status: Agent["status"]) {
  switch (status) {
    case "running":
      return "bg-[var(--success)]";
    case "idle":
      return "bg-[var(--primary)]";
    case "blocked":
      return "bg-[var(--warning)]";
    default:
      return "bg-[var(--muted)]";
  }
}

export function WarRoomApp() {
  const [roomId, setRoomId] = useState(WAR_ROOMS[0].id);
  const room = WAR_ROOMS.find((r) => r.id === roomId) ?? WAR_ROOMS[0];
  const [draft, setDraft] = useState("");
  const [agentRole, setAgentRole] = useState<AgentRole>("analyst");
  const [agentBusy, setAgentBusy] = useState(false);
  const [agentError, setAgentError] = useState<string | null>(null);
  const [operatorName, setOperatorName] = useState("Operator");

  useEffect(() => {
    const existing = window.localStorage.getItem("awr-operator");
    if (existing) {
      setOperatorName(existing);
      return;
    }
    const generated = `Op-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    window.localStorage.setItem("awr-operator", generated);
    setOperatorName(generated);
  }, []);

  const {
    messages,
    send,
    presence,
    typing,
    sendTyping,
    status,
    me,
    setMetadata,
  } = useChannel<ChatContent>({
    channelId: room.channelId,
    history: 40,
    metadata: {
      displayName: operatorName,
      role: "operator",
      room: room.codename,
    },
  });

  useEffect(() => {
    if (operatorName === "Operator") return;
    setMetadata({
      displayName: operatorName,
      role: "operator",
      room: room.codename,
    });
  }, [operatorName, room.codename, setMetadata]);

  const seedMessages = useMemo(
    () => MOCK_MESSAGES.filter((m) => m.roomId === room.id),
    [room.id],
  );

  const liveEmpty = messages.length === 0;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const body = draft.trim();
    if (!body) return;
    setDraft("");
    setAgentError(null);
    try {
      await send({
        content: {
          body: `${operatorName}: ${body}`,
          kind: "operator",
        },
      });
    } catch (err) {
      setAgentError(err instanceof Error ? err.message : "Send failed");
    }
  }

  async function runAgent() {
    const prompt = draft.trim() || `Give a situational update for ${room.name}.`;
    setAgentBusy(true);
    setAgentError(null);
    try {
      const res = await fetch("/api/agents/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          role: agentRole,
          roomName: room.name,
        }),
      });
      const data = (await res.json()) as {
        reply?: string;
        agentName?: string;
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || "Agent request failed");
      }
      await send({
        content: {
          body: data.reply ?? "",
          kind: "agent",
          agentName: data.agentName ?? agentRole,
        },
      });
      setDraft("");
    } catch (err) {
      setAgentError(err instanceof Error ? err.message : "Agent failed");
    } finally {
      setAgentBusy(false);
    }
  }

  const onlineCount =
    presence?.kind === "detailed"
      ? presence.participants.length
      : presence?.kind === "aggregate"
        ? presence.count
        : 0;

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[color-mix(in_oklab,var(--background)_88%,transparent)] backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="min-w-0">
            <p className="font-display text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--primary)]">
              AI War Room
            </p>
            <h1 className="truncate font-display text-xl font-semibold tracking-tight text-[var(--foreground)] sm:text-2xl">
              {room.name}
              <span className="ml-2 text-sm font-medium text-[var(--muted)]">
                / {room.codename}
              </span>
            </h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <StatusPill status={status} online={onlineCount} me={me?.id} />
            <ThemeSwitcher />
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-[1600px] flex-1 gap-4 px-4 py-4 sm:px-6 lg:grid-cols-[240px_minmax(0,1fr)_280px] xl:grid-cols-[260px_minmax(0,1fr)_300px]">
        <aside className="flex flex-col gap-4 animate-fade">
          <Panel title="Mission desks">
            <ul className="space-y-1.5">
              {WAR_ROOMS.map((r) => {
                const active = r.id === room.id;
                return (
                  <li key={r.id}>
                    <button
                      type="button"
                      onClick={() => setRoomId(r.id)}
                      className={`w-full rounded-lg border px-3 py-2.5 text-left transition ${
                        active
                          ? "border-[var(--primary)] bg-[color-mix(in_oklab,var(--primary)_12%,transparent)]"
                          : "border-transparent hover:border-[var(--border)] hover:bg-[var(--surface)]"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-[var(--foreground)]">
                          {r.name}
                        </span>
                        <span
                          className={`font-mono text-[10px] font-bold ${priorityClass(r.priority)}`}
                        >
                          {r.priority}
                        </span>
                      </div>
                      <p className="mt-1 line-clamp-2 text-xs text-[var(--muted)]">
                        {r.summary}
                      </p>
                      <p className="mt-1 font-mono text-[10px] text-[var(--muted)]">
                        {r.updatedAt}
                      </p>
                    </button>
                  </li>
                );
              })}
            </ul>
          </Panel>

          <Panel title="Ops pulse">
            <div className="grid grid-cols-2 gap-2">
              {OPS_STATS.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-lg border border-[var(--border)] bg-[color-mix(in_oklab,var(--surface)_70%,transparent)] px-2.5 py-2"
                >
                  <p className="font-mono text-lg font-semibold text-[var(--foreground)]">
                    {stat.value}
                  </p>
                  <p className="text-[10px] uppercase tracking-wide text-[var(--muted)]">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </Panel>
        </aside>

        <main className="flex min-h-[32rem] flex-col rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-panel)] animate-rise">
          <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-[var(--foreground)]">
                Live channel
              </p>
              <p className="font-mono text-xs text-[var(--muted)]">
                {room.channelId}
              </p>
            </div>
            <p className="text-xs text-[var(--muted)]">
              You are{" "}
              <span className="font-medium text-[var(--foreground)]">
                {operatorName}
              </span>
            </p>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {liveEmpty &&
              seedMessages.map((m) => <SeedBubble key={m.id} message={m} />)}
            {messages.map((m) => {
              const kind = m.content.kind ?? "operator";
              const label =
                kind === "agent"
                  ? m.content.agentName ?? "Agent"
                  : kind === "system"
                    ? "System"
                    : displayNameFromId(m.sender?.id);
              return (
                <article
                  key={m.id}
                  className={`rounded-lg border px-3 py-2.5 ${
                    kind === "agent"
                      ? "border-[color-mix(in_oklab,var(--primary)_35%,var(--border))] bg-[color-mix(in_oklab,var(--primary)_8%,transparent)]"
                      : kind === "system"
                        ? "border-dashed border-[var(--border)] bg-transparent"
                        : "border-[var(--border)] bg-[color-mix(in_oklab,var(--background)_55%,transparent)]"
                  }`}
                >
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
                      {label}
                    </span>
                    <span className="font-mono text-[10px] text-[var(--muted)]">
                      {kind}
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--foreground)]">
                    {m.content.body}
                  </p>
                </article>
              );
            })}
          </div>

          {typing.length > 0 && (
            <p className="border-t border-[var(--border)] px-4 py-1.5 text-xs text-[var(--muted)]">
              {typing.join(", ")} typing…
            </p>
          )}

          <form
            onSubmit={onSubmit}
            className="border-t border-[var(--border)] p-3 sm:p-4"
          >
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <label className="text-xs text-[var(--muted)]" htmlFor="agent-role">
                AI agent
              </label>
              <select
                id="agent-role"
                value={agentRole}
                onChange={(e) => setAgentRole(e.target.value as AgentRole)}
                className="rounded-md border border-[var(--border)] bg-[var(--background)] px-2 py-1 text-xs text-[var(--foreground)]"
              >
                <option value="scout">Scout</option>
                <option value="analyst">Analyst</option>
                <option value="writer">Writer</option>
                <option value="fixer">Fixer</option>
                <option value="sentinel">Sentinel</option>
              </select>
              <button
                type="button"
                onClick={runAgent}
                disabled={agentBusy}
                className="rounded-md bg-[var(--primary)] px-3 py-1 text-xs font-semibold text-[var(--primary-foreground)] transition hover:opacity-90 disabled:opacity-50"
              >
                {agentBusy ? "Running…" : "Dispatch agent"}
              </button>
            </div>
            <div className="flex gap-2">
              <input
                value={draft}
                onChange={(e) => {
                  setDraft(e.target.value);
                  sendTyping();
                }}
                placeholder="Brief the room or task an agent…"
                className="min-w-0 flex-1 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none ring-[var(--primary)] placeholder:text-[var(--muted)] focus:ring-2"
              />
              <button
                type="submit"
                className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)]"
              >
                Send
              </button>
            </div>
            {agentError && (
              <p className="mt-2 text-xs text-[var(--danger)]">{agentError}</p>
            )}
          </form>
        </main>

        <aside className="flex flex-col gap-4 animate-fade">
          <Panel title="Presence">
            {presence?.kind === "detailed" ? (
              <ul className="space-y-2">
                {presence.participants.map((p) => {
                  const meta = p.metadata as
                    | { displayName?: string; role?: string }
                    | undefined;
                  return (
                    <li
                      key={p.id}
                      className="flex items-center justify-between gap-2 rounded-lg border border-[var(--border)] px-2.5 py-2"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-[var(--foreground)]">
                          {meta?.displayName ?? displayNameFromId(p.id)}
                        </p>
                        <p className="truncate text-[10px] text-[var(--muted)]">
                          {meta?.role ?? (p.anon ? "anonymous" : "member")}
                        </p>
                      </div>
                      <span className="size-2 shrink-0 rounded-full bg-[var(--success)]" />
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-sm text-[var(--muted)]">
                {onlineCount > 0
                  ? `${onlineCount} online`
                  : "Connecting presence…"}
              </p>
            )}
          </Panel>

          <Panel title="AI agents">
            <ul className="space-y-2">
              {AGENTS.map((agent) => (
                <li
                  key={agent.id}
                  className="rounded-lg border border-[var(--border)] px-2.5 py-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`size-2 rounded-full ${statusDot(agent.status)}`}
                      />
                      <span className="text-sm font-semibold text-[var(--foreground)]">
                        {agent.name}
                      </span>
                    </div>
                    <span className="font-mono text-[10px] uppercase text-[var(--muted)]">
                      {agent.status}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[var(--muted)]">{agent.focus}</p>
                  <p className="mt-1 font-mono text-[10px] text-[var(--muted)]">
                    {agent.role} · {agent.latencyMs}ms ·{" "}
                    {Math.round(agent.successRate * 100)}%
                  </p>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Objectives">
            <ul className="space-y-3">
              {OBJECTIVES.map((obj) => (
                <li key={obj.id}>
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <p className="text-xs font-medium text-[var(--foreground)]">
                      {obj.label}
                    </p>
                    <span className="font-mono text-[10px] text-[var(--muted)]">
                      {obj.progress}%
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-[color-mix(in_oklab,var(--foreground)_10%,transparent)]">
                    <div
                      className="h-full rounded-full bg-[var(--primary)] transition-all duration-700"
                      style={{ width: `${obj.progress}%` }}
                    />
                  </div>
                  <p className="mt-1 text-[10px] text-[var(--muted)]">
                    Owner: {obj.owner}
                  </p>
                </li>
              ))}
            </ul>
          </Panel>
        </aside>
      </div>
    </div>
  );
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 shadow-[var(--shadow-panel)]">
      <h2 className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
        {title}
      </h2>
      {children}
    </section>
  );
}

function SeedBubble({ message }: { message: MockMessage }) {
  return (
    <article className="rounded-lg border border-dashed border-[var(--border)] px-3 py-2.5 opacity-80">
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
          {message.sender}
        </span>
        <span className="font-mono text-[10px] text-[var(--muted)]">
          mock · {message.at}
        </span>
      </div>
      <p className="text-sm leading-relaxed text-[var(--foreground)]">
        {message.body}
      </p>
    </article>
  );
}

function StatusPill({
  status,
  online,
  me,
}: {
  status: string;
  online: number;
  me?: string;
}) {
  const live = status === "ready" || status === "connected";
  return (
    <div className="hidden items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1.5 sm:flex">
      <span
        className={`size-2 rounded-full ${live ? "bg-[var(--success)] animate-pulse-soft" : "bg-[var(--warning)]"}`}
      />
      <span className="font-mono text-[11px] text-[var(--foreground)]">
        {status}
      </span>
      <span className="text-[11px] text-[var(--muted)]">· {online} online</span>
      {me && (
        <span className="hidden font-mono text-[10px] text-[var(--muted)] lg:inline">
          · {me.slice(0, 10)}
        </span>
      )}
    </div>
  );
}
