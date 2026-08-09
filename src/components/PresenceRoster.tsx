"use client";

import { useChannel } from "@portalsdk/react";

type PresenceRosterProps = {
  roomId: string;
};

function displayName(participant: {
  id: string;
  username?: string;
}): string {
  return participant.username?.trim() || participant.id;
}

export function PresenceRoster({ roomId }: PresenceRosterProps) {
  const { presence } = useChannel({ channelId: roomId });

  if (presence === undefined) {
    return (
      <div
        className="space-y-2"
        aria-busy="true"
        aria-label="Connecting presence"
      >
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--muted)]">
          Connecting…
        </p>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2"
          >
            <span className="size-2 shrink-0 rounded-full bg-[var(--muted)]/40" />
            <span className="h-3 flex-1 animate-pulse rounded bg-[color-mix(in_oklab,var(--muted)_28%,transparent)]" />
          </div>
        ))}
      </div>
    );
  }

  if (presence.kind === "aggregate") {
    return (
      <div className="rounded-lg border border-[var(--border)] bg-[color-mix(in_oklab,var(--background)_55%,transparent)] px-3 py-3">
        <div className="flex items-center gap-2">
          <span className="size-2 shrink-0 rounded-full bg-[var(--success)] animate-pulse-soft" />
          <p className="font-mono text-sm font-semibold text-[var(--foreground)]">
            {presence.count} Users Online
          </p>
        </div>
        <p className="mt-1 text-[10px] text-[var(--muted)]">
          Aggregate presence mode — room at scale
        </p>
      </div>
    );
  }

  if (presence.kind === "detailed") {
    if (presence.participants.length === 0) {
      return (
        <p className="font-mono text-xs text-[var(--muted)]">
          No operators online yet.
        </p>
      );
    }

    return (
      <ul className="space-y-2" aria-label="Online operators">
        {presence.participants.map((p) => (
          <li
            key={p.id}
            className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[color-mix(in_oklab,var(--background)_55%,transparent)] px-3 py-2"
          >
            <span
              className="size-2 shrink-0 rounded-full bg-[var(--success)]"
              aria-label="online"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate font-mono text-xs font-medium text-[var(--foreground)]">
                {displayName(p)}
              </p>
              {p.anon ? (
                <p className="truncate text-[10px] text-[var(--muted)]">
                  anonymous
                </p>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    );
  }

  return null;
}
