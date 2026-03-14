import { useEffect, useRef, useState } from "react";

export function useAudioAnalyzer(analyser: AnalyserNode | null, barCount = 30) {
  const [bars, setBars] = useState<number[]>(() => Array.from({ length: barCount }, () => 0));
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!analyser) {
      setBars(Array.from({ length: barCount }, () => 0));
      return;
    }

    const data = new Uint8Array(analyser.frequencyBinCount);

    const update = () => {
      analyser.getByteFrequencyData(data);
      const next = Array.from({ length: barCount }, (_, index) => {
        const bucketSize = Math.max(1, Math.floor(data.length / barCount));
        const start = index * bucketSize;
        const slice = data.slice(start, start + bucketSize);
        const avg = slice.reduce((sum, value) => sum + value, 0) / slice.length;
        return avg / 255;
      });

      setBars(next);
      frameRef.current = requestAnimationFrame(update);
    };

    frameRef.current = requestAnimationFrame(update);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [analyser, barCount]);

  return bars;
}
