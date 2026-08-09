import { ChatRoom } from "@/components/ChatRoom";
import { LiveCursors } from "@/components/LiveCursors";
import { ThemeSwitcher } from "@/components/theme-switcher";

export function MainCanvas() {
  return (
    <main className="flex h-full min-w-0 flex-1 flex-col bg-[var(--background)]">
      <LiveCursors>
        <header className="relative z-10 flex items-center justify-between gap-3 border-b border-[var(--border)] bg-[color-mix(in_oklab,var(--surface)_85%,transparent)] px-4 py-3 backdrop-blur-md sm:px-6">
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

        <section className="relative z-10 flex min-h-0 flex-1 flex-col px-4 py-4 sm:px-6">
          <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-panel)]">
            <ChatRoom />
          </div>
        </section>
      </LiveCursors>
    </main>
  );
}
