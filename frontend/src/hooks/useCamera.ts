import { useState } from "react";

const MEDIA_CONSTRAINTS: MediaStreamConstraints = {
  video: { width: 1280, height: 720 },
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
  },
};

export function useCamera() {
  const [isRequesting, setIsRequesting] = useState(false);

  const requestStream = async () => {
    setIsRequesting(true);
    try {
      return await navigator.mediaDevices.getUserMedia(MEDIA_CONSTRAINTS);
    } finally {
      setIsRequesting(false);
    }
  };

  const stopStream = (stream: MediaStream | null) => {
    stream?.getTracks().forEach((track) => track.stop());
  };

  return { requestStream, stopStream, isRequesting };
}
