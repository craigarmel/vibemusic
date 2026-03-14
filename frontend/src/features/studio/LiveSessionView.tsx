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
    session_artist: artist,
    music_prompt,
    performance_notes,
    generated_avatar,
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
          music_prompt,
          performance_notes,
          avatar_url: generated_avatar?.image_url ?? artist.avatar_url ?? null,
          generation_target: "suno",
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
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(159,255,224,0.14),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(255,160,122,0.18),transparent_32%)]" />
      <div className="relative flex min-h-screen items-center justify-center px-6">
        <div className="grid w-full max-w-6xl gap-6 lg:grid-cols-[1fr_320px]">
          <div className="relative overflow-hidden rounded-[2rem] border-4 border-[#9fffe0]/50 shadow-[0_0_50px_rgba(159,255,224,0.2)]">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="aspect-video w-full bg-black object-cover [transform:scaleX(-1)]"
          />
            {!isVideoReady ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/75 text-center">
                <div className="mb-3 text-sm uppercase tracking-[0.28em] text-[#9fffe0]">
                  Camera live
                </div>
                <p className="max-w-md text-sm text-white/65">
                  Camera access is active, but the browser has not started rendering video frames yet.
                </p>
              </div>
            ) : null}
            <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/10" />
            <div className="absolute inset-x-0 bottom-0 p-6">
              <div className="max-w-3xl rounded-[1.6rem] border border-white/10 bg-black/35 p-4 backdrop-blur-xl">
                <div className="mb-2 text-xs uppercase tracking-[0.22em] text-[#9fffe0]">Live brief</div>
                <p className="text-lg text-white">{music_prompt}</p>
                {performance_notes ? (
                  <p className="mt-3 text-sm text-white/65">{performance_notes}</p>
                ) : null}
              </div>
            </div>
          </div>

          <aside className="glass-panel flex flex-col gap-4 rounded-[2rem] p-5">
            <div>
              <div className="text-xs uppercase tracking-[0.22em] text-white/45">Generation target</div>
              <div className="mt-2 text-2xl font-semibold text-[#ffcf8f]">Suno</div>
            </div>
            <div className="rounded-[1.4rem] border border-white/10 bg-black/25 p-3">
              {generated_avatar?.image_url || artist.avatar_url ? (
                <img
                  src={generated_avatar?.image_url ?? artist.avatar_url}
                  alt="Artist avatar"
                  className="aspect-square w-full rounded-[1.1rem] object-cover"
                />
              ) : (
                <div className="flex aspect-square items-center justify-center rounded-[1.1rem] border border-dashed border-white/10 text-sm text-white/40">
                  Avatar pending
                </div>
              )}
            </div>
            <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.04] p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-white/45">Session output</div>
              <p className="mt-2 text-sm text-white/72">
                Instrumental in the background, rough vocal take on top, then package everything for final full-song generation.
              </p>
            </div>
          </aside>
        </div>
      </div>
      <AudioVisualizer analyser={analyser} />
      <SessionControls onEndSession={() => void finishSession()} onParamChange={sendParams} />
    </section>
  );
}
