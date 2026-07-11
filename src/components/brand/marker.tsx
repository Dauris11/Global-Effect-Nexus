/**
 * Firma visual: trazo de marcador (turquesa) que subraya una palabra del
 * titular y se "dibuja" al cargar (animación CSS, ver globals.css). Decorativo
 * — respeta prefers-reduced-motion vía la regla global.
 */
export function Marker({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 300 24"
      fill="none"
      preserveAspectRatio="none"
      aria-hidden="true"
      className={className}
    >
      <path
        className="marker-path"
        d="M5 16 C 60 7, 130 7, 182 12 C 232 17, 268 14, 295 8"
        stroke="var(--brand-teal)"
        strokeWidth="8"
        strokeLinecap="round"
      />
    </svg>
  );
}
