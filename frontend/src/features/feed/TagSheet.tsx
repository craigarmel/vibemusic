import type { InfluenceTag } from '../../types/feed'

const ALL_TAGS: InfluenceTag[] = [
  { tag: 'Plus sombre' },
  { tag: 'Plus de basses', is_trending: true },
  { tag: 'Plus rapide' },
  { tag: 'Electro vibes' },
  { tag: 'Ambient' },
  { tag: 'Voix douce' },
  { tag: 'Hardcore' },
  { tag: 'Melodique' },
  { tag: 'Experimental' },
]

interface TagSheetProps {
  isOpen: boolean
  selectedTag: string | null
  isSending: boolean
  onSelectTag: (tag: string) => void
  onSubmit: () => void
  onClose: () => void
}

export default function TagSheet({
  isOpen,
  selectedTag,
  isSending,
  onSelectTag,
  onSubmit,
  onClose,
}: TagSheetProps) {
  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/60"
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl transition-transform duration-300 ease-out ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{
          height: '40vh',
          backdropFilter: 'blur(30px)',
          background: 'rgba(15, 15, 20, 0.85)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderBottom: 'none',
          boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.5)',
        }}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        {/* Title */}
        <div className="px-6 pb-4">
          <h3 className="text-white font-bold text-lg">Oriente le prochain son</h3>
          <p className="text-text-muted text-xs mt-1">Choisis un tag pour influencer l'artiste</p>
        </div>

        {/* Tag grid — 3 columns */}
        <div className="px-6 grid grid-cols-3 gap-3">
          {ALL_TAGS.map(({ tag, is_trending }) => {
            const isSelected = selectedTag === tag

            let borderStyle: string
            let bgStyle: string
            let textColor: string

            if (isSelected) {
              borderStyle = 'border-transparent'
              bgStyle =
                'linear-gradient(135deg, rgba(0, 240, 255, 0.3) 0%, rgba(139, 92, 246, 0.3) 100%)'
              textColor = 'text-white'
            } else if (is_trending) {
              borderStyle = 'border-neon-magenta/50'
              bgStyle = 'rgba(255, 255, 255, 0.04)'
              textColor = 'text-neon-magenta'
            } else {
              borderStyle = 'border-neon-cyan/30'
              bgStyle = 'rgba(255, 255, 255, 0.04)'
              textColor = 'text-neon-cyan'
            }

            return (
              <button
                key={tag}
                onClick={() => onSelectTag(tag)}
                className={`px-3 py-2.5 rounded-full border text-xs font-semibold tracking-wide transition-all duration-200 ${borderStyle} ${textColor}`}
                style={{
                  background: bgStyle,
                  boxShadow: isSelected
                    ? '0 0 15px rgba(0, 240, 255, 0.2)'
                    : is_trending
                    ? '0 0 10px rgba(255, 0, 170, 0.1)'
                    : 'none',
                }}
              >
                {is_trending && !isSelected && (
                  <span className="mr-1 text-[10px]">&#9650;</span>
                )}
                {tag}
              </button>
            )
          })}
        </div>

        {/* Submit button */}
        <div className="px-6 mt-5">
          <button
            onClick={onSubmit}
            disabled={!selectedTag || isSending}
            className="w-full py-3 rounded-full font-bold text-sm text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: selectedTag
                ? 'linear-gradient(135deg, #ff00aa 0%, #8b5cf6 100%)'
                : 'rgba(255, 255, 255, 0.08)',
              boxShadow: selectedTag
                ? '0 0 20px rgba(255, 0, 170, 0.3)'
                : 'none',
            }}
          >
            {isSending ? 'Envoi...' : 'Envoyer mon influence'}
          </button>
        </div>
      </div>
    </>
  )
}
