import { NotificationBell } from "@/components/NotificationBell";
import { PresenceRoster } from "@/components/PresenceRoster";

export function Sidebar() {
  return (
    <aside
      className="hidden h-full w-64 shrink-0 flex-col border-r border-[var(--border)] bg-[var(--surface)] md:flex"
      aria-label="War room sidebar"
    >
      <div className="flex items-start justify-between gap-3 border-b border-[var(--border)] px-4 py-4">
        <div className="min-w-0">
          <p className="font-display text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--primary)]">
            AI War Room
          </p>
          <h2 className="mt-1 font-display text-lg font-semibold tracking-tight text-[var(--foreground)]">
            Presence
          </h2>
        </div>
        <NotificationBell />
      </div>

      <section className="flex-1 space-y-6 overflow-y-auto px-4 py-4">
        <div>
          <h3 className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
            Active Agents
          </h3>
          <ul className="space-y-2">
            {["Scout", "Analyst", "Sentinel"].map((name) => (
              <li
                key={name}
                className="rounded-lg border border-[var(--border)] bg-[color-mix(in_oklab,var(--background)_55%,transparent)] px-3 py-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-[var(--foreground)]">
                    {name}
                  </span>
                  <span className="size-2 rounded-full bg-[var(--primary)]" />
                </div>
                <p className="mt-1 font-mono text-[10px] text-[var(--muted)]">
                  agent cell · offline mock
                </p>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
            Human Operators
          </h3>
          <PresenceRoster />
        </div>
      </section>
    </aside>
  );
}
