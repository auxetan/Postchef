/**
 * Matrice des créneaux optimaux de publication par type de cuisine et plateforme.
 * Source : données food content 2026.
 * Format clé : "<jour>_<heure>" (ex: "mar_10" = mardi 10h)
 */

const OPTIMAL_MATRIX = {
  default: {
    Instagram: ['mar_10', 'mer_18', 'jeu_11', 'ven_12'],
    TikTok:    ['mar_19', 'mer_20', 'jeu_18', 'ven_19'],
    Facebook:  ['mer_13', 'jeu_10', 'ven_14'],
  },
  french: {
    Instagram: ['mar_11', 'mer_18', 'jeu_12', 'sam_10'],
    TikTok:    ['mar_19', 'mer_20', 'ven_18'],
    Facebook:  ['mer_13', 'jeu_11'],
  },
  italian: {
    Instagram: ['mar_10', 'jeu_11', 'ven_13'],
    TikTok:    ['mer_19', 'ven_18', 'sam_19'],
    Facebook:  ['mer_12', 'jeu_10'],
  },
}

const DAY_LABELS = {
  lun: 'Lun', mar: 'Mar', mer: 'Mer',
  jeu: 'Jeu', ven: 'Ven', sam: 'Sam', dim: 'Dim',
}

// 0 = Dimanche (JS), 1 = Lundi…
const DAY_DOW = {
  lun: 1, mar: 2, mer: 3, jeu: 4, ven: 5, sam: 6, dim: 0,
}

function guessTypeKey(cuisineType) {
  const s = (cuisineType || '').toLowerCase()
  if (s.includes('fran') || s.includes('brasserie') || s.includes('bistro')) return 'french'
  if (s.includes('ital') || s.includes('pizza') || s.includes('pasta')) return 'italian'
  return 'default'
}

/**
 * Retourne les N meilleurs créneaux pour une plateforme et un type de cuisine.
 * @returns {{ label: string, isoDateTime: string, dayKey: string, hour: number }[]}
 */
export function getOptimalSlots(platform, cuisineType = '', maxSlots = 3) {
  const typeKey = guessTypeKey(cuisineType)
  const matrix  = OPTIMAL_MATRIX[typeKey]?.[platform] ?? OPTIMAL_MATRIX.default[platform] ?? []
  const slots   = matrix.slice(0, maxSlots)

  return slots.map((slot) => {
    const [dayKey, hourStr] = slot.split('_')
    const hour   = parseInt(hourStr, 10)
    const label  = `${DAY_LABELS[dayKey] ?? dayKey} ${hour}h`

    const today      = new Date()
    const targetDow  = DAY_DOW[dayKey] ?? 1
    const todayDow   = today.getDay()
    const daysUntil  = ((targetDow - todayDow + 7) % 7) || 7

    const d = new Date(today)
    d.setDate(today.getDate() + daysUntil)
    d.setHours(hour, 0, 0, 0)

    return { label, isoDateTime: d.toISOString(), dayKey, hour }
  })
}
