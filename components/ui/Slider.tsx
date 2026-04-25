"use client";

interface Props {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
}

export function Slider({ value, onChange, min = 10, max = 500, step = 5, label }: Props) {
  const pct = ((value - min) / (max - min)) * 100;

  function decrement() {
    onChange(Math.max(min, value - step));
  }
  function increment() {
    onChange(Math.min(max, value + step));
  }

  return (
    <div className="w-full space-y-2">
      {label && <span className="text-xs font-medium text-stone-500">{label}</span>}

      <div className="flex items-center gap-3">
        {/* Minus button */}
        <button
          onClick={decrement}
          disabled={value <= min}
          aria-label="Decrease portion"
          className="w-8 h-8 flex items-center justify-center rounded-full border-2 border-brand-warm bg-white text-brand-forest font-bold text-lg hover:border-brand-olive hover:bg-brand-sage/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex-shrink-0"
        >
          −
        </button>

        {/* Track + thumb */}
        <div className="relative flex-1 h-6 flex items-center">
          {/* Track background */}
          <div className="absolute inset-x-0 h-2 rounded-full bg-stone-200" />
          {/* Filled portion */}
          <div
            className="absolute left-0 h-2 rounded-full bg-brand-olive transition-all duration-75"
            style={{ width: `${pct}%` }}
          />
          {/* Native input (invisible, handles interaction) */}
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
            aria-label={`Portion size: ${value}g`}
          />
          {/* Custom thumb */}
          <div
            className="absolute w-6 h-6 rounded-full bg-white border-2 border-brand-olive shadow-md pointer-events-none transition-all duration-75 -translate-x-1/2"
            style={{ left: `${pct}%` }}
          />
        </div>

        {/* Plus button */}
        <button
          onClick={increment}
          disabled={value >= max}
          aria-label="Increase portion"
          className="w-8 h-8 flex items-center justify-center rounded-full border-2 border-brand-warm bg-white text-brand-forest font-bold text-lg hover:border-brand-olive hover:bg-brand-sage/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex-shrink-0"
        >
          +
        </button>

        {/* Value badge */}
        <span className="text-sm font-semibold text-brand-forest bg-brand-sage/20 px-3 py-1 rounded-full tabular-nums w-20 text-center flex-shrink-0">
          {value}g
        </span>
      </div>

      {/* Tick marks */}
      <div className="flex justify-between text-xs text-stone-400 px-10">
        <span>{min}g</span>
        <span>{Math.round((min + max) / 2)}g</span>
        <span>{max}g</span>
      </div>
    </div>
  );
}
