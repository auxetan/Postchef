import { PC_GREEN } from '../../utils/colors.js'
/**
 * LogoMark — icône PostChef (toque + bulle) en SVG inline.
 * Usage : <LogoMark size={28} /> ou <LogoMark className="h-8 w-8" />
 *
 * Combiné avec le wordmark "PostChef" pour le combo logo :
 *   <LogoWordmark />
 */

export function LogoMark({ size = 28, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Toque — 3 dômes charcoal */}
      <circle cx="10" cy="13" r="5.5" fill="#1C1C1A" />
      <circle cx="16" cy="10.5" r="6.5" fill="#1C1C1A" />
      <circle cx="22" cy="13" r="5.5" fill="#1C1C1A" />
      {/* Bandeau de toque */}
      <rect x="5" y="16" width="22" height="5" rx="1.5" fill="#1C1C1A" />
      {/* Bulle de discours — vert PostChef */}
      <rect x="6" y="19" width="20" height="11" rx="2.5" fill={PC_GREEN} />
      {/* Queue de bulle */}
      <path d="M10 30 L7.5 34 L14 30Z" fill={PC_GREEN} />
    </svg>
  )
}

/** Combo icône + wordmark horizontal */
export function LogoWordmark({ iconSize = 28, textSize = 18, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-[7px] ${className}`}>
      <LogoMark size={iconSize} />
      <span
        style={{ fontSize: textSize, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1 }}
        className="text-pc-ink"
      >
        Post<span className="text-pc-green">Chef</span>
      </span>
    </span>
  )
}

export default LogoMark
