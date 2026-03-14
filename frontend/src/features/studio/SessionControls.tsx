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
  onStartRecording?: () => void;
  onStopRecording?: () => void;
}

export function SessionControls({ onEndSession, onParamChange, onStartRecording, onStopRecording }: SessionControlsProps) {
  const {
    session_start_time,
    fan_influences,
    audio_params,
    setAudioParams,
  } = useStudioStore();
  const [elapsed, setElapsed] = useState(formatElapsed(session_start_time));
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setElapsed(formatElapsed(session_start_time));
    }, 1000);
    return () => window.clearInterval(interval);
  }, [session_start_time]);

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      onStopRecording?.();
    } else {
      setIsRecording(true);
      onStartRecording?.();
    }
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
      {/* Top bar: timer + end session */}
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

      {/* Bottom bar: record button (center) + params + influences */}
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-6">
        {/* Live parameters (left) */}
        <div
          className="pointer-events-auto"
          onMouseEnter={() => setIsExpanded(true)}
          onMouseLeave={() => setIsExpanded(false)}
        >
          <div
            className={`glass-panel overflow-hidden rounded-[1.6rem] transition-all duration-300 ${
              isExpanded ? "w-[280px] p-4 opacity-100" : "w-[140px] p-3 opacity-80"
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

        {/* Record button (center) */}
        <div className="pointer-events-auto absolute left-1/2 -translate-x-1/2 bottom-6">
          <button
            type="button"
            onClick={toggleRecording}
            className={`flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold uppercase tracking-wider transition-all ${
              isRecording
                ? "border-2 border-red-400 bg-red-500/20 text-red-200 shadow-[0_0_30px_rgba(255,50,50,0.4)] animate-pulse"
                : "border border-white/20 bg-white/10 text-white hover:bg-white/15 backdrop-blur-xl"
            }`}
          >
            <span className={`w-3 h-3 rounded-full ${isRecording ? "bg-red-400" : "bg-red-500"}`} />
            {isRecording ? "Recording..." : "Record"}
          </button>
        </div>

        {/* Fan influences (right) */}
        <div className="pointer-events-auto rounded-full border border-pink-400/35 bg-pink-500/10 px-4 py-2 text-sm text-pink-100 shadow-[0_0_28px_rgba(255,0,170,0.3)]">
          {fan_influences.length} fan influences
        </div>
      </div>
    </div>
  );
}
