import { useMemo, useState } from "react";
import { api } from "../../api/client";
import { useStudioStore } from "../../stores/useStudioStore";
import type { TrackRecord } from "../../types/studio";

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const remaining = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${remaining}`;
}

export function SessionComplete() {
  const { session_artist: artist, current_track, fan_influences, setCurrentTrack } = useStudioStore();
  const [isPublishing, setIsPublishing] = useState(false);
  const [previewAudio, setPreviewAudio] = useState<HTMLAudioElement | null>(null);

  const aggregated = useMemo(() => {
    const counts = new Map<string, number>();
    for (const influence of fan_influences) {
      counts.set(influence.tag, (counts.get(influence.tag) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [fan_influences]);

  if (!current_track) {
    return (
      <div className="glass-panel mx-auto flex max-w-xl flex-col items-center rounded-[2rem] px-8 py-12 text-center">
        <div className="mb-4 h-16 w-16 animate-pulse rounded-full bg-gradient-to-br from-cyan-300 to-purple-500" />
        <h2 className="mb-2 text-2xl font-semibold text-white">Generating final track</h2>
        <p className="text-white/60">Lyria is consolidating the live session into a final mix.</p>
      </div>
    );
  }

  const handlePreview = () => {
    if (previewAudio) {
      previewAudio.pause();
      setPreviewAudio(null);
      return;
    }
    const audio = new Audio(current_track.audio_url);
    void audio.play();
    audio.addEventListener("ended", () => setPreviewAudio(null), { once: true });
    setPreviewAudio(audio);
  };

  const publish = async (status: "draft" | "published") => {
    setIsPublishing(true);
    try {
      const track = await api<TrackRecord>("/clips", {
        method: "POST",
        body: JSON.stringify({
          track_id: current_track.track_id,
          artist_id: artist.artist_id,
          status,
        }),
      });
      setCurrentTrack(track);
    } finally {
      setIsPublishing(false);
    }
  };

  const waveform = Array.from({ length: 42 }, (_, index) => {
    const angle = (index / 42) * Math.PI * 2;
    return 0.2 + Math.abs(Math.sin(angle)) * 0.8;
  });

  return (
    <div className="glass-panel mx-auto w-full max-w-2xl rounded-[2.2rem] p-8 text-white">
      <div className="mb-6 flex justify-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-cyan-300 to-purple-500 shadow-[0_0_30px_rgba(0,240,255,0.4)]">
          ✓
        </div>
      </div>
      <h2 className="mb-2 text-center text-3xl font-semibold">Session Complete</h2>
      <p className="mb-8 text-center text-white/60">
        Final track generated for {artist.name}.
      </p>

      {current_track.avatar_url ? (
        <div className="mb-6 flex items-center gap-4 rounded-[1.6rem] border border-white/10 bg-black/25 p-4">
          <img
            src={current_track.avatar_url}
            alt="Session avatar"
            className="h-20 w-20 rounded-[1.2rem] object-cover"
          />
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-white/45">
              {current_track.generation_target ?? "suno"} package
            </div>
            <p className="mt-2 text-sm text-white/72">
              Prompt, live backing track, vocal rough and avatar are bundled for the final song generation flow.
            </p>
          </div>
        </div>
      ) : null}

      <div className="mb-6 rounded-[1.75rem] border border-white/10 bg-black/25 p-5">
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={handlePreview}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-cyan-300 to-purple-500 text-black"
          >
            {previewAudio ? "❚❚" : "▶"}
          </button>
          <div className="text-right font-mono text-sm text-white/60">
            <div>{current_track.track_id.slice(0, 8)}</div>
            <div>{formatDuration(current_track.duration_seconds)}</div>
            <div>{new Date(current_track.created_at).toLocaleString()}</div>
          </div>
        </div>
        <div className="flex h-28 items-end gap-1">
          {waveform.map((value, index) => (
            <div
              key={index}
              className="flex-1 rounded-full bg-gradient-to-t from-cyan-300 to-purple-500"
              style={{ height: `${Math.max(8, value * 100)}%` }}
            />
          ))}
        </div>
      </div>

      {current_track.music_prompt ? (
        <div className="mb-6 rounded-[1.5rem] border border-[#9fffe0]/15 bg-[#9fffe0]/6 p-4">
          <div className="text-xs uppercase tracking-[0.2em] text-[#bffff0]">Music brief</div>
          <p className="mt-2 text-sm text-white/80">{current_track.music_prompt}</p>
          {current_track.performance_notes ? (
            <p className="mt-2 text-sm text-white/58">{current_track.performance_notes}</p>
          ) : null}
        </div>
      ) : null}

      {aggregated.length > 0 && (
        <div className="mb-6">
          <h3 className="mb-3 text-sm uppercase tracking-[0.2em] text-white/70">
            Fan Influences Applied
          </h3>
          <div className="flex flex-wrap gap-2">
            {aggregated.map(([tag, count]) => (
              <span
                key={tag}
                className="rounded-full border border-cyan-300/25 bg-white/[0.06] px-3 py-1 text-sm text-cyan-100"
              >
                {tag} {count > 1 ? `(${count})` : ""}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        <button
          type="button"
          disabled={isPublishing}
          onClick={() => void publish("published")}
          className="w-full rounded-2xl bg-gradient-to-r from-cyan-300 to-purple-500 px-5 py-4 font-semibold text-black disabled:opacity-60"
        >
          {isPublishing ? "Publishing..." : "Publish to Artist Space"}
        </button>
        <button
          type="button"
          disabled={isPublishing}
          onClick={() => void publish("draft")}
          className="w-full rounded-2xl border border-white/10 px-5 py-4 text-white/70 disabled:opacity-60"
        >
          Save as Draft
        </button>
      </div>
    </div>
  );
}
