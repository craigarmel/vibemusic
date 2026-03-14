import { generateAvatar } from '../../api/artist'
import { useStudioStore } from '../../stores/useStudioStore'
import LoadingSpinner from '../../components/LoadingSpinner'

export default function AvatarGenerator() {
  const {
    artist,
    is_generating_image,
    setGeneratingImage,
    updateArtist,
    setError,
  } = useStudioStore()

  if (!artist) return null

  const handleGenerate = async () => {
    setGeneratingImage(true)
    setError(null)

    try {
      const res = await generateAvatar(artist.artist_id)
      if (res.data) {
        updateArtist({ avatar_url: res.data.avatar_url })
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to generate avatar'
      )
    } finally {
      setGeneratingImage(false)
    }
  }

  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-neon-cyan">◈</span>
        <h2 className="text-lg font-bold text-white">Character Consistency</h2>
      </div>

      <div className="flex flex-col items-center gap-4">
        {/* Avatar display */}
        <div className="relative">
          {artist.avatar_url ? (
            <img
              src={artist.avatar_url}
              alt={artist.lore?.name || 'Artist Avatar'}
              className="w-48 h-48 rounded-full object-cover neon-border"
              style={{
                boxShadow:
                  '0 0 30px rgba(0, 240, 255, 0.2), 0 0 60px rgba(0, 240, 255, 0.1)',
              }}
            />
          ) : (
            <div
              className="w-48 h-48 rounded-full bg-white/5 border-2 border-dashed border-neon-cyan/30 flex items-center justify-center"
            >
              {is_generating_image ? (
                <LoadingSpinner size="lg" />
              ) : (
                <div className="text-center">
                  <div className="text-4xl text-neon-cyan/30 mb-2">◇</div>
                  <span className="text-xs text-text-muted">No avatar yet</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Genre tags from lore */}
        {artist.lore && (
          <div className="flex gap-2 flex-wrap justify-center">
            {artist.lore.personality_traits.slice(0, 3).map((trait, i) => (
              <span
                key={i}
                className="text-[10px] uppercase tracking-wider px-3 py-1 rounded-full border border-neon-cyan/30 text-neon-cyan"
              >
                {trait}
              </span>
            ))}
          </div>
        )}

        {/* Generate button */}
        <button
          onClick={handleGenerate}
          disabled={is_generating_image}
          className={`w-full flex items-center justify-center gap-2 text-sm font-semibold py-2.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
            artist.avatar_url
              ? 'border border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/10'
              : 'btn-primary'
          }`}
        >
          {is_generating_image ? (
            <>
              <LoadingSpinner size="sm" />
              Generating...
            </>
          ) : artist.avatar_url ? (
            '↻ Regenerate Avatar'
          ) : (
            '✦ Generate Avatar'
          )}
        </button>
      </div>
    </div>
  )
}
