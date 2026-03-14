import { useEffect, useRef, useState } from "react";
import { Slider } from "../../components/Slider";
import { useStudioStore } from "../../stores/useStudioStore";
import type { AudioParams } from "../../types/studio";

function formatElapsed(startTime: number | null) {
  if (!startTime) {
    return "00:00";
  }

  const elapsed = Math.max(0, Math.floor((Date.now() - startTime) / 1000));
  const minutes = Math.floor(elapsed / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (elapsed % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

interface SessionControlsProps {
  onEndSession: () => void;
  onParamChange: (params: Partial<AudioParams>) => void;
}

export function SessionControls({ onEndSession, onParamChange }: SessionControlsProps) {
  const {
    session_start_time,
    camera_stream,
    is_mic_muted,
    setMicMuted,
    fan_influences,
    audio_params,
    setAudioParams,
  } = useStudioStore();
  const [elapsed, setElapsed] = useState(formatElapsed(session_start_time));
  const [isExpanded, setIsExpanded] = useState(false);
  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setElapsed(formatElapsed(session_start_time));
    }, 1000);
    return () => window.clearInterval(interval);
  }, [session_start_time]);

  const toggleMute = () => {
    if (!camera_stream) {
      return;
    }

    const next = !is_mic_muted;
    camera_stream.getAudioTracks().forEach((track) => {
      track.enabled = !next;
    });
    setMicMuted(next);
  };

  const handleDebouncedParamChange = (params: Partial<AudioParams>) => {
    setAudioParams(params);
    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
    }
    debounceRef.current = window.setTimeout(() => onParamChange(params), 300);
  };

  return (
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute inset-x-0 top-0 flex items-center justify-end p-6">
        <div className="absolute left-1/2 -translate-x-1/2 rounded-full border border-cyan-300/40 bg-black/35 px-5 py-2 font-mono text-2xl text-cyan-300 shadow-[0_0_24px_rgba(0,240,255,0.4)]">
          {elapsed}
        </div>
        <button
          type="button"
          onClick={onEndSession}
          className="pointer-events-auto rounded-full border border-pink-300/30 bg-pink-500/20 px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-pink-100 shadow-[0_0_24px_rgba(255,0,170,0.35)] transition hover:bg-pink-500/30"
        >
          End Session
        </button>
      </div>

      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-6">
        <button
          type="button"
          onClick={toggleMute}
          className={`pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full border backdrop-blur-xl transition ${
            is_mic_muted
              ? "border-pink-300/50 bg-pink-500/20 text-pink-100"
              : "border-white/15 bg-white/10 text-white"
          }`}
          aria-label={is_mic_muted ? "Unmute microphone" : "Mute microphone"}
        >
          {is_mic_muted ? "×" : "●"}
        </button>

        <div
          className="pointer-events-auto absolute left-1/2 -translate-x-1/2"
          onMouseEnter={() => setIsExpanded(true)}
          onMouseLeave={() => setIsExpanded(false)}
        >
          <div
            className={`glass-panel overflow-hidden rounded-[1.6rem] transition-all duration-300 ${
              isExpanded ? "w-[320px] p-4 opacity-100" : "w-[160px] p-3 opacity-80"
            }`}
          >
            <div className="mb-3 text-center text-[11px] uppercase tracking-[0.22em] text-white/55">
              Live parameters
            </div>
            <div className={`space-y-4 transition-opacity ${isExpanded ? "opacity-100" : "opacity-0"}`}>
              <Slider
                label="Tempo"
                min={60}
                max={200}
                step={1}
                value={audio_params.bpm}
                onChange={(value) => handleDebouncedParamChange({ bpm: value })}
              />
              <Slider
                label="Intensity"
                min={0}
                max={6}
                step={0.1}
                value={audio_params.guidance}
                onChange={(value) => handleDebouncedParamChange({ guidance: value })}
              />
            </div>
          </div>
        </div>

        <div className="pointer-events-auto rounded-full border border-pink-400/35 bg-pink-500/10 px-4 py-2 text-sm text-pink-100 shadow-[0_0_28px_rgba(255,0,170,0.3)]">
          {fan_influences.length} fan influences
        </div>
      </div>
    </div>
  );
}
