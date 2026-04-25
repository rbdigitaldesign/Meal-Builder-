interface Props {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
}

export function Slider({ value, onChange, min = 10, max = 500, step = 5, label }: Props) {
  return (
    <div className="flex items-center gap-3 w-full">
      {label && <span className="text-xs text-stone-500 whitespace-nowrap">{label}</span>}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1 accent-brand-olive"
        aria-label={`Portion size: ${value}g`}
      />
      <span className="text-sm font-medium text-brand-forest w-14 text-right tabular-nums">
        {value}g
      </span>
    </div>
  );
}
