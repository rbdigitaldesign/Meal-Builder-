import type { NutrientSummary } from "@/lib/types";

interface Props {
  percentage: number;
  status: NutrientSummary["status"];
  showLabel?: boolean;
  height?: "sm" | "md";
}

const STATUS_COLORS: Record<NutrientSummary["status"], string> = {
  deficient:  "bg-red-500",
  approaching: "bg-amber-400",
  met:        "bg-brand-olive",
  exceeded:   "bg-brand-warm",
};

export function ProgressBar({ percentage, status, showLabel = false, height = "md" }: Props) {
  const clamped = Math.min(percentage, 100);
  const barColor = STATUS_COLORS[status];
  const h = height === "sm" ? "h-1.5" : "h-2.5";

  return (
    <div className="w-full">
      <div className={`w-full ${h} bg-stone-200 rounded-full overflow-hidden`}>
        <div
          className={`${h} ${barColor} rounded-full transition-all duration-300`}
          style={{ width: `${clamped}%` }}
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      {showLabel && (
        <span className="text-xs text-stone-500 mt-0.5 block">
          {percentage}%
        </span>
      )}
    </div>
  );
}
