import { getOptimalSlots } from '../../utils/optimalTimes.js'

/**
 * Chips des créneaux optimaux de publication.
 *
 * Props:
 *   platform     – 'Instagram' | 'TikTok' | 'Facebook'
 *   cuisineType  – type de cuisine du restaurant (pour personnaliser les créneaux)
 *   onSelect     – (isoDateTime: string) => void
 *   selected     – isoDateTime actuellement sélectionné (optionnel)
 */
export default function OptimalTimeSuggest({ platform, cuisineType = '', onSelect, selected }) {
  const slots = getOptimalSlots(platform, cuisineType, 3)

  if (!slots.length) return null

  return (
    <div>
      <p className="text-[10px] font-semibold text-pc-ink-4 uppercase tracking-caps mb-[8px]">
        Créneaux recommandés
      </p>
      <div className="flex gap-2 flex-wrap">
        {slots.map((slot) => {
          const isSelected = selected === slot.isoDateTime
          return (
            <button
              key={slot.isoDateTime}
              type="button"
              onClick={() => onSelect(slot.isoDateTime)}
              className={`text-[12px] font-semibold px-3 py-[7px] rounded-pill border transition-all
                ${isSelected
                  ? 'bg-pc-green text-white border-pc-green'
                  : 'bg-pc-bg border-pc-border text-pc-ink-2 hover:border-pc-green hover:text-pc-green'
                }`}
            >
              {slot.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
