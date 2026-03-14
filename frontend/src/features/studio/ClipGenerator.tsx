import { useCallback, useEffect, useRef, useState } from 'react'
import { useStudioStore } from '../../stores/useStudioStore'
import { generateClip, getTaskStatus } from '../../api/video'
import LoadingSpinner from '../../components/LoadingSpinner'

const POLL_INTERVAL = 1500 // ms

export default function ClipGenerator() {
  const { artist, current_track, is_generating_video, setGeneratingVideo, setError } =
    useStudioStore()

  const [, setTaskId] = useState<string | null>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [clipId, setClipId] = useState<string | null>(null)
  const [taskError, setTaskError] = useState<string | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  // Clean up polling on unmount
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [])

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
  }, [])

  const startPolling = useCallback(
    (tid: string) => {
      stopPolling()
      pollRef.current = setInterval(async () => {
        try {
          const res = await getTaskStatus(tid)
          const data = res.data
          if (!data) return

          if (data.status === 'completed') {
            stopPolling()
            setGeneratingVideo(false)
            setVideoUrl(data.video_url)
            setClipId(data.clip_id)
          } else if (data.status === 'failed') {
            stopPolling()
            setGeneratingVideo(false)
            setTaskError(data.error || 'Video generation failed')
          }
        } catch (err) {
          stopPolling()
          setGeneratingVideo(false)
          setTaskError(err instanceof Error ? err.message : 'Polling failed')
        }
      }, POLL_INTERVAL)
    },
    [stopPolling, setGeneratingVideo]
  )

  const handleGenerate = async () => {
    if (!artist || !current_track) return

    setGeneratingVideo(true)
    setTaskError(null)
    setVideoUrl(null)
    setClipId(null)

    try {
      const res = await generateClip(artist.artist_id, current_track.track_id)
      const tid = res.data?.task_id
      if (!tid) {
        throw new Error('No task_id returned')
      }
      setTaskId(tid)
      startPolling(tid)
    } catch (err) {
      setGeneratingVideo(false)
      const msg = err instanceof Error ? err.message : 'Failed to start clip generation'
      setTaskError(msg)
      setError(msg)
    }
  }

  const handlePlayPause = () => {
    if (!videoUrl) return

    if (isPlaying && audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
      return
    }

    const audio = new Audio(videoUrl)
    audio.addEventListener('ended', () => setIsPlaying(false), { once: true })
    audio.play().catch(() => setIsPlaying(false))
    audioRef.current = audio
    setIsPlaying(true)
  }

  // Must have both artist and a track to generate a clip
  if (!artist || !current_track) {
    return null
  }

  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-neon-purple/15 border border-neon-purple/25 flex items-center justify-center">
          <svg
            className="w-4 h-4 text-neon-purple"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="23 7 16 12 23 17 23 7" />
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
          </svg>
        </div>
        <div>
          <h3 className="text-white font-semibold text-sm">Video Clip</h3>
          <p className="text-text-muted text-xs">Generate a 9:16 vertical clip</p>
        </div>
      </div>

      {/* Generation in progress */}
      {is_generating_video && (
        <div className="flex flex-col items-center py-8 gap-4">
          <div className="relative">
            <LoadingSpinner size="lg" />
            <div className="absolute inset-0 flex items-center justify-center">
              <svg
                className="w-5 h-5 text-neon-cyan/60"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polygon points="23 7 16 12 23 17 23 7" />
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
              </svg>
            </div>
          </div>
          <div className="text-center">
            <p className="text-white text-sm font-medium">Generating video clip...</p>
            <p className="text-text-muted text-xs mt-1">
              Veo 3.1 is composing your visual
            </p>
          </div>
          {/* Animated progress bar */}
          <div className="w-full max-w-xs h-1 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-neon-cyan to-neon-purple"
              style={{
                animation: 'progress-indeterminate 2s ease-in-out infinite',
              }}
            />
          </div>
        </div>
      )}

      {/* Error state */}
      {taskError && !is_generating_video && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 mb-4">
          <p className="text-red-400 text-sm">{taskError}</p>
          <button
            onClick={handleGenerate}
            className="mt-2 text-xs text-red-300 hover:text-white transition-colors underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Completed: show preview */}
      {videoUrl && !is_generating_video && (
        <div className="mb-4">
          <div className="rounded-xl overflow-hidden border border-neon-cyan/20 bg-black/40">
            {/* Preview card */}
            <div className="p-4">
              <div className="flex items-center gap-4">
                {/* Play button */}
                <button
                  onClick={handlePlayPause}
                  className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r from-neon-cyan to-neon-purple flex items-center justify-center hover:scale-105 transition-transform"
                  style={{
                    boxShadow: '0 0 20px rgba(0, 240, 255, 0.3)',
                  }}
                >
                  {isPlaying ? (
                    <svg
                      className="w-5 h-5 text-white"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <rect x="6" y="4" width="4" height="16" />
                      <rect x="14" y="4" width="4" height="16" />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5 text-white ml-0.5"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                  )}
                </button>

                {/* Clip info */}
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">
                    Clip {clipId ? clipId.slice(0, 8) : ''}
                  </p>
                  <p className="text-text-muted text-xs">
                    9:16 vertical &middot; {current_track.duration_seconds
                      ? `${Math.floor(current_track.duration_seconds / 60)}:${String(Math.floor(current_track.duration_seconds % 60)).padStart(2, '0')}`
                      : '0:10'}
                  </p>
                </div>

                {/* Status badge */}
                <span className="text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20">
                  Ready
                </span>
              </div>

              {/* Mini waveform */}
              <div className="flex items-end gap-[2px] h-8 mt-4">
                {Array.from({ length: 40 }, (_, i) => {
                  const angle = (i / 40) * Math.PI * 2
                  const height = 0.15 + Math.abs(Math.sin(angle * 2.5 + i * 0.3)) * 0.85
                  return (
                    <div
                      key={i}
                      className="flex-1 rounded-full bg-gradient-to-t from-neon-cyan to-neon-purple opacity-60"
                      style={{ height: `${Math.max(10, height * 100)}%` }}
                    />
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Generate button (only when not generating and no result yet) */}
      {!is_generating_video && !videoUrl && !taskError && (
        <button
          onClick={handleGenerate}
          className="w-full btn-primary text-sm flex items-center justify-center gap-2"
        >
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="23 7 16 12 23 17 23 7" />
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
          </svg>
          Generate Video Clip
        </button>
      )}

      {/* Regenerate button (when result exists) */}
      {videoUrl && !is_generating_video && (
        <button
          onClick={handleGenerate}
          className="w-full mt-3 text-xs text-text-muted hover:text-neon-cyan transition-colors py-2 border border-white/5 rounded-xl hover:border-neon-cyan/20"
        >
          Regenerate Clip
        </button>
      )}

      {/* Indeterminate progress animation */}
      <style>{`
        @keyframes progress-indeterminate {
          0% { width: 0%; margin-left: 0%; }
          50% { width: 70%; margin-left: 15%; }
          100% { width: 0%; margin-left: 100%; }
        }
      `}</style>
    </div>
  )
}
