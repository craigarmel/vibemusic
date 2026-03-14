import { api } from "../../api/client";
import { useCamera } from "../../hooks/useCamera";
import { useStudioStore } from "../../stores/useStudioStore";
import type { SessionRecord } from "../../types/studio";

export function SessionLauncher() {
  const { artist, startSession, setSessionError, session_error } = useStudioStore();
  const { requestStream, isRequesting } = useCamera();

  const handleLaunch = async () => {
    try {
      const stream = await requestStream();
      const session = await api<SessionRecord>("/sessions", {
        method: "POST",
        body: JSON.stringify({ artist_id: artist.artist_id }),
      });
      startSession(session, stream);
    } catch (error) {
      setSessionError(
        error instanceof Error
          ? error.message
          : "Camera and microphone access are required to start a live session.",
      );
    }
  };

  return (
    <div className="glass-panel rounded-[2rem] p-8">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-2 text-sm uppercase tracking-[0.28em] text-cyan-300">Artist profile</div>
          <h1 className="text-4xl font-semibold text-white">{artist.name}</h1>
          <p className="mt-3 max-w-2xl text-white/65">{artist.biography}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {artist.genre_tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-cyan-300/25 bg-cyan-300/8 px-3 py-1 text-sm text-cyan-100"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
        <div className="flex h-40 w-40 items-center justify-center rounded-full border border-cyan-300/35 bg-gradient-to-br from-cyan-300/15 to-purple-500/15 text-sm uppercase tracking-[0.3em] text-white/80 shadow-[0_0_28px_rgba(0,240,255,0.25)]">
          avatar
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          ["Sessions", "0"],
          ["Tracks", "0"],
          ["Fan influences", "0"],
        ].map(([label, value]) => (
          <div key={label} className="rounded-[1.4rem] border border-white/8 bg-white/5 p-5">
            <div className="text-sm uppercase tracking-[0.18em] text-white/45">{label}</div>
            <div className="mt-2 text-3xl font-semibold text-cyan-300">{value}</div>
          </div>
        ))}
      </div>

      <div className="mt-10 flex flex-col items-start gap-4">
        <button
          type="button"
          onClick={() => void handleLaunch()}
          disabled={isRequesting}
          className="rounded-full bg-gradient-to-r from-cyan-300 via-cyan-400 to-purple-500 px-8 py-4 text-sm font-semibold uppercase tracking-[0.22em] text-black shadow-[0_0_30px_rgba(0,240,255,0.32)] disabled:opacity-60"
        >
          {isRequesting ? "Requesting access..." : "Start New Session"}
        </button>
        {session_error ? <p className="text-sm text-pink-200">{session_error}</p> : null}
      </div>
    </div>
  );
}
