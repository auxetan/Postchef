/**
 * EmptyState — affiche un état vide cohérent avec icône, titre, description et CTA.
 *
 * Règle produit :
 *   état vide = ce qu'on va obtenir + bouton principal
 *
 * Props :
 *   icon        : ReactNode (SVG ou emoji)
 *   title       : string — titre court
 *   description : string — explication de ce qui manque
 *   action      : { label, onClick } — bouton CTA principal
 *   secondary   : { label, onClick } — lien secondaire optionnel
 *   compact     : bool — version compacte (sans padding vertical important)
 */
export default function EmptyState({ icon, title, description, action, secondary, compact = false }) {
  return (
    <div className={`text-center ${compact ? 'py-8' : 'py-16'}`}>
      {icon && (
        <div className="w-12 h-12 rounded-full bg-pc-bg flex items-center justify-center mx-auto mb-4 border border-pc-border">
          {icon}
        </div>
      )}
      {title && (
        <p className="text-[15px] font-bold text-pc-ink mb-[6px]">{title}</p>
      )}
      {description && (
        <p className="text-[12px] text-pc-ink-3 leading-[1.6] max-w-[220px] mx-auto mb-5">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="inline-flex items-center gap-[6px] bg-pc-ink text-white text-[12px] font-bold px-4 py-[9px] rounded-pill hover:opacity-90 transition-opacity"
        >
          {action.label}
        </button>
      )}
      {secondary && (
        <button
          onClick={secondary.onClick}
          className="block mx-auto mt-3 text-[11px] font-semibold text-pc-green hover:opacity-70 transition-opacity"
        >
          {secondary.label}
        </button>
      )}
    </div>
  )
}
