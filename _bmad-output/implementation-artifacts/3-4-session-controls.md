# Story 3.4: Live Session Controls

Status: review

---

## Story

As an **artist**,
I want minimal controls during my live session,
So that I can focus on performing without distractions.

---

## Acceptance Criteria

1. **AC1: Control Elements Layout**
   - Given a live session is active
   - When I look at the session interface
   - Then I see only: session timer (top center), "End Session" button (top right, red/pink), mute mic button (bottom left, glass morphism circle), fan influences badge (bottom right, showing count of received tags with pink glow)

2. **AC2: Microphone Mute Toggle**
   - Given a live session is active
   - When I click "Mute Mic"
   - Then microphone input is muted with visual feedback (icon change, color change)
   - And clicking again un-mutes the microphone

3. **AC3: Fan Influences Badge**
   - Given a live session is active
   - When fans send influence tags
   - Then the fan influences badge updates in real-time showing the count
   - And the badge has a pink/magenta glow effect

4. **AC4: Parameter Sliders Panel**
   - Given a live session is active
   - When I hover/tap the controls area
   - Then a subtle panel expands with sliders: Tempo (BPM), Intensity (guidance)
   - And slider changes are sent to Lyria in real-time via WebSocket
   - And the panel is subtle and doesn't obstruct the performance view

5. **AC5: End Session**
   - Given a live session is active
   - When I click "End Session"
   - Then a confirmation modal appears
   - And confirming ends the session and transitions to SessionComplete view

---

## Tasks / Subtasks

