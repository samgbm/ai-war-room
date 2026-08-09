import { ThemeSwitcher } from "@/components/theme-switcher";

export function MainCanvas() {
  return (
    <main className="flex h-full min-w-0 flex-1 flex-col bg-[var(--background)]">
      <header className="flex items-center justify-between gap-3 border-b border-[var(--border)] bg-[color-mix(in_oklab,var(--surface)_85%,transparent)] px-4 py-3 backdrop-blur-md sm:px-6">
        <div className="min-w-0">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
            Mission surface
          </p>
          <h1 className="truncate font-display text-xl font-semibold tracking-tight text-[var(--foreground)] sm:text-2xl">
            The AI War Room
          </h1>
        </div>
        <ThemeSwitcher />
      </header>

      <section className="flex min-h-0 flex-1 flex-col px-4 py-4 sm:px-6">
        <div className="flex min-h-0 flex-1 flex-col rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-panel)]">
          <div className="border-b border-[var(--border)] px-4 py-3">
            <h2 className="font-display text-sm font-semibold text-[var(--foreground)]">
              Mission Log / Chat
            </h2>
            <p className="mt-0.5 font-mono text-xs text-[var(--muted)]">
              Portal channel stream placeholder
            </p>
          </div>
          <div className="flex flex-1 items-center justify-center px-6 py-10">
            <div className="max-w-md text-center">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--primary)]">
                awaiting uplink
              </p>
              <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
                Live AI streaming and operator chat will land here. Theme tokens
                already drive borders, surfaces, and accents across this split
                pane.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
