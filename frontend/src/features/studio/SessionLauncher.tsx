import { useState } from "react";
import { api } from "../../api/client";
import { useStudioStore } from "../../stores/useStudioStore";
import type { SessionRecord } from "../../types/studio";

const QUICK_PROMPTS = [
  "Afro house solaire avec drop vocal",
  "Drill romantique pour topline yaourt",
  "Hyperpop triste avec grosse basse",
  "Techno sombre et mélancolique",
  "Lo-fi ambient nocturne",
  "Jersey club cinematic pour hook viral",
];

export function SessionLauncher() {
  const {
    session_artist: artist,
    music_prompt,
    startSession,
    setMusicPrompt,
    setSessionError,
    setCurrentTrack,
    session_error,
  } = useStudioStore();
  const [isLaunching, setIsLaunching] = useState(false);

  const handleLaunch = async () => {
    if (!music_prompt.trim()) {
      setSessionError("Ajoute un prompt musical avant de lancer la session.");
      return;
    }

    setIsLaunching(true);
    setSessionError(null);
    setCurrentTrack(null); // Reset previous session track

    try {
      // Request camera + mic for live session display and Lyria audio capture
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });

      const session = await api<SessionRecord>("/sessions", {
        method: "POST",
        body: JSON.stringify({
          artist_id: artist.artist_id,
          music_prompt,
        }),
      });
      startSession(session, stream);
    } catch (error) {
      setSessionError(
        error instanceof Error
          ? error.message
          : "Microphone access is required to start a live session."
      );
    } finally {
      setIsLaunching(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-dark flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="text-xs uppercase tracking-[0.3em] text-neon-cyan mb-3">
            Live Session
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">
            Create with {artist.name}
          </h1>
          <p className="text-text-muted text-sm max-w-md mx-auto">
            Describe the sound you want. Lyria RealTime will generate music
            live based on your prompt.
          </p>
        </div>

        {/* Music prompt */}
        <div className="glass rounded-2xl p-6 mb-6">
          <div className="text-xs uppercase tracking-widest text-text-muted mb-3">
            Music Prompt
          </div>
          <textarea
            value={music_prompt}
            onChange={(e) => setMusicPrompt(e.target.value)}
            rows={3}
            placeholder="Ex: techno mélancolique avec nappes aériennes et basses profondes..."
            className="w-full resize-none rounded-xl border border-border-subtle bg-white/5 px-4 py-3 text-white text-sm outline-none placeholder:text-white/30 focus:border-neon-cyan/40 transition-colors"
          />

          {/* Quick presets */}
          <div className="mt-4 flex flex-wrap gap-2">
            {QUICK_PROMPTS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setMusicPrompt(preset)}
                className={`rounded-full px-3 py-1.5 text-xs transition-all ${
                  music_prompt === preset
                    ? "bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30"
                    : "border border-white/10 text-text-muted hover:text-white hover:border-white/20"
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Launch button */}
        <button
          type="button"
          onClick={() => void handleLaunch()}
          disabled={isLaunching || !music_prompt.trim()}
          className="w-full btn-primary py-4 text-sm uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
        >
          {isLaunching ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Opening devices...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              Start Live Session
            </>
          )}
        </button>

        {/* Error */}
        {session_error && (
          <p className="mt-4 text-center text-sm text-neon-magenta">
            {session_error}
          </p>
        )}

        {/* Info */}
        <p className="mt-6 text-center text-xs text-text-muted/60">
          Microphone access will be requested to capture your ambiance.
          <br />
          Lyria generates music that reacts to your environment in real-time.
        </p>
      </div>
    </div>
  );
}
