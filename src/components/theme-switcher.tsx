"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import {
  THEME_META,
  THEME_OPTIONS,
  type ThemeOption,
} from "@/lib/themes";

function subscribe() {
  return () => {};
}

function ThemeSwitcherSkeleton() {
  return (
    <div
      className="inline-flex h-9 w-[8.5rem] items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3"
      aria-hidden
    >
      <span className="size-3.5 shrink-0 rounded-full bg-[var(--muted)]/40" />
      <span className="h-2.5 flex-1 rounded bg-[var(--muted)]/30" />
    </div>
  );
}

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!mounted) return <ThemeSwitcherSkeleton />;

  const current = (theme ?? "command") as ThemeOption;
  const meta = THEME_META[current] ?? THEME_META.command;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-9 w-[8.5rem] items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-sm font-medium text-[var(--foreground)] transition hover:border-[var(--primary)]"
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={`Theme: ${meta.label}`}
      >
        <span
          className="size-3.5 shrink-0 rounded-full border border-[var(--border)]"
          style={{ background: meta.swatch }}
        />
        <span className="truncate">{meta.label}</span>
      </button>

      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 cursor-default"
            aria-label="Close theme menu"
            onClick={() => setOpen(false)}
          />
          <div
            role="dialog"
            aria-label="Choose theme"
            className="absolute right-0 z-50 mt-2 max-h-[min(22rem,70vh)] w-[min(18rem,calc(100vw-1.5rem))] overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2 shadow-[var(--shadow-panel)] animate-rise"
          >
            <p className="mb-1.5 px-2 pt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
              11 themes + Auto
            </p>
            <div className="grid grid-cols-1 gap-0.5">
              {THEME_OPTIONS.map((name) => {
                const item = THEME_META[name];
                const active = current === name;
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => {
                      setTheme(name);
                      setOpen(false);
                    }}
                    className={`flex items-center gap-3 rounded-lg px-2 py-2 text-left transition ${
                      active
                        ? "bg-[color-mix(in_oklab,var(--primary)_16%,transparent)]"
                        : "hover:bg-[color-mix(in_oklab,var(--foreground)_6%,transparent)]"
                    }`}
                  >
                    <span
                      className="size-4 shrink-0 rounded-full border border-[var(--border)]"
                      style={{ background: item.swatch }}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-[var(--foreground)]">
                        {item.label}
                      </span>
                      <span className="block truncate text-xs text-[var(--muted)]">
                        {item.description}
                      </span>
                    </span>
                    {active && (
                      <span className="text-xs font-semibold text-[var(--primary)]">
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
