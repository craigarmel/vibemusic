import { useStudioStore } from '../../stores/useStudioStore'

export default function ArtistProfile() {
  const { artist } = useStudioStore()

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
          value={0}
          subtitle="0 Unreleased"
        />
        <StatCard
          icon="⚡"
          label="Fan Influences"
          value={0}
          subtitle="—"
        />
      </div>

      {/* Published Tracks */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Published Tracks</h2>
          <button className="text-xs text-text-muted hover:text-neon-cyan transition-colors">
            View All →
          </button>
        </div>

        <div className="glass rounded-2xl p-8 flex items-center justify-center min-h-[120px]">
          <p className="text-text-muted text-sm">
            No tracks published yet. Start a session to create your first track.
          </p>
        </div>
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
