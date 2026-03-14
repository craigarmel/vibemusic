# Story 3.3: Real-time Audio Visualizer

Status: review

---

## Story

As an **artist**,
I want to see the generated music visualized in real-time,
So that I can feel the music reacting to my performance.

---

## Acceptance Criteria

1. **AC1: Frequency Bar Visualizer**
   - Given a live session is active with audio streaming
   - When Lyria generates audio
   - Then the `AudioVisualizer` component displays ~30 frequency bars at the bottom third of the screen

2. **AC2: Visual Styling**
   - Given the visualizer is rendering
   - When the audio plays
   - Then bars are colored with a cyan-to-purple gradient with neon glow
   - And bars animate in real-time reacting to the audio output frequency data

3. **AC3: Web Audio API Integration**
   - Given the audio is playing
   - When the visualizer is active
   - Then the visualizer uses Web Audio API's `AnalyserNode` to extract frequency data from the playing audio stream

4. **AC4: Performance**
   - Given the visualizer is active
   - When the animation runs
   - Then animation runs at 60fps without degrading session performance

---

## Tasks / Subtasks

- [ ] Task 1: Create AudioVisualizer component (AC: #1)
  - [ ] Subtask 1.1: Create `AudioVisualizer.tsx` component
  - [ ] Subtask 1.2: Implement ~30 vertical frequency bars layout
  - [ ] Subtask 1.3: Position component at bottom third of screen
  - [ ] Subtask 1.4: Add glass morphism background container

- [ ] Task 2: Implement Web Audio API AnalyserNode (AC: #3)
  - [ ] Subtask 2.1: Create `useAudioAnalyzer.ts` hook
  - [ ] Subtask 2.2: Set up AnalyserNode with fftSize = 64 (32 frequency bins)
  - [ ] Subtask 2.3: Connect AnalyserNode to audio source
  - [ ] Subtask 2.4: Extract frequency data in animation loop

- [ ] Task 3: Visual styling and animations (AC: #2)
  - [ ] Subtask 3.1: Apply cyan-to-purple gradient to bars
  - [ ] Subtask 3.2: Add neon glow effect to bars (box-shadow)
  - [ ] Subtask 3.3: Implement smooth bar height transitions
  - [ ] Subtask 3.4: Mirror bars for symmetry (optional enhancement)

- [ ] Task 4: Performance optimization (AC: #4)
  - [ ] Subtask 4.1: Use requestAnimationFrame for 60fps updates
  - [ ] Subtask 4.2: Optimize React re-renders with refs
  - [ ] Subtask 4.3: Use CSS transforms instead of height for animations
  - [ ] Subtask 4.4: Throttle data updates if needed

---

## Dev Notes

### Web Audio API AnalyserNode Setup

```typescript
// hooks/useAudioAnalyzer.ts
import { useEffect, useRef, useCallback } from 'react';

export const useAudioAnalyzer = (audioContext: AudioContext | null) => {
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);

  const setupAnalyser = useCallback((source: AudioNode) => {
    if (!audioContext) return;

    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 64; // 32 frequency bins
    analyser.smoothingTimeConstant = 0.8; // Smooth transitions

    source.connect(analyser);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    analyserRef.current = analyser;
    dataArrayRef.current = dataArray;
  }, [audioContext]);

  const getFrequencyData = useCallback(() => {
    if (!analyserRef.current || !dataArrayRef.current) return null;

    analyserRef.current.getByteFrequencyData(dataArrayRef.current);
    return dataArrayRef.current;
  }, []);

  return { setupAnalyser, getFrequencyData };
};
```

### Audio Visualizer Component

```tsx
// components/AudioVisualizer.tsx
import { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  audioContext: AudioContext;
  audioSource: MediaStreamAudioSourceNode | AudioBufferSourceNode;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  audioContext,
  audioSource
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Set up analyser
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 64;
    analyser.smoothingTimeConstant = 0.8;

    audioSource.connect(analyser);
    analyserRef.current = analyser;

    const bufferLength = analyser.frequencyBinCount; // 32 bins
    const dataArray = new Uint8Array(bufferLength);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);

      analyser.getByteFrequencyData(dataArray);

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw ~30 bars (use 30 of the 32 bins)
      const barCount = 30;
      const barWidth = canvas.width / barCount;
      const skipBins = Math.floor((bufferLength - barCount) / 2); // Center the frequency range

      for (let i = 0; i < barCount; i++) {
        const dataIndex = skipBins + i;
        const value = dataArray[dataIndex];
        const percent = value / 255;
        const barHeight = percent * canvas.height;

        const x = i * barWidth;
        const y = canvas.height - barHeight;

        // Create gradient for each bar
        const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
        gradient.addColorStop(0, '#00f0ff'); // Cyan
        gradient.addColorStop(1, '#8b5cf6'); // Purple

        // Draw bar with glow
        ctx.fillStyle = gradient;
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#00f0ff';

        // Rounded bar top
        ctx.beginPath();
        ctx.roundRect(x + 2, y, barWidth - 4, barHeight, 4);
        ctx.fill();
      }
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      analyser.disconnect();
    };
  }, [audioContext, audioSource]);

  return (
    <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/80 to-transparent">
      <canvas
        ref={canvasRef}
        width={800}
        height={200}
        className="w-full h-full"
      />
    </div>
  );
};
```

### Alternative: CSS-Based Visualizer (Performance Optimized)

```tsx
// components/AudioVisualizerCSS.tsx
import { useEffect, useRef, useState } from 'react';

const BAR_COUNT = 30;

export const AudioVisualizerCSS: React.FC<{ analyser: AnalyserNode }> = ({ analyser }) => {
  const [barHeights, setBarHeights] = useState<number[]>(new Array(BAR_COUNT).fill(0));
  const animationRef = useRef<number | null>(null);
  const dataArrayRef = useRef<Uint8Array>(new Uint8Array(analyser.frequencyBinCount));

  useEffect(() => {
    const updateBars = () => {
      analyser.getByteFrequencyData(dataArrayRef.current);

      const newHeights = [];
      const binsPerBar = Math.floor(dataArrayRef.current.length / BAR_COUNT);

      for (let i = 0; i < BAR_COUNT; i++) {
        let sum = 0;
        for (let j = 0; j < binsPerBar; j++) {
          sum += dataArrayRef.current[i * binsPerBar + j];
        }
        const avg = sum / binsPerBar;
        newHeights.push((avg / 255) * 100); // Percentage height
      }

      setBarHeights(newHeights);
      animationRef.current = requestAnimationFrame(updateBars);
    };

    updateBars();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [analyser]);

  return (
    <div className="absolute bottom-0 left-0 right-0 h-1/3 flex items-end justify-center gap-1 px-8 pb-8">
      {barHeights.map((height, i) => (
        <div
          key={i}
          className="w-3 rounded-t transition-all duration-75 ease-out"
          style={{
            height: `${height}%`,
            background: `linear-gradient(to top, #00f0ff, #8b5cf6)`,
            boxShadow: height > 50 ? '0 0 20px rgba(0, 240, 255, 0.6)' : 'none'
          }}
        />
      ))}
    </div>
  );
};
```

### Integration with Lyria Stream

```tsx
// features/studio/LiveSessionView.tsx
import { useEffect, useRef, useState } from 'react';
import { AudioVisualizer } from '../../components/AudioVisualizer';
import { useLyriaStream } from '../../hooks/useLyriaStream';

