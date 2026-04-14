import { PC_GREEN } from '../../utils/colors.js'
/**
 * Spinner — indicateur de chargement cohérent.
 *
 * Props :
 *   size    : 'sm' | 'md' | 'lg' (défaut: 'md')
 *   color   : couleur CSS du spinner (défaut: pc-green)
 *   label   : texte aria pour l'accessibilité
 */
export default function Spinner({ size = 'md', color = PC_GREEN, label = 'Chargement…' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-7 h-7', lg: 'w-10 h-10' }
  return (
    <div
      role="status"
      aria-label={label}
      className={`${sizes[size]} rounded-full animate-spin flex-shrink-0`}
      style={{ border: '2px solid #E8E8E6', borderTopColor: color }}
    />
  )
}

/**
 * SpinnerPage — spinner centré pleine hauteur.
 */
export function SpinnerPage({ label }) {
  return (
    <div className="flex items-center justify-center min-h-[200px]" aria-live="polite">
      <div className="text-center">
        <Spinner size="lg" />
        {label && <p className="text-[12px] text-pc-ink-4 mt-3 font-medium">{label}</p>}
      </div>
    </div>
  )
}
