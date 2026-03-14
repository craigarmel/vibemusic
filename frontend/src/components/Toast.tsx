import { useEffect, useState } from 'react'

interface ToastProps {
  message: string
  type?: 'success' | 'error'
  onClose: () => void
  duration?: number
}

export default function Toast({
  message,
  type = 'success',
  onClose,
  duration = 3000,
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onClose, 300)
    }, duration)
    return () => clearTimeout(timer)
  }, [duration, onClose])

  const borderColor =
    type === 'success' ? 'border-neon-cyan/50' : 'border-neon-magenta/50'
  const glowColor =
    type === 'success'
      ? '0 0 20px rgba(0, 240, 255, 0.2)'
      : '0 0 20px rgba(255, 0, 170, 0.2)'

  return (
    <div
      className={`fixed top-6 right-6 z-50 glass rounded-xl px-5 py-3 border ${borderColor} transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
      }`}
      style={{ boxShadow: glowColor }}
    >
      <div className="flex items-center gap-3">
        <span
          className={`text-sm ${
            type === 'success' ? 'text-neon-cyan' : 'text-neon-magenta'
          }`}
        >
          {type === 'success' ? '✓' : '✕'}
        </span>
        <span className="text-sm text-white">{message}</span>
      </div>
    </div>
  )
}
