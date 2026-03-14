import { useAudioAnalyzer } from "../../hooks/useAudioAnalyzer";

export function AudioVisualizer({ analyser }: { analyser: AnalyserNode | null }) {
  const bars = useAudioAnalyzer(analyser, 30);

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 px-6 pb-8">
      <div className="glass-panel h-full rounded-[2rem] bg-gradient-to-t from-black/90 via-black/40 to-transparent p-4">
        <div className="flex h-full items-end gap-2">
          {bars.map((value, index) => (
            <div
              key={index}
              className="flex-1 rounded-t-full bg-gradient-to-t from-cyan-300 via-cyan-400 to-purple-500 shadow-[0_0_18px_rgba(0,240,255,0.45)] transition-transform duration-75"
              style={{
                transform: `scaleY(${Math.max(0.08, value)})`,
                transformOrigin: "bottom",
                height: "100%",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
