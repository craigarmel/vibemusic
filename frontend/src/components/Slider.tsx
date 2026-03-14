import type { ChangeEvent } from "react";

interface SliderProps {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
}

export function Slider({ label, min, max, step, value, onChange }: SliderProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(Number(event.target.value));
  };

  return (
    <label className="flex flex-col gap-2 text-sm text-white/80">
      <span className="flex items-center justify-between uppercase tracking-[0.2em] text-[11px]">
        <span>{label}</span>
        <span className="font-mono text-cyan-300">{value}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange}
        className="accent-cyan-300"
      />
    </label>
  );
}
