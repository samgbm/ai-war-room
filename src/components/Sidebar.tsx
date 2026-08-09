export function Sidebar() {
  return (
    <aside
      className="hidden h-full w-64 shrink-0 flex-col border-r border-[var(--border)] bg-[var(--surface)] md:flex"
      aria-label="War room sidebar"
    >
      <div className="border-b border-[var(--border)] px-4 py-4">
        <p className="font-display text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--primary)]">
          AI War Room
        </p>
        <h2 className="mt-1 font-display text-lg font-semibold tracking-tight text-[var(--foreground)]">
          Presence
        </h2>
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
                  <span className="size-2 rounded-full bg-[var(--success)]" />
                </div>
                <p className="mt-1 font-mono text-[10px] text-[var(--muted)]">
                  standby · portal roster soon
                </p>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
            Human Operators
          </h3>
          <ul className="space-y-2">
            {["Op-Lead", "Watch Desk"].map((name) => (
              <li
                key={name}
                className="rounded-lg border border-dashed border-[var(--border)] px-3 py-2"
              >
                <span className="text-sm font-medium text-[var(--foreground)]">
                  {name}
                </span>
                <p className="mt-1 font-mono text-[10px] text-[var(--muted)]">
                  awaiting presence feed
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </aside>
  );
}
