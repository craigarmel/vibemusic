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
  const [isVideoReady, setIsVideoReady] = useState(false);
  const {
    session_id,
    camera_stream,
    artist,
    addFanInfluence,
    fan_influences,
    setCurrentTrack,
    current_track,
    endSession,
  } = useStudioStore();

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement || !camera_stream) {
      return;
    }

    setIsVideoReady(false);
    videoElement.srcObject = camera_stream;
    videoElement.muted = true;
    videoElement.playsInline = true;

    const handleLoadedMetadata = () => {
      void videoElement.play().then(() => setIsVideoReady(true)).catch(() => {
        setIsVideoReady(false);
      });
    };

    const handleCanPlay = () => {
      void videoElement.play().then(() => setIsVideoReady(true)).catch(() => {
        setIsVideoReady(false);
      });
    };

    videoElement.addEventListener("loadedmetadata", handleLoadedMetadata);
    videoElement.addEventListener("canplay", handleCanPlay);

    return () => {
      videoElement.removeEventListener("loadedmetadata", handleLoadedMetadata);
      videoElement.removeEventListener("canplay", handleCanPlay);
      videoElement.srcObject = null;
    };
  }, [camera_stream]);

  const { analyser, sendParams, sendPlaybackControl } = useLyriaStream(
    session_id,
    camera_stream,
    addFanInfluence,
  );

  const finishSession = async () => {
    if (!session_id) {
      return;
    }

    const confirmed = window.confirm("End the current session and generate the final track?");
    if (!confirmed) {
      return;
    }

    setIsCompleting(true);
    sendPlaybackControl("STOP");
    try {
      const track = await api<TrackRecord>(`/sessions/${session_id}/complete`, {
        method: "POST",
        body: JSON.stringify({
          artist_id: artist.artist_id,
          influences: fan_influences.map((item) => item.tag),
        }),
      });
      setCurrentTrack(track);
      camera_stream?.getTracks().forEach((trackItem) => trackItem.stop());
      endSession();
    } finally {
      setIsCompleting(false);
    }
  };

  if (!camera_stream || current_track || isCompleting) {
    return (
      <section className="flex min-h-[80vh] items-center justify-center px-6 py-12">
        <SessionComplete />
      </section>
    );
  }

  return (
    <section className="relative min-h-screen overflow-hidden bg-black">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,240,255,0.12),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(255,0,170,0.16),transparent_28%)]" />
      <div className="relative flex min-h-screen items-center justify-center px-6">
        <div className="relative w-full max-w-4xl overflow-hidden rounded-[2rem] border-4 border-cyan-300/60 shadow-[0_0_40px_rgba(0,240,255,0.35)]">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="aspect-video w-full bg-black object-cover [transform:scaleX(-1)]"
          />
          {!isVideoReady ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/75 text-center">
              <div className="mb-3 text-sm uppercase tracking-[0.28em] text-cyan-300">
                Camera live
              </div>
              <p className="max-w-md text-sm text-white/65">
                Camera access is active, but the browser has not started rendering video frames yet.
              </p>
            </div>
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
        </div>
      </div>
      <AudioVisualizer analyser={analyser} />
      <SessionControls onEndSession={() => void finishSession()} onParamChange={sendParams} />
    </section>
  );
}
