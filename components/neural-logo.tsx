import { cn } from "@/lib/utils"

export function NeuralLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("text-primary", className)}
      aria-hidden
    >
      <defs>
        <linearGradient id="nb-logo" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="oklch(0.66 0.20 280)" />
          <stop offset="100%" stopColor="oklch(0.78 0.14 295)" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="28" height="28" rx="9" fill="url(#nb-logo)" opacity="0.18" />
      <rect
        x="2.5"
        y="2.5"
        width="27"
        height="27"
        rx="8.5"
        stroke="url(#nb-logo)"
        strokeOpacity="0.55"
      />
      {/* Neural nodes */}
      <circle cx="9" cy="10" r="1.6" fill="url(#nb-logo)" />
      <circle cx="9" cy="22" r="1.6" fill="url(#nb-logo)" />
      <circle cx="16" cy="16" r="2.2" fill="url(#nb-logo)" />
      <circle cx="23" cy="10" r="1.6" fill="url(#nb-logo)" />
      <circle cx="23" cy="22" r="1.6" fill="url(#nb-logo)" />
      <path
        d="M9 10 L16 16 L23 10 M9 22 L16 16 L23 22"
        stroke="url(#nb-logo)"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  )
}
