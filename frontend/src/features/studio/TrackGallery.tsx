import { useRef, useState } from 'react'
import type { TrackRecord } from '../../types/studio'

interface TrackGalleryProps {
  tracks: TrackRecord[]
}

function formatDuration(seconds: number) {
  const min = Math.floor(seconds / 60)
  const sec = Math.floor(seconds % 60)
  return `${min}:${String(sec).padStart(2, '0')}`
}

function MiniWaveform({ seed }: { seed: number }) {
  const bars = Array.from({ length: 24 }, (_, i) => {
    const angle = (i / 24) * Math.PI * 2
    const h = 0.15 + Math.abs(Math.sin(angle * 2 + seed * 0.7 + i * 0.4)) * 0.85
    return h
  })

  return (
    <div className="flex items-end gap-[1.5px] h-6">
      {bars.map((h, i) => (
        <div
          key={i}
          className="flex-1 rounded-full bg-gradient-to-t from-neon-cyan to-neon-purple opacity-50"
          style={{ height: `${Math.max(8, h * 100)}%` }}
        />
      ))}
    </div>
  )
}

export default function TrackGallery({ tracks }: TrackGalleryProps) {
  const [playingId, setPlayingId] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Sort by most recent first
  const sorted = [...tracks].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  const handlePlay = (track: TrackRecord) => {
    // If same track is playing, pause it
    if (playingId === track.track_id && audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
      setPlayingId(null)
      return
    }

    // Stop any current playback
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }

    const audio = new Audio(track.audio_url)
    audio.addEventListener('ended', () => {
      setPlayingId(null)
      audioRef.current = null
    }, { once: true })
    audio.play().catch(() => {
      setPlayingId(null)
    })
    audioRef.current = audio
    setPlayingId(track.track_id)
  }

  if (sorted.length === 0) {
    return (
      <div className="glass rounded-2xl p-8 flex items-center justify-center min-h-[120px]">
        <p className="text-text-muted text-sm">
          No tracks published yet. Start a session to create your first track.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {sorted.map((track, index) => {
        const isActive = playingId === track.track_id
        const influenceCount = track.influences?.length ?? 0

        return (
          <button
            key={track.track_id}
            type="button"
            onClick={() => handlePlay(track)}
            className={`glass rounded-2xl p-4 text-left transition-all hover:border-neon-cyan/20 hover:bg-white/[0.04] group ${
              isActive ? 'neon-border' : ''
            }`}
          >
            {/* Waveform */}
            <MiniWaveform seed={index + 1} />

            {/* Track info */}
            <div className="mt-3 flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">
                  {track.music_prompt || `Track ${track.track_id.slice(0, 8)}`}
                </p>
                <p className="text-text-muted text-xs mt-0.5 font-mono">
                  {formatDuration(track.duration_seconds)}
                </p>
              </div>

              {/* Play indicator */}
              <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                {influenceCount > 0 && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-neon-magenta/15 text-neon-magenta border border-neon-magenta/20">
                    {influenceCount}
                  </span>
                )}
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                    isActive
                      ? 'bg-neon-cyan text-black'
                      : 'bg-white/10 text-white/60 group-hover:bg-white/15'
                  }`}
                >
                  {isActive ? (
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="6" y="4" width="4" height="16" />
                      <rect x="14" y="4" width="4" height="16" />
                    </svg>
                  ) : (
                    <svg className="w-3 h-3 ml-0.5" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                  )}
                </div>
              </div>
            </div>

            {/* Status badge */}
            <div className="mt-2 flex items-center gap-2">
              <span
                className={`text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  track.status === 'published'
                    ? 'bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/15'
                    : 'bg-white/5 text-text-muted border border-white/10'
                }`}
              >
                {track.status}
              </span>
              <span className="text-[10px] text-text-muted">
                {new Date(track.created_at).toLocaleDateString()}
              </span>
            </div>
          </button>
        )
      })}
    </div>
  )
}
