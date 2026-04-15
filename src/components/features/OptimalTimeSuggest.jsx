/**
 * OptimalTimeSuggest
 * Affiche les 3 meilleurs créneaux de publication pour une plateforme donnée.
 * Chaque chip est cliquable et met à jour l'heure sélectionnée.
 */
import { getOptimalSlots, slotLabel, slotToNextISO } from '../../utils/optimalTimes.js'

/**
 * @param {object}   props
 * @param {string[]} props.cuisineTypes   — ex: ['Italienne']
 * @param {string}   props.platform       — 'instagram' | 'tiktok' | 'facebook'
 * @param {string}   props.selectedTime   — valeur HH:MM actuellement sélectionnée
 * @param {Function} props.onSelect       — callback(timeHHMM: string)
 */
export default function OptimalTimeSuggest({ cuisineTypes = [], platform = 'instagram', selectedTime, onSelect }) {
  const slots = getOptimalSlots(cuisineTypes, platform)

  return (
    <div>
      <div className="text-[10px] font-semibold text-pc-ink-4 uppercase tracking-caps mb-[8px]">
        Créneaux optimaux
      </div>
      <div className="flex gap-2 flex-wrap">
        {slots.map((slot) => {
          const label    = slotLabel(slot)
          const iso      = slotToNextISO(slot)
          const hhmm     = iso.slice(11, 16)          // "HH:MM" from ISO
          const isActive = selectedTime === hhmm

          return (
            <button
              key={slot}
              type="button"
              onClick={() => onSelect(hhmm)}
              className={`px-3 py-[6px] rounded-pill text-[12px] font-semibold border transition-all
                ${isActive
                  ? 'bg-pc-green text-white border-pc-green'
                  : 'bg-pc-bg border-pc-border text-pc-ink-3 hover:border-pc-green hover:text-pc-green'
                }`}
            >
              {label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
