"use client";

import { useChannel } from "@portalsdk/react";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { WAR_ROOM_CHANNEL, WAR_ROOM_ID } from "@/lib/war-room";
import type { ChatMessage } from "@/components/ChatRoom";
import type { CursorPosition } from "@/components/LiveCursors";

const CURSOR_TYPE = "cursor";

type WarRoomPayload = ChatMessage | CursorPosition;
type WarRoomChannel = ReturnType<typeof useChannel<WarRoomPayload>>;

type WarRoomChannelValue = {
  roomId: string;
  messages: WarRoomChannel["messages"];
  send: WarRoomChannel["send"];
  loadPrevious: WarRoomChannel["loadPrevious"];
  hasPrevious: boolean;
  isLoadingPrevious: boolean;
  status: WarRoomChannel["status"];
  typing: readonly string[];
  sendTyping: () => void;
  presence: WarRoomChannel["presence"];
  me: WarRoomChannel["me"];
  setMetadata: (metadata: Record<string, unknown>) => void;
  remoteCursors: Record<string, CursorPosition>;
  publishCursor: (position: CursorPosition) => void;
};

const WarRoomChannelContext = createContext<WarRoomChannelValue | null>(null);

function isCursorPosition(value: unknown): value is CursorPosition {
  if (!value || typeof value !== "object") return false;
  const v = value as CursorPosition;
  return typeof v.x === "number" && typeof v.y === "number";
}

export function WarRoomChannelProvider({
  roomId = WAR_ROOM_ID,
  children,
}: {
  roomId?: string;
  children: ReactNode;
}) {
  const [remoteCursors, setRemoteCursors] = useState<
    Record<string, CursorPosition>
  >({});
  const meIdRef = useRef<string | undefined>(undefined);
  const lastMetaSend = useRef(0);

  const channel = useChannel<WarRoomPayload>({
    ...WAR_ROOM_CHANNEL,
    channelId: roomId,
    onMessage: (msg) => {
      const mine = meIdRef.current;
      if (mine && msg.sender.id === mine) return;
      if (msg.type !== CURSOR_TYPE && !msg.ephemeral) return;
      const content = msg.content;
      if (!isCursorPosition(content)) return;
      setRemoteCursors((current) => ({
        ...current,
        [msg.sender.id]: content,
      }));
    },
  });

  meIdRef.current = channel.me?.id;

  // Keep remotes in sync via presence metadata (ephemeral inbound is dropped by Portal SDK).
  useEffect(() => {
    const presence = channel.presence;
    const meId = channel.me?.id;
    if (presence?.kind !== "detailed") return;

    setRemoteCursors((current) => {
      const next = { ...current };
      for (const p of presence.participants) {
        if (meId && p.id === meId) {
          delete next[p.id];
          continue;
        }
        const cursor = p.metadata?.cursor;
        if (isCursorPosition(cursor)) {
          next[p.id] = cursor;
        }
      }
      return next;
    });
  }, [channel.presence, channel.me?.id]);

  const publishCursor = useMemo(() => {
    return (position: CursorPosition) => {
      const now = Date.now();

      // Presence metadata is the reliable fan-out path (ephemeral inbound is dropped).
      // Do not flood the channel with durable cursor messages — Portal rate-limits /
      // rejects them and those rejections were surfacing as unhandledRejection spam.
      if (now - lastMetaSend.current > 100) {
        lastMetaSend.current = now;
        channel.setMetadata({ cursor: position });
      }
    };
  }, [channel]);

  const value = useMemo<WarRoomChannelValue>(
    () => ({
      roomId,
      messages: channel.messages,
      send: channel.send,
      loadPrevious: channel.loadPrevious,
      hasPrevious: channel.hasPrevious,
      isLoadingPrevious: channel.isLoadingPrevious,
      status: channel.status,
      typing: channel.typing,
      sendTyping: channel.sendTyping,
      presence: channel.presence,
      me: channel.me,
      setMetadata: channel.setMetadata,
      remoteCursors,
      publishCursor,
    }),
    [roomId, channel, remoteCursors, publishCursor],
  );

  return (
    <WarRoomChannelContext.Provider value={value}>
      {children}
    </WarRoomChannelContext.Provider>
  );
}

export function useWarRoomChannel() {
  const ctx = useContext(WarRoomChannelContext);
  if (!ctx) {
    throw new Error("useWarRoomChannel must be used within WarRoomChannelProvider");
  }
  return ctx;
}
