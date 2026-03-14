interface InfluenceButtonProps {
  onClick: () => void
}

export default function InfluenceButton({ onClick }: InfluenceButtonProps) {
  return (
    <button
      onClick={onClick}
      className="relative flex items-center justify-center w-14 h-14 rounded-full transition-transform active:scale-90"
      style={{
        background: 'linear-gradient(135deg, #ff00aa 0%, #8b5cf6 100%)',
        boxShadow:
          '0 0 20px rgba(255, 0, 170, 0.4), 0 0 40px rgba(255, 0, 170, 0.2), 0 0 60px rgba(139, 92, 246, 0.15)',
      }}
      aria-label="Influence this artist"
    >
      {/* Lightning bolt icon */}
      <svg
        className="w-7 h-7 text-white drop-shadow-lg"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>

      {/* Pulse ring animation */}
      <span
        className="absolute inset-0 rounded-full animate-ping opacity-20"
        style={{
          background: 'linear-gradient(135deg, #ff00aa 0%, #8b5cf6 100%)',
        }}
      />
    </button>
  )
}
