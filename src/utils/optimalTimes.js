/**
 * Horaires optimaux de publication par type de cuisine et plateforme.
 * Basé sur les données 2026 de l'industrie food/restaurant sur les réseaux sociaux.
 * Format slot : "day_hour" — day = lun/mar/mer/jeu/ven/sam/dim, hour = HH
 */

// Matrice : cuisine → plateforme → top 3 créneaux
const OPTIMAL_TIMES = {
  default: {
    instagram: ['mar_11', 'mer_18', 'jeu_13'],
    tiktok:    ['lun_19', 'mer_12', 'ven_18'],
    facebook:  ['mer_13', 'jeu_11', 'sam_10'],
  },
  italienne: {
    instagram: ['mar_12', 'jeu_19', 'sam_11'],
    tiktok:    ['mer_18', 'ven_19', 'dim_13'],
    facebook:  ['jeu_12', 'sam_11', 'dim_10'],
  },
  francaise: {
    instagram: ['mar_11', 'jeu_13', 'sam_12'],
    tiktok:    ['lun_18', 'mer_19', 'ven_17'],
    facebook:  ['mer_12', 'ven_11', 'dim_11'],
  },
  japonaise: {
    instagram: ['mer_12', 'ven_18', 'sam_13'],
    tiktok:    ['mar_19', 'jeu_18', 'sam_20'],
    facebook:  ['mar_12', 'jeu_13', 'sam_12'],
  },
  burger: {
    instagram: ['lun_11', 'jeu_18', 'ven_19'],
    tiktok:    ['mar_18', 'jeu_19', 'ven_20'],
    facebook:  ['mer_13', 'ven_12', 'sam_11'],
  },
  pizza: {
    instagram: ['mar_11', 'jeu_18', 'ven_19'],
    tiktok:    ['mer_18', 'ven_19', 'sam_20'],
    facebook:  ['mer_12', 'sam_12', 'dim_12'],
  },
  vegetarien: {
    instagram: ['lun_10', 'mer_11', 'ven_10'],
    tiktok:    ['mar_18', 'jeu_17', 'dim_12'],
    facebook:  ['mar_11', 'jeu_10', 'sam_10'],
  },
  mediterraneen: {
    instagram: ['mar_12', 'jeu_13', 'sam_13'],
    tiktok:    ['mer_19', 'ven_18', 'dim_14'],
    facebook:  ['mer_13', 'ven_12', 'sam_12'],
  },
}

// Jours courts pour l'affichage
const DAY_LABEL = {
  lun: 'Lun', mar: 'Mar', mer: 'Mer', jeu: 'Jeu',
  ven: 'Ven', sam: 'Sam', dim: 'Dim',
}

// Conversion slot → Date ISO du prochain occurrence
export function slotToNextISO(slot) {
  const [day, hour] = slot.split('_')
  const DAYS = { lun: 1, mar: 2, mer: 3, jeu: 4, ven: 5, sam: 6, dim: 0 }
  const targetDow = DAYS[day]
  const h = parseInt(hour, 10)

  const now = new Date()
  const todayDow = now.getDay()
  let daysAhead = targetDow - todayDow
  if (daysAhead < 0) daysAhead += 7
  // Si c'est aujourd'hui mais l'heure est passée, aller à la semaine suivante
  if (daysAhead === 0 && now.getHours() >= h) daysAhead = 7

  const d = new Date(now)
  d.setDate(now.getDate() + daysAhead)
  d.setHours(h, 0, 0, 0)
  return d.toISOString()
}

/** Retourne le libellé lisible d'un slot : "Mar 11h" */
export function slotLabel(slot) {
  const [day, hour] = slot.split('_')
  return `${DAY_LABEL[day]} ${hour}h`
}

/**
 * Retourne les 3 meilleurs créneaux pour une combinaison cuisine/plateforme.
 * @param {string[]} cuisineTypes — tableau de cuisines (ex: ['Italienne'])
 * @param {string} platform — 'instagram' | 'tiktok' | 'facebook'
 */
export function getOptimalSlots(cuisineTypes = [], platform = 'instagram') {
  const plat = platform.toLowerCase()
  // Trouver la matrice la plus précise parmi les cuisines déclarées
  const normalizedCuisines = cuisineTypes.map((c) =>
    c.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z]/g, '')
  )
  for (const c of normalizedCuisines) {
    if (OPTIMAL_TIMES[c]?.[plat]) return OPTIMAL_TIMES[c][plat]
  }
  return OPTIMAL_TIMES.default[plat] || OPTIMAL_TIMES.default.instagram
}
