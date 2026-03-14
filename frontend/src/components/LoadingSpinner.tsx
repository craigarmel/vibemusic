interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
}

const sizes = {
  sm: 'w-5 h-5 border-2',
  md: 'w-8 h-8 border-2',
  lg: 'w-12 h-12 border-[3px]',
}

export default function LoadingSpinner({ size = 'md' }: LoadingSpinnerProps) {
  return (
    <div
      className={`${sizes[size]} rounded-full border-neon-cyan/30 border-t-neon-cyan animate-spin`}
      style={{ boxShadow: '0 0 15px rgba(0, 240, 255, 0.3)' }}
    />
  )
}
