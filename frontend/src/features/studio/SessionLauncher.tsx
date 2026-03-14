import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { api } from "../../api/client";
import { useCamera } from "../../hooks/useCamera";
import { useStudioStore } from "../../stores/useStudioStore";
import type { AvatarAsset, AvatarSource, SessionRecord } from "../../types/studio";

const QUICK_PROMPTS = [
  "Afro house solaire avec drop vocal",
  "Drill romantique pour topline yaourt",
  "Hyperpop triste avec grosse basse",
  "Jersey club cinematic pour hook viral",
];

function sourceLabel(source: AvatarSource) {
  if (source === "camera") return "camera";
  if (source === "upload") return "upload";
  return "prompt";
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Unable to read the selected image."));
    reader.readAsDataURL(file);
  });
}

export function SessionLauncher() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false);
  const {
    artist,
    camera_stream,
    music_prompt,
    performance_notes,
    avatar_prompt,
    avatar_reference_image,
    generated_avatar,
    session_error,
    startSession,
    setCameraStream,
    setSessionError,
    setMusicPrompt,
    setPerformanceNotes,
    setAvatarPrompt,
    setAvatarReferenceImage,
    setGeneratedAvatar,
  } = useStudioStore();
  const { requestStream, isRequesting } = useCamera();

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement || !camera_stream) {
      return;
    }

    setIsVideoReady(false);
    videoElement.srcObject = camera_stream;
    videoElement.muted = true;
    videoElement.playsInline = true;

    const handleCanPlay = () => {
      void videoElement.play().then(() => setIsVideoReady(true)).catch(() => setIsVideoReady(false));
    };

    videoElement.addEventListener("loadedmetadata", handleCanPlay);
    videoElement.addEventListener("canplay", handleCanPlay);

    return () => {
      videoElement.removeEventListener("loadedmetadata", handleCanPlay);
      videoElement.removeEventListener("canplay", handleCanPlay);
      videoElement.srcObject = null;
    };
  }, [camera_stream]);

  const ensurePreviewStream = async () => {
    if (camera_stream) {
      return camera_stream;
    }

    const stream = await requestStream();
    setCameraStream(stream);
    return stream;
  };

  const captureFrame = async () => {
    try {
      await ensurePreviewStream();
      const video = videoRef.current;
      if (!video || video.videoWidth === 0 || video.videoHeight === 0) {
        throw new Error("Camera preview is not ready yet.");
      }

      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext("2d");
      if (!context) {
        throw new Error("Canvas is unavailable.");
      }

      context.save();
      context.translate(canvas.width, 0);
      context.scale(-1, 1);
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      context.restore();
      setAvatarReferenceImage(canvas.toDataURL("image/jpeg", 0.92));
      setSessionError(null);
    } catch (error) {
      setSessionError(error instanceof Error ? error.message : "Unable to capture camera frame.");
    }
  };

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const image = await readFileAsDataUrl(file);
      setAvatarReferenceImage(image);
      setSessionError(null);
    } catch (error) {
      setSessionError(error instanceof Error ? error.message : "Unable to load the selected image.");
    } finally {
      event.target.value = "";
    }
  };

  const generateAvatar = async (source: AvatarSource) => {
    setIsGeneratingAvatar(true);
    try {
      const avatar = await api<AvatarAsset>("/avatars/generate", {
        method: "POST",
        body: JSON.stringify({
          prompt: avatar_prompt,
          source,
          reference_image: source === "prompt" ? null : avatar_reference_image,
        }),
      });
      setGeneratedAvatar(avatar);
      setSessionError(null);
    } catch (error) {
      setSessionError(error instanceof Error ? error.message : "Avatar generation failed.");
    } finally {
      setIsGeneratingAvatar(false);
    }
  };

  const handleLaunch = async () => {
    if (!music_prompt.trim()) {
      setSessionError("Add a music prompt before starting the session.");
      return;
    }

    try {
      const stream = await ensurePreviewStream();
      const session = await api<SessionRecord>("/sessions", {
        method: "POST",
        body: JSON.stringify({
          artist_id: artist.artist_id,
          music_prompt,
          performance_notes,
          avatar_prompt,
          avatar_url: generated_avatar?.image_url ?? null,
        }),
      });
      startSession(session, stream);
    } catch (error) {
      setSessionError(
        error instanceof Error
          ? error.message
          : "Camera and microphone access are required to start a live session.",
      );
    }
  };

  const metrics = [
    ["Prompt", music_prompt.trim() ? "Ready" : "Missing"],
    ["Avatar", generated_avatar ? sourceLabel(generated_avatar.source) : "Pending"],
    ["Mic + cam", camera_stream ? "Armed" : "Idle"],
  ];

  return (
    <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <div className="glass-panel rounded-[2rem] p-8">
        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="mb-2 text-sm uppercase tracking-[0.28em] text-[#9fffe0]">AI music cockpit</div>
            <h1 className="max-w-3xl text-4xl font-semibold text-white">Prompt, perform, then package the full take for Suno.</h1>
            <p className="mt-3 max-w-2xl text-white/65">
              The backing instrumental runs live, the artist sings rough toplines over it, and the full session
              bundle carries the vocal vibe plus avatar into the final generation pipeline.
            </p>
          </div>
          <div className="grid w-full max-w-xs gap-3">
            {metrics.map(([label, value]) => (
              <div key={label} className="rounded-[1.4rem] border border-white/10 bg-white/[0.04] p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-white/40">{label}</div>
                <div className="mt-2 text-lg font-semibold text-[#9fffe0]">{value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            <div className="rounded-[1.6rem] border border-white/10 bg-black/20 p-5">
              <div className="mb-3 text-sm uppercase tracking-[0.22em] text-white/55">Music prompt</div>
              <textarea
                value={music_prompt}
                onChange={(event) => setMusicPrompt(event.target.value)}
                rows={6}
                placeholder="Ex: club melancholique, instru aérienne, topline simple pour yaourt, montée finale euphorique..."
                className="w-full resize-none rounded-[1.2rem] border border-white/10 bg-white/[0.04] px-4 py-4 text-base text-white outline-none placeholder:text-white/28"
              />
              <div className="mt-4 flex flex-wrap gap-2">
                {QUICK_PROMPTS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setMusicPrompt(preset)}
                    className="rounded-full border border-[#9fffe0]/20 bg-[#9fffe0]/8 px-3 py-2 text-sm text-[#cffff1] transition hover:bg-[#9fffe0]/14"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-[1.6rem] border border-white/10 bg-black/20 p-5">
              <div className="mb-3 text-sm uppercase tracking-[0.22em] text-white/55">Performance notes</div>
              <textarea
                value={performance_notes}
                onChange={(event) => setPerformanceNotes(event.target.value)}
                rows={4}
                placeholder="Ex: voix proche du micro, laisse de la place au refrain, hook répétitif, respirations assumées..."
                className="w-full resize-none rounded-[1.2rem] border border-white/10 bg-white/[0.04] px-4 py-4 text-base text-white outline-none placeholder:text-white/28"
              />
            </div>
          </div>

          <div className="rounded-[1.8rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-5">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-sm uppercase tracking-[0.22em] text-white/55">Camera capture</div>
              <button
                type="button"
                onClick={() => void ensurePreviewStream()}
                disabled={isRequesting}
                className="rounded-full border border-white/10 px-3 py-2 text-xs uppercase tracking-[0.16em] text-white/70"
              >
                {camera_stream ? "Live" : isRequesting ? "Opening..." : "Enable cam"}
              </button>
            </div>
            <div className="relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-black">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="aspect-[4/5] w-full object-cover [transform:scaleX(-1)]"
              />
              {!isVideoReady ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 px-6 text-center text-sm text-white/55">
                  Enable the camera to grab a face reference and record the topline over the backing track.
                </div>
              ) : null}
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => void captureFrame()}
                className="rounded-2xl border border-[#ff9966]/30 bg-[#ff9966]/14 px-4 py-3 text-sm font-semibold text-[#ffd7bf]"
              >
                Capture frame
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm font-semibold text-white/75"
              >
                Upload image
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => void handleUpload(event)}
            />
            {avatar_reference_image ? (
              <div className="mt-4">
                <div className="mb-2 text-xs uppercase tracking-[0.18em] text-white/45">Reference image</div>
                <img
                  src={avatar_reference_image}
                  alt="Avatar reference"
                  className="h-32 w-full rounded-[1.2rem] object-cover"
                />
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="glass-panel rounded-[2rem] p-8">
        <div className="mb-4 text-sm uppercase tracking-[0.28em] text-[#ffcf8f]">Avatar generation</div>
        <div className="mb-5 grid gap-5">
          <textarea
            value={avatar_prompt}
            onChange={(event) => setAvatarPrompt(event.target.value)}
            rows={5}
            placeholder="Describe the avatar look, styling, lens, mood, outfit..."
            className="w-full resize-none rounded-[1.2rem] border border-white/10 bg-white/[0.04] px-4 py-4 text-base text-white outline-none placeholder:text-white/28"
          />
          <div className="grid gap-3 sm:grid-cols-3">
            <button
              type="button"
              disabled={isGeneratingAvatar}
              onClick={() => void generateAvatar("prompt")}
              className="rounded-2xl bg-[#9fffe0] px-4 py-3 text-sm font-semibold text-black disabled:opacity-60"
            >
              Prompt avatar
            </button>
            <button
              type="button"
              disabled={isGeneratingAvatar || !avatar_reference_image}
              onClick={() => void generateAvatar("camera")}
              className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm font-semibold text-white disabled:opacity-40"
            >
              Camera avatar
            </button>
            <button
              type="button"
              disabled={isGeneratingAvatar || !avatar_reference_image}
              onClick={() => void generateAvatar("upload")}
              className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm font-semibold text-white disabled:opacity-40"
            >
              Image avatar
            </button>
          </div>
        </div>

        <div className="rounded-[1.8rem] border border-white/10 bg-black/25 p-4">
          {generated_avatar ? (
            <>
              <img
                src={generated_avatar.image_url}
                alt="Generated avatar"
                className="aspect-square w-full rounded-[1.4rem] object-cover"
              />
              <div className="mt-4 space-y-2">
                <div className="text-xs uppercase tracking-[0.2em] text-white/45">
                  {generated_avatar.provider} · {sourceLabel(generated_avatar.source)}
                </div>
                <p className="text-sm text-white/75">{generated_avatar.prompt}</p>
              </div>
            </>
          ) : (
            <div className="flex aspect-square items-center justify-center rounded-[1.4rem] border border-dashed border-white/12 text-center text-sm text-white/45">
              Generate the avatar from prompt only, or use a camera/upload reference.
            </div>
          )}
        </div>

        <div className="mt-6 rounded-[1.6rem] border border-[#9fffe0]/15 bg-[#9fffe0]/6 p-4 text-sm text-[#dffff3]">
          Suno handoff bundle includes the live instrumental stem, the rough vocal take, the music prompt and the avatar.
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <button
            type="button"
            onClick={() => void handleLaunch()}
            disabled={isRequesting}
            className="rounded-[1.4rem] bg-[linear-gradient(90deg,#9fffe0,#ffcf8f)] px-5 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-black shadow-[0_18px_50px_rgba(159,255,224,0.18)] disabled:opacity-60"
          >
            {isRequesting ? "Opening devices..." : "Start live creation"}
          </button>
          {session_error ? <p className="text-sm text-[#ffb9c9]">{session_error}</p> : null}
        </div>
      </div>
    </section>
  );
}
