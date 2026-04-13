/**
 * DemoBadge — badge discret signalant qu'une feature est simulée / en bêta.
 *
 * Props :
 *   label    : texte du badge (défaut: 'Démo')
 *   variant  : 'demo' | 'beta' | 'simule'
 *   className: classes supplémentaires
 */
export default function DemoBadge({ label, variant = 'demo', className = '' }) {
  const VARIANTS = {
    demo:   { bg: 'bg-[#FEF3C7]', text: 'text-[#92400E]', dot: '#F59E0B' },
    beta:   { bg: 'bg-[#EFF6FF]', text: 'text-[#1D4ED8]', dot: '#3B82F6' },
    simule: { bg: 'bg-[#F5F5F5]', text: 'text-[#6B7280]', dot: '#9CA3AF' },
  }
  const style = VARIANTS[variant] || VARIANTS.demo
  const displayLabel = label || { demo: 'Démo', beta: 'Bêta', simule: 'Simulé' }[variant]

  return (
    <span
      className={`inline-flex items-center gap-[5px] text-[10px] font-bold px-2 py-[3px] rounded-full ${style.bg} ${style.text} ${className}`}
    >
      <span
        className="w-[6px] h-[6px] rounded-full flex-shrink-0"
        style={{ background: style.dot }}
      />
      {displayLabel}
    </span>
  )
}
