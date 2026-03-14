import { Navigate, Route, Routes } from "react-router-dom";
import StudioDashboard from './features/studio/StudioDashboard'
import FeedView from './features/feed/FeedView'
import { LiveSessionView } from "./features/studio/LiveSessionView";
import { SessionLauncher } from "./features/studio/SessionLauncher";
import { SessionComplete } from "./features/studio/SessionComplete";
import { useStudioStore } from "./stores/useStudioStore";

function SessionPage() {
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

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/studio" replace />} />
      <Route path="/studio" element={<StudioDashboard />} />
      <Route path="/feed" element={<FeedView />} />
      <Route path="/session" element={<SessionPage />} />
      <Route path="/session/complete" element={<SessionComplete />} />
    </Routes>
  );
}
