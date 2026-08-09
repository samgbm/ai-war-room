import { ErrorBoundary } from "@/components/ErrorBoundary";
import { MainCanvas } from "@/components/MainCanvas";
import { Sidebar } from "@/components/Sidebar";
import { WarRoomChannelProvider } from "@/components/WarRoomChannelProvider";
import { WAR_ROOM_ID } from "@/lib/war-room";

export default function Home() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-[var(--background)] text-[var(--foreground)]">
      <ErrorBoundary>
        <WarRoomChannelProvider roomId={WAR_ROOM_ID}>
          <div className="flex h-full w-full min-h-0">
            <Sidebar />
            <MainCanvas />
          </div>
        </WarRoomChannelProvider>
      </ErrorBoundary>
    </div>
  );
}
