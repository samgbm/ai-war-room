"use client";

import { useInbox } from "@portalsdk/react";
import { Bell } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type InboxItemData = {
  text?: string;
};

function notificationLabel(item: {
  title?: string;
  type: string;
  data: unknown;
}) {
  const title = item.title ?? item.type;
  const text = (item.data as InboxItemData | undefined)?.text;
  if (typeof text !== "string") return title;
  return `${title}: ${text.substring(0, 30)}...`;
}

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const { counter, items, markAllRead } = useInbox();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="relative inline-flex size-9 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] transition hover:border-[var(--primary)]"
        aria-label="Notifications"
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <Bell className="size-4" aria-hidden />
        {counter > 0 ? (
          <span
            data-testid="notification-badge"
            className="absolute -right-1.5 -top-1.5 inline-flex min-w-4 items-center justify-center rounded-full bg-red-600 px-1 py-0.5 font-mono text-[10px] font-semibold leading-none text-white"
          >
            {counter}
          </span>
        ) : null}
      </button>

      {isOpen ? (
        <div
          role="menu"
          aria-label="Notifications"
          className="absolute left-0 z-50 mt-2 w-[min(18rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-panel)] animate-rise"
        >
          <div className="flex items-center justify-between gap-2 border-b border-[var(--border)] px-3 py-2.5">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
              Inbox
            </p>
            <button
              type="button"
              onClick={() => markAllRead()}
              className="font-mono text-[11px] font-medium text-[var(--primary)] transition hover:opacity-80"
            >
              Mark all as read
            </button>
          </div>

          <ul className="max-h-64 overflow-y-auto py-1">
            {items.length === 0 ? (
              <li className="list-none px-3 py-6 text-center text-sm text-[var(--muted)]">
                No new notifications
              </li>
            ) : (
              items.map((item) => (
                <li key={item.id} className="list-none px-1">
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => item.markAsRead()}
                    className="flex w-full items-start gap-2 rounded-lg px-2.5 py-2 text-left transition hover:bg-[color-mix(in_oklab,var(--background)_70%,transparent)]"
                  >
                    {!item.read ? (
                      <span
                        className="mt-1.5 size-1.5 shrink-0 rounded-full bg-red-500"
                        aria-hidden
                      />
                    ) : (
                      <span className="mt-1.5 size-1.5 shrink-0" aria-hidden />
                    )}
                    <span className="min-w-0 text-sm text-[var(--foreground)]">
                      {notificationLabel(item)}
                    </span>
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