export const LiveSessionView: React.FC = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const [audioSource, setAudioSource] = useState<AudioBufferSourceNode | null>(null);
  const { connect, isConnected } = useLyriaStream();

  useEffect(() => {
    // Initialize AudioContext at 48kHz for Lyria
    audioContextRef.current = new AudioContext({ sampleRate: 48000 });

    // Connect to Lyria WebSocket
    connect('session-id');

    return () => {
      audioContextRef.current?.close();
    };
  }, [connect]);

  return (
    <div className="relative w-full h-screen bg-black">
      {/* Camera feed */}
      <div className="absolute inset-0 flex items-center justify-center">
        <video className="rounded-2xl border-4 border-cyan-400 shadow-[0_0_30px_rgba(0,240,255,0.5)]" />
      </div>

      {/* Audio visualizer */}
      {audioContextRef.current && audioSource && (
        <AudioVisualizer
          audioContext={audioContextRef.current}
          audioSource={audioSource}
        />
      )}

      {/* Session timer */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 font-mono text-cyan-400 text-2xl font-bold">
        04:23
      </div>
    </div>
  );
};
```

### Performance Optimization Tips

1. **Use requestAnimationFrame:** Always use rAF for visual updates to sync with display refresh
2. **Avoid React State in Animation Loop:** Use refs for animation data, only update React state when necessary
3. **CSS Transforms:** Prefer transform/opacity changes over layout properties
4. **Canvas vs CSS:** Canvas offers more control; CSS is simpler and often performant enough
5. **Reduce FFT Size:** Smaller fftSize = fewer calculations (64 is usually enough for visualization)
6. **Smoothing Time Constant:** Use 0.7-0.9 for smoother visual transitions

### Frequency Distribution

- Low frequencies (bass/kick): First few bins
- Mid frequencies (vocals/snares): Middle bins
- High frequencies (hihats/cymbals): Last bins

For music visualization, you may want to focus on the lower-mid range where most musical content exists.

---

## Technical Requirements

### Project Structure

**Frontend:**
- `frontend/src/components/AudioVisualizer.tsx` - Visualizer component
- `frontend/src/hooks/useAudioAnalyzer.ts` - Web Audio API analyzer hook

### Dependencies

No additional dependencies (Web Audio API is native to browsers).

### Browser Support

- Web Audio API is supported in all modern browsers
- Ensure AudioContext is created/resumed after user interaction

---

## References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 3.3]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#UX-DR4: AudioVisualizer]
- MDN Web Audio API: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
- MDN AnalyserNode: https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode

---

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

- `frontend/src/components/AudioVisualizer.tsx`
- `frontend/src/hooks/useAudioAnalyzer.ts`
