"use client";

import {
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
  type ReactNode,
} from "react";
import { useWarRoomChannel } from "@/components/WarRoomChannelProvider";

export interface CursorPosition {
  x: number;
  y: number;
}

type LiveCursorsProps = {
  children?: ReactNode;
};

function cursorColor(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i += 1) {
    hash = (hash * 31 + userId.charCodeAt(i)) >>> 0;
  }
  const hue = hash % 360;
  return `hsl(${hue} 72% 58%)`;
}

export function LiveCursors({ children }: LiveCursorsProps) {
  const { remoteCursors, publishCursor, me } = useWarRoomChannel();
  const [localCursor, setLocalCursor] = useState<CursorPosition | null>(null);
  const surfaceRef = useRef<HTMLDivElement>(null);

  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    const surface = surfaceRef.current;
    if (!surface) return;
    const rect = surface.getBoundingClientRect();
    const position: CursorPosition = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };

    setLocalCursor(position);
    publishCursor(position);
  }

  return (
    <div
      ref={surfaceRef}
      className="relative flex h-full min-h-0 w-full flex-1 flex-col"
      onPointerMove={onPointerMove}
    >
      {children}

      <div
        className="pointer-events-none absolute inset-0 z-30 overflow-hidden"
        aria-hidden
      >
        {Object.entries(remoteCursors).map(([userId, position]) => {
          if (me?.id && userId === me.id) return null;
          return (
            <CursorMarker
              key={`remote-${userId}`}
              userId={userId}
              position={position}
            />
          );
        })}
        {localCursor ? (
          <CursorMarker userId="you" position={localCursor} isSelf />
        ) : null}
      </div>
    </div>
  );
}

function CursorMarker({
  userId,
  position,
  isSelf = false,
}: {
  userId: string;
  position: CursorPosition;
  isSelf?: boolean;
}) {
  const color = isSelf ? "var(--primary)" : cursorColor(userId);
  const style = {
    left: position.x,
    top: position.y,
    "--cursor-color": color,
  } as CSSProperties;

  return (
    <div
      data-testid={`cursor-${userId}`}
      data-x={Math.round(position.x)}
      data-y={Math.round(position.y)}
      className={`absolute z-30 -translate-x-0.5 -translate-y-0.5 transition-[left,top] duration-75 ease-out ${
        isSelf ? "opacity-70" : "opacity-100"
      }`}
      style={style}
    >
      <svg
        width="18"
        height="22"
        viewBox="0 0 18 22"
        fill="none"
        aria-hidden
        className="drop-shadow-sm"
      >
        <path
          d="M1 1L16.5 10.2L9.4 12.1L6.8 20.5L1 1Z"
          fill="var(--cursor-color)"
          stroke="var(--background)"
          strokeWidth="1.2"
        />
      </svg>
      <span className="mt-0.5 ml-3 inline-block max-w-[9rem] truncate rounded-md border border-[var(--border)] bg-[var(--surface)] px-1.5 py-0.5 font-mono text-[10px] font-medium text-[var(--foreground)] shadow-[var(--shadow-panel)]">
        {isSelf ? "you" : userId}
      </span>
    </div>
  );
}