- [ ] Task 1: Create SessionControls component (AC: #1)
  - [ ] Subtask 1.1: Create `SessionControls.tsx` component
  - [ ] Subtask 1.2: Position session timer at top center (monospace, cyan glow)
  - [ ] Subtask 1.3: Add "End Session" button at top right (red/pink, destructive)
  - [ ] Subtask 1.4: Add mute mic button at bottom left (glass morphism circle)
  - [ ] Subtask 1.5: Add fan influences badge at bottom right (pink glow)

- [ ] Task 2: Implement microphone mute functionality (AC: #2)
  - [ ] Subtask 2.1: Track microphone mute state in component
  - [ ] Subtask 2.2: Toggle MediaStream audio tracks enabled/disabled
  - [ ] Subtask 2.3: Visual feedback: microphone-off icon when muted
  - [ ] Subtask 2.4: Mute state syncs with audio stream sent to Lyria

- [ ] Task 3: Implement fan influences badge (AC: #3)
  - [ ] Subtask 3.1: Subscribe to fan influence updates via WebSocket
  - [ ] Subtask 3.2: Count and display pending influences
  - [ ] Subtask 3.3: Add pink/magenta glow animation when new influences arrive
  - [ ] Subtask 3.4: Update badge in real-time as influences are received

- [ ] Task 4: Create parameter sliders panel (AC: #4)
  - [ ] Subtask 4.1: Create expandable panel component
  - [ ] Subtask 4.2: Add Tempo slider (60-200 BPM)
  - [ ] Subtask 4.3: Add Intensity/Guidance slider (0.0-6.0)
  - [ ] Subtask 4.4: Send slider values to Lyria via WebSocket on change
  - [ ] Subtask 4.5: Debounce slider changes (300ms) to avoid overwhelming Lyria

- [ ] Task 5: Implement end session flow (AC: #5)
  - [ ] Subtask 5.1: Create confirmation modal component
  - [ ] Subtask 5.2: Handle end session button click
  - [ ] Subtask 5.3: Send end session command to backend
  - [ ] Subtask 5.4: Close WebSocket and cleanup resources
  - [ ] Subtask 5.5: Navigate to SessionComplete component

---

## Dev Notes

### Session Controls Layout

```tsx
// features/studio/SessionControls.tsx
export const SessionControls: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center">
        {/* Session Timer - Center */}
        <div className="absolute left-1/2 -translate-x-1/2">
          <SessionTimer />
        </div>

        {/* End Session - Right */}
        <EndSessionButton />
      </div>

      {/* Bottom bar */}
      <div className="absolute bottom-0 left-0 right-0 p-6 flex justify-between items-center">
        {/* Mute Mic - Left */}
        <MuteMicButton />

        {/* Parameter Sliders - Center (on hover) */}
        <ParameterSliders />

        {/* Fan Influences - Right */}
        <FanInfluencesBadge />
      </div>
    </div>
  );
};
```

### Session Timer Component

```tsx
// components/SessionTimer.tsx
import { useState, useEffect } from 'react';
import { useStudioStore } from '../../stores/useStudioStore';

export const SessionTimer: React.FC = () => {
  const { session_start_time } = useStudioStore();
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!session_start_time) return;

    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - session_start_time) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [session_start_time]);

  const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
  const seconds = (elapsed % 60).toString().padStart(2, '0');

  return (
    <div className="font-mono text-3xl font-bold text-cyan-400 drop-shadow-[0_0_10px_rgba(0,240,255,0.8)]">
      {minutes}:{seconds}
    </div>
  );
};
```

### Mute Microphone Button

```tsx
// components/MuteMicButton.tsx
import { useState, useCallback } from 'react';
import { Mic, MicOff } from 'lucide-react'; // or use inline SVG

interface MuteMicButtonProps {
  stream: MediaStream | null;
}

export const MuteMicButton: React.FC<MuteMicButtonProps> = ({ stream }) => {
  const [isMuted, setIsMuted] = useState(false);

  const toggleMute = useCallback(() => {
    if (!stream) return;

    const audioTracks = stream.getAudioTracks();
    audioTracks.forEach(track => {
      track.enabled = !track.enabled;
    });

    setIsMuted(!isMuted);
  }, [stream, isMuted]);

  return (
    <button
      onClick={toggleMute}
      className={`
        w-14 h-14 rounded-full pointer-events-auto
        backdrop-blur-md bg-white/10
        border border-white/20
        flex items-center justify-center
        transition-all duration-200
        hover:scale-110 hover:bg-white/20
        ${isMuted ? 'text-red-400 border-red-400/50' : 'text-white'}
      `}
    >
      {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
    </button>
  );
};
```

### Fan Influences Badge

```tsx
// components/FanInfluencesBadge.tsx
import { useEffect, useState } from 'react';
import { Zap } from 'lucide-react';
import { useStudioStore } from '../../stores/useStudioStore';

export const FanInfluencesBadge: React.FC = () => {
  const { fan_influences } = useStudioStore();
  const [pulse, setPulse] = useState(false);
  const count = fan_influences.length;

  useEffect(() => {
    if (count > 0) {
      setPulse(true);
      const timer = setTimeout(() => setPulse(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [count]);

  return (
    <div
      className={`
        pointer-events-auto flex items-center gap-2 px-4 py-2
        rounded-full backdrop-blur-md bg-white/10
        border border-pink-400/30
        transition-all duration-300
        ${pulse ? 'shadow-[0_0_30px_rgba(255,0,170,0.6)] scale-110' : ''}
      `}
    >
      <Zap size={18} className="text-pink-400" />
      <span className="text-white font-medium">{count}</span>
    </div>
  );
};
```

### Parameter Sliders Panel

```tsx
// components/ParameterSliders.tsx
import { useState, useCallback, useRef } from 'react';
import { useLyriaStream } from '../../hooks/useLyriaStream';
import { Slider } from '../Slider';

export const ParameterSliders: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [bpm, setBpm] = useState(120);
  const [intensity, setIntensity] = useState(4.0);
  const { sendParams } = useLyriaStream();
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const handleBpmChange = useCallback((value: number) => {
    setBpm(value);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      sendParams({ bpm: value });
    }, 300);
  }, [sendParams]);

  const handleIntensityChange = useCallback((value: number) => {
    setIntensity(value);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      sendParams({ guidance: value });
    }, 300);
  }, [sendParams]);

  return (
    <div
      className={`
        pointer-events-auto
        transition-all duration-300 ease-out
        ${isExpanded ? 'w-64 opacity-100' : 'w-12 opacity-70'}
      `}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className="backdrop-blur-md bg-black/40 rounded-2xl p-4 border border-white/10">
        {!isExpanded ? (
          <div className="text-center text-white/50">
            <Settings size={20} />
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-xs text-cyan-400 uppercase tracking-wider">
                Tempo (BPM)
              </label>
              <Slider
                min={60}
                max={200}
                value={bpm}
                onChange={handleBpmChange}
                className="mt-2"
              />
              <span className="text-white text-sm">{bpm}</span>
            </div>

            <div>
              <label className="text-xs text-cyan-400 uppercase tracking-wider">
                Intensity
              </label>
              <Slider
                min={0}
                max={6}
                step={0.1}
                value={intensity}
                onChange={handleIntensityChange}
                className="mt-2"
              />
              <span className="text-white text-sm">{intensity.toFixed(1)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
```

### End Session Button & Confirmation

```tsx
// components/EndSessionButton.tsx
import { useState } from 'react';
import { Square } from 'lucide-react';
import { ConfirmationModal } from './ConfirmationModal';
import { useStudioStore } from '../../stores/useStudioStore';
import { useLyriaStream } from '../../hooks/useLyriaStream';

export const EndSessionButton: React.FC = () => {
  const [showConfirm, setShowConfirm] = useState(false);
  const { endSession } = useStudioStore();
  const { disconnect } = useLyriaStream();

  const handleEndSession = () => {
    disconnect();
    endSession();
    // Navigate to SessionComplete
  };

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        className="pointer-events-auto flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-red-500 to-pink-600 text-white font-medium hover:opacity-90 transition-opacity shadow-lg shadow-red-500/30"
      >
        <Square size={16} fill="currentColor" />
        End Session
      </button>

      {showConfirm && (
        <ConfirmationModal
          title="End Session?"
          message="This will finalize your track and stop the live stream."
          onConfirm={handleEndSession}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </>
  );
};
```

### WebSocket Parameter Updates

```typescript
// hooks/useLyriaStream.ts
interface AudioParams {
  bpm?: number;
  guidance?: number;
  temperature?: number;
  density?: number;
  brightness?: number;
}

const sendParams = (params: AudioParams) => {
  if (wsRef.current?.readyState === WebSocket.OPEN) {
    wsRef.current.send(JSON.stringify({
      type: 'music_generation_config',
      payload: params
    }));
  }
};
```

---

## Technical Requirements

### Project Structure

**Frontend:**
- `frontend/src/features/studio/SessionControls.tsx` - Main controls container
- `frontend/src/components/SessionTimer.tsx` - Timer display
- `frontend/src/components/MuteMicButton.tsx` - Mic mute toggle
- `frontend/src/components/FanInfluencesBadge.tsx` - Influences counter
- `frontend/src/components/ParameterSliders.tsx` - Parameter controls
- `frontend/src/components/EndSessionButton.tsx` - End session with confirmation

### Dependencies

- Uses existing Slider component from shared components
- Uses existing Zustand stores
- Uses existing WebSocket hook

---

## References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 3.4]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#UX-DR3: LiveSessionView]
- Lyria API: https://ai.google.dev/api/live_music

---

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

- `frontend/src/features/studio/SessionControls.tsx`
- `frontend/src/components/SessionTimer.tsx`
- `frontend/src/components/MuteMicButton.tsx`
- `frontend/src/components/FanInfluencesBadge.tsx`
- `frontend/src/components/ParameterSliders.tsx`
- `frontend/src/components/EndSessionButton.tsx`
