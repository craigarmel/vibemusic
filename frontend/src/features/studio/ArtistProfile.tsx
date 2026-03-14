import { useEffect } from 'react'
import { useStudioStore } from '../../stores/useStudioStore'
import { useFeedStore } from '../../stores/useFeedStore'
import { getArtistInfluences } from '../../api/feed'
import TrackGallery from './TrackGallery'
import ClipGenerator from './ClipGenerator'

export default function ArtistProfile() {
  const { artist, published_tracks, current_track } = useStudioStore()
  const { artist_influences, setArtistInfluences } = useFeedStore()

  // Fetch fan influences when artist is loaded
  useEffect(() => {
    if (!artist?.artist_id) return
    let cancelled = false

    getArtistInfluences(artist.artist_id)
      .then((res) => {
        if (!cancelled && res.data) {
          setArtistInfluences(res.data)
        }
      })
      .catch(() => {
        // Silently fail — influences are non-critical
      })

    return () => { cancelled = true }
  }, [artist?.artist_id, setArtistInfluences])

  if (!artist || !artist.lore) return null

  const { lore, avatar_url } = artist

  return (
    <div className="max-w-4xl mx-auto">
      {/* Hero section — avatar + name + tags + bio */}
      <div className="flex flex-col items-center text-center mb-10">
        {/* Avatar */}
        <div className="mb-6">
          {avatar_url ? (
            <img
              src={avatar_url}
              alt={lore.name}
              className="w-48 h-48 rounded-full object-cover"
              style={{
                border: '2px solid rgba(0, 240, 255, 0.4)',
                boxShadow:
                  '0 0 30px rgba(0, 240, 255, 0.25), 0 0 60px rgba(0, 240, 255, 0.1), inset 0 0 20px rgba(0, 240, 255, 0.05)',
                animation: 'pulse-glow 3s ease-in-out infinite',
              }}
            />
          ) : (
            <div
              className="w-48 h-48 rounded-full bg-white/5 border-2 border-dashed border-neon-cyan/30 flex items-center justify-center"
            >
              <span className="text-5xl text-neon-cyan/30">◇</span>
            </div>
          )}
        </div>

        {/* Artist name */}
        <h1 className="text-3xl font-bold text-white mb-3">{lore.name}</h1>

        {/* Genre tags */}
        <div className="flex gap-2 mb-4">
          {lore.personality_traits.slice(0, 3).map((trait, i) => (
            <span
              key={i}
              className="text-[10px] uppercase tracking-widest px-4 py-1.5 rounded-full border border-neon-cyan/30 text-neon-cyan font-semibold"
            >
              {trait}
            </span>
          ))}
        </div>

        {/* Bio */}
        <p className="text-text-muted text-sm leading-relaxed max-w-lg">
          {lore.biography.length > 200
            ? lore.biography.slice(0, 200) + '...'
            : lore.biography}
        </p>

        {/* Start New Session CTA */}
        <button className="mt-6 btn-primary flex items-center gap-2 text-sm">
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
          Start New Session
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        <StatCard
          icon="🎙️"
          label="Sessions"
          value={0}
          subtitle="+0 this week"
        />
        <StatCard
          icon="🎵"
          label="Tracks"
          value={published_tracks.length}
          subtitle={`${published_tracks.filter(t => t.status === 'draft').length} Unreleased`}
        />
        <StatCard
          icon="⚡"
          label="Fan Influences"
          value={artist_influences?.total_influences ?? 0}
          subtitle={
            artist_influences && artist_influences.tags.length > 0
              ? `Top: ${artist_influences.tags[0].tag}`
              : '—'
          }
        />
      </div>

      {/* Fan Influence Tags — shown when influences exist */}
      {artist_influences && artist_influences.tags.length > 0 && (
        <div className="mb-10">
          <h2 className="text-lg font-bold text-white mb-4">Fan Influences</h2>
          <div className="glass rounded-2xl p-5">
            <div className="flex flex-wrap gap-2">
              {artist_influences.tags.slice(0, 6).map(({ tag, count }) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold border border-neon-magenta/40 text-neon-magenta"
                  style={{
                    background: 'rgba(255, 0, 170, 0.08)',
                    boxShadow: '0 0 10px rgba(255, 0, 170, 0.1)',
                  }}
                >
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                  </svg>
                  {tag}
                  <span className="text-white/50 text-[10px]">x{count}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Video Clip Generator */}
      {current_track && (
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">Video Clip</h2>
          </div>
          <ClipGenerator />
        </div>
      )}

      {/* Published Tracks */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Published Tracks</h2>
          {published_tracks.length > 0 && (
            <span className="text-xs text-text-muted">
              {published_tracks.length} track{published_tracks.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        <TrackGallery tracks={published_tracks} />
      </div>

      {/* Pulse glow animation */}
      <style>{`
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 30px rgba(0, 240, 255, 0.25), 0 0 60px rgba(0, 240, 255, 0.1); }
          50% { box-shadow: 0 0 40px rgba(0, 240, 255, 0.35), 0 0 80px rgba(0, 240, 255, 0.15); }
        }
      `}</style>
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  subtitle,
}: {
  icon: string
  label: string
  value: number
  subtitle: string
}) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-text-muted text-sm">{label}</span>
        <span>{icon}</span>
      </div>
      <div className="text-3xl font-bold text-neon-cyan font-mono">{value}</div>
      <div className="text-xs text-text-muted mt-1">{subtitle}</div>
    </div>
  )
}
