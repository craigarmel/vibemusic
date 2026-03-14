import { useState } from 'react'
import { createArtist, generateAvatar } from '../../api/artist'
import { useStudioStore } from '../../stores/useStudioStore'
import LoadingSpinner from '../../components/LoadingSpinner'

function traitToWidth(trait: string, index: number): number {
  let hash = index * 31
  for (let i = 0; i < trait.length; i++) {
    hash = ((hash << 5) - hash + trait.charCodeAt(i)) | 0
  }
  return 60 + (Math.abs(hash) % 40)
}

export default function LoreGenerator() {
  const [prompt, setPrompt] = useState('')
  const { artist, is_generating_lore, is_generating_image, setArtist, setGeneratingLore, setGeneratingImage, updateArtist, setError } =
    useStudioStore()

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    setGeneratingLore(true)
    setError(null)

    try {
      const res = await createArtist(prompt)
      if (res.data) {
        const newArtist = {
          artist_id: res.data.artist_id,
          prompt,
          lore: res.data.lore,
          avatar_url: null,
        }
        setArtist(newArtist)
        setGeneratingLore(false)

        // Auto-generate avatar right after lore
        setGeneratingImage(true)
        try {
          const avatarRes = await generateAvatar(res.data.artist_id)
          if (avatarRes.data) {
            updateArtist({ avatar_url: avatarRes.data.avatar_url })
          }
        } catch {
          // Avatar failed but lore is fine — don't block
        } finally {
          setGeneratingImage(false)
        }
        return
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate lore')
    } finally {
      setGeneratingLore(false)
    }
  }

  const isGenerating = is_generating_lore || is_generating_image

  return (
    <div className="space-y-6">
      {/* Prompt input */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-neon-cyan">✦</span>
          <h2 className="text-lg font-bold text-white">Artist Lore & Mood</h2>
        </div>
        <p className="text-text-muted text-sm mb-4">
          Define the narrative DNA of your digital artist. Describe their origins,
          aesthetic, and emotional frequency of their output.
        </p>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., A rogue cyborg busker from the rainy alleys of Neo-Paris. Her music is a blend of melancholic 90s techno and corrupted glitch-pop..."
          className="w-full h-28 bg-white/5 border border-border-subtle rounded-xl px-4 py-3 text-sm text-white placeholder-text-muted/50 resize-none focus:outline-none focus:border-neon-cyan/50 focus:shadow-[0_0_15px_rgba(0,240,255,0.1)] transition-all"
        />
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim()}
          className="mt-4 btn-magenta w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {is_generating_lore ? (
            <>
              <LoadingSpinner size="sm" />
              Generating lore...
            </>
          ) : is_generating_image ? (
            <>
              <LoadingSpinner size="sm" />
              Generating avatar...
            </>
          ) : (
            <>✦ GENERATE ARTIST & LORE</>
          )}
        </button>
      </div>

      {/* Generated lore display */}
      {artist?.lore && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Biography */}
          <div className="glass rounded-2xl p-5">
            <h3 className="text-xs uppercase tracking-widest text-text-muted mb-3">
              Generated Bio
            </h3>
            <p className="text-sm text-white/90 leading-relaxed">
              {artist.lore.biography}
            </p>
          </div>

          {/* Personality Matrix */}
          <div className="glass rounded-2xl p-5">
            <h3 className="text-xs uppercase tracking-widest text-neon-magenta mb-3">
              Personality Matrix
            </h3>
            <div className="space-y-2">
              {artist.lore.personality_traits.map((trait, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-sm text-white">{trait}</span>
                  <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-neon-cyan to-neon-purple rounded-full"
                      style={{ width: `${traitToWidth(trait, i)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Lyrics */}
          <div className="glass rounded-2xl p-5 md:col-span-2">
            <h3 className="text-xs uppercase tracking-widest text-text-muted mb-3">
              Generated Lyrics
            </h3>
            <pre className="text-sm text-white/80 whitespace-pre-wrap font-sans leading-relaxed">
              {artist.lore.lyrics}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}
