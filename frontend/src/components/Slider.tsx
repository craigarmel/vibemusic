interface SliderProps {
  label: string
  value: number
  min?: number
  max?: number
  step?: number
  onChange: (value: number) => void
  displayValue?: string
}

export function Slider({
  label,
  value,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  displayValue,
}: SliderProps) {
  const percentage = ((value - min) / (max - min)) * 100

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <label className="text-sm text-text-muted uppercase tracking-wider">
          {label}
        </label>
        <span className="text-sm font-mono text-neon-cyan font-semibold">
          {displayValue ?? value}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, #00f0ff ${percentage}%, rgba(255,255,255,0.1) ${percentage}%)`,
        }}
      />
    </div>
  )
}

export default Slider
