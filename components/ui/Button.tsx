import { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: "sm" | "md" | "lg";
}

const VARIANTS: Record<Variant, string> = {
  primary:   "bg-brand-olive text-white hover:bg-brand-forest active:bg-brand-forest",
  secondary: "bg-brand-cream border border-brand-warm text-brand-forest hover:bg-brand-sage/20",
  ghost:     "text-brand-forest hover:bg-brand-sage/20",
  danger:    "text-red-600 hover:bg-red-50",
};

const SIZES = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

export function Button({ variant = "primary", size = "md", className = "", children, ...props }: Props) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
