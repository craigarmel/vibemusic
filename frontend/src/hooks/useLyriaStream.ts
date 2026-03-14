import { useEffect, useRef, useState } from "react";
import type { AudioParams, FanInfluence } from "../types/studio";

const BUFFER_TARGET = 3;

function pcm16ToBuffer(context: AudioContext, pcmData: ArrayBuffer) {
  const int16Array = new Int16Array(pcmData);
  const frameCount = Math.floor(int16Array.length / 2);
  const audioBuffer = context.createBuffer(2, frameCount, 48_000);
  const left = audioBuffer.getChannelData(0);
  const right = audioBuffer.getChannelData(1);

  for (let index = 0; index < frameCount; index += 1) {
    left[index] = int16Array[index * 2] / 32768;
    right[index] = int16Array[index * 2 + 1] / 32768;
  }

  return audioBuffer;
}

export function useLyriaStream(
  sessionId: string | null,
  stream: MediaStream | null,
  onInfluence?: (influence: FanInfluence) => void,
) {
  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputNodeRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const bufferQueueRef = useRef<AudioBuffer[]>([]);
  const playheadRef = useRef(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!sessionId || !stream) {
      return;
    }

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const socket = new WebSocket(
      `${protocol}//${window.location.host}/api/audio/stream?session_id=${sessionId}`,
    );
    socket.binaryType = "arraybuffer";
    wsRef.current = socket;

    const context = new AudioContext({ sampleRate: 48_000 });
    const gain = context.createGain();
    const analyser = context.createAnalyser();
    analyser.fftSize = 64;
    analyser.smoothingTimeConstant = 0.8;
    gain.connect(analyser);
    analyser.connect(context.destination);
    audioContextRef.current = context;
    outputNodeRef.current = gain;
    analyserRef.current = analyser;

    socket.addEventListener("open", () => {
      setIsConnected(true);
      void context.resume();
      socket.send(
        JSON.stringify({
          type: "setup",
          data: {
            bpm: 118,
            guidance: 4,
            temperature: 1.1,
            density: 0.5,
            brightness: 0.5,
          },
        }),
      );

      const preferredMimeType = MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "";
      const mediaRecorder = preferredMimeType
        ? new MediaRecorder(stream, { mimeType: preferredMimeType })
        : new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.addEventListener("dataavailable", async (event) => {
        if (event.data.size > 0 && socket.readyState === WebSocket.OPEN) {
          socket.send(await event.data.arrayBuffer());
        }
      });
      mediaRecorder.start(750);
    });

    socket.addEventListener("message", (event) => {
      if (typeof event.data === "string") {
        const message = JSON.parse(event.data) as {
          type: "influence" | "info";
          data: FanInfluence;
        };
        if (message.type === "influence") {
          onInfluence?.(message.data);
        }
        return;
      }

      const pcm = pcm16ToBuffer(context, event.data);
      bufferQueueRef.current.push(pcm);

      if (bufferQueueRef.current.length >= BUFFER_TARGET) {
        while (bufferQueueRef.current.length > 0) {
          const next = bufferQueueRef.current.shift();
          if (!next || !outputNodeRef.current) {
            continue;
          }

          const source = context.createBufferSource();
          source.buffer = next;
          source.connect(outputNodeRef.current);
          const startAt = Math.max(context.currentTime + 0.05, playheadRef.current);
          source.start(startAt);
          playheadRef.current = startAt + next.duration;
        }
      }
    });

    socket.addEventListener("close", () => {
      setIsConnected(false);
    });

    return () => {
      const recorder = mediaRecorderRef.current;
      if (recorder && recorder.state !== "inactive") {
        recorder.stop();
      }
      socket.close();
      wsRef.current = null;
      void context.close();
      audioContextRef.current = null;
      outputNodeRef.current = null;
      analyserRef.current = null;
      bufferQueueRef.current = [];
      playheadRef.current = 0;
    };
  }, [onInfluence, sessionId, stream]);

  const sendParams = (params: Partial<AudioParams>) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "music_generation_config", data: params }));
    }
  };

  const sendPlaybackControl = (control: "PLAY" | "PAUSE" | "STOP") => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "playback_control", data: { control } }));
    }
  };

  return {
    isConnected,
    analyser: analyserRef.current,
    sendParams,
    sendPlaybackControl,
  };
}
