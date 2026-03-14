import { useEffect, useRef, useState, useCallback } from 'react'
import type { FeedItem } from '../../types/feed'
import InfluenceButton from './InfluenceButton'

interface FeedCardProps {
  item: FeedItem
  isActive: boolean
  onInfluenceClick: () => void
}

export default function FeedCard({ item, isActive, onInfluenceClick }: FeedCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(item.likes)
  const [isPaused, setIsPaused] = useState(false)

  // Auto-play/pause based on visibility
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    if (isActive) {
      video.play().catch(() => {
        // Autoplay may be blocked — user interaction required
      })
      setIsPaused(false)
    } else {
      video.pause()
      video.currentTime = 0
    }
  }, [isActive])

  // Tap to pause/play
  const handleVideoTap = useCallback(() => {
    const video = videoRef.current
    if (!video) return

    if (video.paused) {
      video.play().catch(() => {})
      setIsPaused(false)
    } else {
      video.pause()
      setIsPaused(true)
    }
  }, [])

  const handleLike = useCallback(() => {
    setLiked((prev) => !prev)
    setLikeCount((prev) => (liked ? prev - 1 : prev + 1))
  }, [liked])

  const handleShare = useCallback(() => {
    if (navigator.share) {
      navigator.share({
        title: `${item.artist_name} — ${item.track_title}`,
        text: `Check out ${item.track_title} by ${item.artist_name} on Synthetica`,
        url: window.location.href,
      }).catch(() => {})
    }
  }, [item.artist_name, item.track_title])

  const handleArtistTap = useCallback(() => {
    // Mock navigation for hackathon — would go to /artist/:id
    console.log(`Navigate to artist: ${item.artist_id}`)
  }, [item.artist_id])

  const isAudioOnly = item.video_url?.endsWith('.wav') || item.video_url?.endsWith('.mp3') || !item.video_url

  return (
    <div className="relative h-full w-full bg-black flex items-center justify-center overflow-hidden">
      {/* Background: avatar as cover when audio-only */}
      {isAudioOnly && item.artist_avatar_url && (
        <div className="absolute inset-0">
          <img
            src={item.artist_avatar_url}
            alt=""
            className="w-full h-full object-cover blur-2xl scale-110 opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/80" />
          {/* Centered avatar */}
          <div className="absolute inset-0 flex items-center justify-center">
            <img
              src={item.artist_avatar_url}
              alt={item.artist_name}
              className="w-48 h-48 rounded-full object-cover neon-border"
              style={{ boxShadow: '0 0 40px rgba(0, 240, 255, 0.3), 0 0 80px rgba(0, 240, 255, 0.1)' }}
            />
          </div>
        </div>
      )}

      {/* Background: gradient fallback when no avatar */}
      {isAudioOnly && !item.artist_avatar_url && (
        <div className="absolute inset-0 bg-gradient-to-br from-neon-purple/30 via-bg-dark to-neon-cyan/20" />
      )}

      {/* Video/Audio element */}
      <video
        ref={videoRef}
        src={item.video_url}
        className={`absolute inset-0 w-full h-full object-cover ${isAudioOnly ? 'opacity-0' : ''}`}
        loop
        playsInline
        preload="metadata"
        onClick={handleVideoTap}
      />

      {/* Pause indicator */}
      {isPaused && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="w-20 h-20 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
            <svg className="w-10 h-10 text-white ml-1" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      )}

      {/* Right-side action buttons */}
      <div className="absolute right-3 bottom-32 flex flex-col items-center gap-5 z-20">
        {/* Heart / Like button */}
        <button
          onClick={handleLike}
          className="flex flex-col items-center gap-1 group"
          aria-label="Like"
        >
          <div className="w-11 h-11 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center transition-all group-active:scale-90">
            {liked ? (
              <svg className="w-6 h-6 text-neon-magenta" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            )}
          </div>
          <span className="text-white text-xs font-semibold">{likeCount}</span>
        </button>

        {/* Share button */}
        <button
          onClick={handleShare}
          className="flex flex-col items-center gap-1 group"
          aria-label="Share"
        >
          <div className="w-11 h-11 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center transition-all group-active:scale-90">
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
              <polyline points="16 6 12 2 8 6" />
              <line x1="12" y1="2" x2="12" y2="15" />
            </svg>
          </div>
          <span className="text-white text-xs font-semibold">Share</span>
        </button>

        {/* Influence button — larger, prominent */}
        <div className="flex flex-col items-center gap-1">
          <InfluenceButton onClick={onInfluenceClick} />
          <span className="text-neon-magenta text-[10px] font-semibold tracking-wide">Influence</span>
        </div>
      </div>

      {/* Bottom overlay — artist info */}
      <div className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none">
        <div
          className="px-4 pb-6 pt-24"
          style={{
            background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.6) 50%, transparent 100%)',
          }}
        >
          {/* Artist row */}
          <button
            onClick={handleArtistTap}
            className="flex items-center gap-3 mb-2 pointer-events-auto"
          >
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full border-2 border-neon-cyan overflow-hidden flex-shrink-0 bg-white/10">
              {item.artist_avatar_url ? (
                <img
                  src={item.artist_avatar_url}
                  alt={item.artist_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-neon-cyan text-sm font-bold">
                  {item.artist_name.charAt(0)}
                </div>
              )}
            </div>

            {/* Name */}
            <span className="text-white font-bold text-sm">
              @{item.artist_name.toLowerCase().replace(/\s+/g, '_')}
            </span>
          </button>

          {/* Track info */}
          <p className="text-white text-base font-medium mb-1 pl-[52px]">
            {item.track_title}
          </p>

          {/* Duration */}
          <div className="flex items-center gap-1.5 pl-[52px]">
            {/* Waveform icon */}
            <svg className="w-4 h-4 text-text-muted" viewBox="0 0 24 24" fill="currentColor">
              <rect x="2" y="9" width="3" height="6" rx="1" />
              <rect x="7" y="5" width="3" height="14" rx="1" />
              <rect x="12" y="7" width="3" height="10" rx="1" />
              <rect x="17" y="3" width="3" height="18" rx="1" />
            </svg>
            <span className="text-text-muted text-xs">{item.duration}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
