import { ErrorBoundary } from "@/components/ErrorBoundary";
import { MainCanvas } from "@/components/MainCanvas";
import { Sidebar } from "@/components/Sidebar";

export default function Home() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-[var(--background)] text-[var(--foreground)]">
      <ErrorBoundary>
        <div className="flex h-full w-full min-h-0">
          <Sidebar />
          <MainCanvas />
        </div>
      </ErrorBoundary>
    </div>
  );
}
