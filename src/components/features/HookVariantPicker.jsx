/**
 * Sélecteur A/B/C de variantes de hook.
 * Affiche 3 hooks générés par l'IA avec leur type, score et justification.
 * L'utilisateur sélectionne le hook qu'il préfère — cela met à jour editHook.
 */

const LETTERS = ['A', 'B', 'C']

function scoreColor(score) {
  if (score > 80) return 'text-pc-green'
  if (score >= 60) return 'text-[#D97706]'
  return 'text-pc-ink-3'
}

export default function HookVariantPicker({ variants, selectedHook, onSelect }) {
  if (!variants?.length) return null

  return (
    <div className="bg-pc-surface border border-pc-border rounded-card px-5 py-5">
      <div className="pc-section-label mb-3">Choisis ton hook</div>
      <div className="space-y-2">
        {variants.slice(0, 3).map((variant, i) => {
          const isSelected = selectedHook === variant.hook_text
          const letter = LETTERS[i] || String(i + 1)

          return (
            <button
              key={i}
              onClick={() => onSelect(variant)}
              className={`w-full flex items-start gap-3 p-3 rounded-btn border transition-colors text-left ${
                isSelected
                  ? 'border-2 border-pc-green bg-pc-green-light'
                  : 'border border-pc-border bg-pc-surface hover:bg-pc-bg'
              }`}
            >
              {/* Lettre */}
              <div className="w-6 h-6 rounded-full bg-pc-ink text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-px">
                {letter}
              </div>

              {/* Contenu */}
              <div className="flex-1 min-w-0">
                <p className="text-[16px] font-[800] tracking-[-0.02em] text-pc-ink leading-tight">
                  {variant.hook_text}
                </p>
                <p className="text-[11px] text-pc-ink-3 mt-0.5">
                  {variant.hook_type?.replace(/_/g, ' ')}
                  {variant.reason ? ` · ${variant.reason}` : ''}
                </p>
              </div>

              {/* Score */}
              {variant.virality_score && (
                <span className={`text-[20px] font-[800] shrink-0 ${scoreColor(variant.virality_score)}`}>
                  {variant.virality_score}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
