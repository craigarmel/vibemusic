import { Navigate, Route, Routes } from "react-router-dom";
import { LiveSessionView } from "./features/studio/LiveSessionView";
import { SessionLauncher } from "./features/studio/SessionLauncher";
import { useStudioStore } from "./stores/useStudioStore";

function StudioPage() {
  const { is_session_active, session_id, current_track } = useStudioStore();

  return (
    <main className="min-h-screen px-6 py-6 text-white">
      {is_session_active || session_id || current_track ? (
        <LiveSessionView />
      ) : (
        <div className="mx-auto max-w-6xl">
          <SessionLauncher />
        </div>
      )}
    </main>
  );
}

function FeedPlaceholder() {
  return (
    <main className="flex min-h-screen items-center justify-center text-white/70">
      Feed coming next.
    </main>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/studio" replace />} />
      <Route path="/studio" element={<StudioPage />} />
      <Route path="/feed" element={<FeedPlaceholder />} />
    </Routes>
  );
}
