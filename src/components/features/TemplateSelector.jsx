import { motion } from 'framer-motion'
import { RESTAURANT_TEMPLATES } from '../../utils/shotstackTemplates'

/**
 * TemplateSelector — étape 2 du Studio.
 * Affiche 5 cartes visuelles de templates restaurant.
 * Props :
 *  - selected : id du template sélectionné (ou null)
 *  - onSelect : (templateId) => void
 *  - onBack   : () => void
 *  - onContinue : () => void (activé quand un template est choisi)
 */
export default function TemplateSelector({ selected, onSelect, onBack, onContinue }) {
  return (
    <div className="space-y-5">
      {/* Intro */}
      <div className="text-center">
        <h2 className="text-[18px] font-[800] text-pc-ink tracking-[-0.03em]">
          Choisis ton format
        </h2>
        <p className="text-[13px] text-pc-ink-3 mt-1">
          Le Chef IA adapte le montage selon le format choisi
        </p>
      </div>

      {/* Grid de templates */}
      <div className="grid grid-cols-1 gap-3">
        {RESTAURANT_TEMPLATES.map((tpl, i) => {
          const isActive = selected === tpl.id
          return (
            <motion.button
              key={tpl.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: i * 0.05 }}
              onClick={() => onSelect(tpl.id)}
              className={`w-full rounded-card border text-left transition-all overflow-hidden ${
                isActive
                  ? 'border-pc-green shadow-[0_0_0_2px] shadow-pc-green/20'
                  : 'border-pc-border hover:border-pc-ink-3'
              }`}
            >
              <div className="flex items-stretch">
                {/* Bande colorée (gradient du template) */}
                <div
                  className={`w-1.5 flex-shrink-0 bg-gradient-to-b ${tpl.preview.bg}`}
                />

                {/* Contenu */}
                <div className="flex-1 px-4 py-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[20px]">{tpl.emoji}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[14px] font-[800] text-pc-ink">
                            {tpl.name}
                          </span>
                          {tpl.badge && (
                            <span className="text-[9px] font-black tracking-[0.07em] text-pc-green">
                              {tpl.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-pc-ink-3 leading-snug mt-0.5">
                          {tpl.tagline}
                        </p>
                      </div>
                    </div>

                    {/* Durée + check */}
                    <div className="flex-shrink-0 flex flex-col items-end gap-1">
                      <span className="text-[11px] font-bold text-pc-ink-3 bg-pc-bg border border-pc-border px-2 py-px rounded-full">
                        {tpl.duration}
                      </span>
                      {isActive && (
                        <span className="text-[10px] font-black text-pc-green">✓</span>
                      )}
                    </div>
                  </div>

                  {/* Mini caption preview */}
                  <div className="mt-2 flex gap-1 items-center flex-wrap">
                    <span className="text-[10px] text-pc-ink-4">Captions :</span>
                    {tpl.preview.captionDemo.map((word, wi) => (
                      <span
                        key={wi}
                        className={`text-[10px] font-bold px-1.5 py-px rounded-[3px] ${tpl.preview.textColor} bg-gradient-to-r ${tpl.preview.bg}`}
                      >
                        {word}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.button>
          )
        })}
      </div>

      {/* Navigation */}
      <div className="flex gap-3 pt-1">
        <button
          onClick={onBack}
          className="flex-1 py-[11px] rounded-btn text-[13px] font-semibold text-pc-ink-3 border border-pc-border bg-pc-surface hover:border-pc-ink-4 transition-colors"
        >
          Retour
        </button>
        <button
          onClick={onContinue}
          disabled={!selected}
          className="flex-[2] py-[11px] rounded-btn text-[13px] font-bold text-white bg-pc-ink hover:bg-pc-ink-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {selected ? 'Analyser avec l\'IA →' : 'Choisis un format'}
        </button>
      </div>
    </div>
  )
}
