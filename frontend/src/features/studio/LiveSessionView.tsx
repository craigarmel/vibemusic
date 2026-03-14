import { useEffect, useRef, useState } from "react";
import { api } from "../../api/client";
import { useLyriaStream } from "../../hooks/useLyriaStream";
import { useStudioStore } from "../../stores/useStudioStore";
import type { TrackRecord } from "../../types/studio";
import { AudioVisualizer } from "./AudioVisualizer";
import { SessionComplete } from "./SessionComplete";
import { SessionControls } from "./SessionControls";

export function LiveSessionView() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);
  const {
    session_id,
    camera_stream,
    session_artist: artist,
    music_prompt,
    performance_notes,
    fan_influences,
    setCurrentTrack,
    current_track,
    endSession,
  } = useStudioStore();

  const { analyser, sendParams, sendPlaybackControl, startRecording, stopRecording } = useLyriaStream(
    session_id,
    camera_stream,
    (influence) => useStudioStore.getState().addFanInfluence(influence),
  );

  // Attach camera stream to video element
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !camera_stream) return;

    video.srcObject = camera_stream;
    video.muted = true;
    video.playsInline = true;
    video.play().catch(() => {});

    return () => {
      video.srcObject = null;
    };
  }, [camera_stream]);

  const finishSession = async () => {
    if (!session_id) return;

    const confirmed = window.confirm("End the session and generate the final track?");
    if (!confirmed) return;

    setIsCompleting(true);
    sendPlaybackControl("STOP");
    try {
      const track = await api<TrackRecord>(`/sessions/${session_id}/complete`, {
        method: "POST",
        body: JSON.stringify({
          artist_id: artist.artist_id,
          influences: fan_influences.map((item) => item.tag),
          music_prompt,
          performance_notes,
        }),
      });
      setCurrentTrack(track);
      camera_stream?.getTracks().forEach((t) => t.stop());
      endSession();
    } finally {
      setIsCompleting(false);
    }
  };

  if (current_track || isCompleting) {
    return (
      <section className="flex min-h-screen items-center justify-center px-6 py-12 bg-bg-dark">
        <SessionComplete />
      </section>
    );
  }

  return (
    <section className="relative min-h-screen overflow-hidden bg-black">
      {/* Camera feed — full screen background */}
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover [transform:scaleX(-1)]"
      />

      {/* Dark overlay on camera */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/70" />

      {/* Artist name + prompt overlay */}
      <div className="absolute top-20 left-0 right-0 flex flex-col items-center z-10">
        <div className="flex items-center gap-3 mb-3">
          {artist.avatar_url && (
            <img
              src={artist.avatar_url}
              alt={artist.name}
              className="w-10 h-10 rounded-full object-cover border border-neon-cyan/40"
            />
          )}
          <div>
            <h2 className="text-lg font-bold text-white">{artist.name}</h2>
            <div className="text-[10px] uppercase tracking-[0.3em] text-neon-cyan">
              Live Session
            </div>
          </div>
        </div>
      </div>

      {/* Audio visualizer — bottom */}
      <AudioVisualizer analyser={analyser} />

      {/* Session controls overlay */}
      <SessionControls
        onEndSession={() => void finishSession()}
        onParamChange={sendParams}
        onStartRecording={startRecording}
        onStopRecording={stopRecording}
      />
    </section>
  );
}
