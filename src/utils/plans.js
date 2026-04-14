import { PC_GREEN, PC_GREEN_DARK, PC_PREMIUM } from './colors.js'
/**
 * Définition des 3 plans PostChef et des features associées.
 * Source de vérité unique — tout le système de gates s'appuie dessus.
 */

export const PLANS = {
  starter: {
    id: 'starter',
    name: 'Starter',
    price: 'Gratuit',
    priceSub: '7 jours',
    monthly: null,
    badge: null,
    color: '#6b7280',
  },
  pro_monthly: {
    id: 'pro_monthly',
    name: 'Pro',
    price: '29€',
    priceSub: '/mois',
    monthly: 29,
    badge: null,
    color: PC_GREEN,
  },
  pro_annual: {
    id: 'pro_annual',
    name: 'Pro Annuel',
    price: '19€',
    priceSub: '/mois',
    monthly: 19,
    badge: 'Recommandé · -35%',
    color: PC_GREEN_DARK,
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    price: '99€',
    priceSub: '/mois',
    monthly: 99,
    badge: 'Tout illimité · Chef IA',
    color: PC_PREMIUM,
  },
}

/**
 * Coûts API réels par feature (référence interne, ne pas afficher à l'utilisateur).
 *
 * Claude Haiku 4.5 : $0.80/MTok input · $4.00/MTok output
 * Claude Haiku 4.5 Vision : $0.80/MTok input (image ~1800 tok) · $4.00/MTok output
 * DALL-E 3 standard 1024×1024 : $0.040/image
 *
 * ── Estimation coût MAX mensuel par utilisateur ──────────────────────────
 *
 * Starter (5 idées/sem, 5 légendes/mois, rest gated) :
 *   Idées IA  : 4 × $0.005  = $0.020
 *   Légendes  : 5 × $0.002  = $0.010
 *   → Total max ~$0.03/mois | Prix : gratuit (trial 7j)
 *
 * Pro Mensuel (€29/mois) — quotas : 20 idées/sem, 30 scripts, 30 légendes, 5 brain :
 *   Idées     : 8  × $0.005   = $0.040
 *   Scripts   : 30 × $0.0025  = $0.075
 *   Légendes  : 30 × $0.002   = $0.060
 *   RestoBrain: 5  × $0.004   = $0.020
 *   Menu IA   : 1  × $0.003   = $0.003
 *   → Total max ~$0.20/mois | Prix : €29/mois (~$31.70) | Marge ~99.4%
 *
 * Pro Annuel (€19/mois) — illimité sauf DishPhoto 30/mois :
 *   Idées     : 30 × $0.005  = $0.150
 *   Scripts   : 40 × $0.0025 = $0.100
 *   Légendes  : 30 × $0.002  = $0.060
 *   RestoBrain: 20 × $0.004  = $0.080
 *   DishPhoto : 30 × $0.040  = $1.200  ← risque principal
 *   Menu IA   : 2  × $0.003  = $0.006
 *   → Total max ~$1.60/mois | Prix : €19/mois (~$20.80) | Marge ~92.3%
 *
 * Seuil d'alerte : DALL-E reste le seul vrai risque.
 * Plafonné à 30 photos/mois (dishPhotoPerMonth) → max $1.20 en photos.
 * Prix actuels corrects — pas de changement nécessaire.
 */
export const API_COSTS = {
  // Claude Haiku 4.5 — ~500 tokens in + 1200 out (8 idées + JSON)
  ideaGenerate:      0.005,
  // Claude Haiku 4.5 — ~400 tokens in + 700 out (5 étapes script)
  videoScript:       0.0025,
  // Claude Haiku 4.5 vision — ~1800 tokens in (image) + 200 out
  captionVision:     0.002,
  // Claude Haiku 4.5 vision — ~2000 tokens in (menu) + 300 out
  menuAnalysis:      0.003,
  // Claude Haiku 4.5 — ~500 tokens in + 800 out (analyse avis)
  restaurantBrain:   0.004,
  // DALL-E 3 standard 1024×1024
  dishPhoto:         0.040,
  // Creatomate 720p 15sec + Claude Haiku analysis
  videoReel:         0.073,
}

/**
 * Feature flags par plan.
 * Utilisé par useFeatureAccess pour décider si une feature est accessible.
 */
export const FEATURES = {
  // — Idées IA (par semaine, reset lundi) —
  ideasPerWeek: {
    starter:     5,
    pro_monthly: Infinity,
    pro_annual:  Infinity,
    premium:     Infinity,
  },

  // — Photos IA DALL-E (par mois, reset 1er du mois) —
  dishPhotoPerMonth: {
    starter:     0,
    pro_monthly: 30,
    pro_annual:  30,
    premium:     Infinity,
  },

  // — Analyses RestaurantBrain (par mois, reset 1er du mois) —
  restaurantBrainPerMonth: {
    starter:     0,
    pro_monthly: 20,
    pro_annual:  20,
    premium:     Infinity,
  },

  // — Scripts vidéo IA (par mois, reset 1er du mois) —
  videoScriptPerMonth: {
    starter:     0,
    pro_monthly: Infinity,
    pro_annual:  Infinity,
    premium:     Infinity,
  },

  // — Légendes IA QuickCapture (par mois, reset 1er du mois) —
  captionPerMonth: {
    starter:     5,
    pro_monthly: Infinity,
    pro_annual:  Infinity,
    premium:     Infinity,
  },

  // — Plateformes simultanées —
  platforms: {
    starter:     1,
    pro_monthly: Infinity,
    pro_annual:  Infinity,
    premium:     Infinity,
  },

  // — Calendrier : posts max/semaine —
  calendarPostsPerWeek: {
    starter:     3,
    pro_monthly: Infinity,
    pro_annual:  Infinity,
    premium:     Infinity,
  },

  // — Brief visuel dans les idées —
  briefVisuel: {
    starter:     false,
    pro_monthly: true,
    pro_annual:  true,
    premium:     true,
  },

  // — Overlay cuisine étendue (60+ types + recherche) —
  cuisineOverlay: {
    starter:     false,
    pro_monthly: true,
    pro_annual:  true,
    premium:     true,
  },

  // — Overlay spécialité avec recherche —
  specialiteOverlay: {
    starter:     false,
    pro_monthly: true,
    pro_annual:  true,
    premium:     true,
  },

  // — Import photo de carte / menu —
  menuPhotoImport: {
    starter:     false,
    pro_monthly: true,
    pro_annual:  true,
    premium:     true,
  },

  // — Cerveau restaurant (Google Places + avis) —
  restaurantBrain: {
    starter:     false,
    pro_monthly: true,
    pro_annual:  true,
    premium:     true,
  },

  // — Génération photo IA (DALL-E) —
  dishPhotoGenerator: {
    starter:     false,
    pro_monthly: true,
    pro_annual:  true,
    premium:     true,
  },

  // — Analytics avancé (heatmap, recommandations Chef) —
  analyticsAdvanced: {
    starter:     false,
    pro_monthly: true,
    pro_annual:  true,
    premium:     true,
  },

  // — Analytics standard (graphiques, top posts) —
  analyticsStandard: {
    starter:     false,
    pro_monthly: true,
    pro_annual:  true,
    premium:     true,
  },

  // — Reels Studio (par mois, reset 1er du mois) —
  videoReelPerMonth: {
    starter:     0,
    pro_monthly: 20,
    pro_annual:  20,
    premium:     Infinity,
  },

  // — Chat IA Chef (assistant conversationnel) — Exclusif Premium
  aiChat: {
    starter:     false,
    pro_monthly: false,
    pro_annual:  false,
    premium:     true,
  },
}

/** Retourne la valeur d'une feature pour un plan donné */
export function getFeature(plan, feature) {
  return FEATURES[feature]?.[plan] ?? false
}

/** Retourne true si le plan a accès à la feature */
export function canAccess(plan, feature) {
  const val = getFeature(plan, feature)
  return val !== false && val !== 0
}

/** Hiérarchie des plans pour comparer */
const PLAN_RANK = { starter: 0, pro_monthly: 1, pro_annual: 2, premium: 3 }

export function isAtLeast(plan, minPlan) {
  return (PLAN_RANK[plan] ?? 0) >= (PLAN_RANK[minPlan] ?? 0)
}

/** Quel plan minimum faut-il pour cette feature ? */
export function requiredPlanFor(feature) {
  const tiers = ['starter', 'pro_monthly', 'pro_annual', 'premium']
  for (const tier of tiers) {
    const val = FEATURES[feature]?.[tier]
    if (val !== false && val !== 0) return tier
  }
  return 'premium'
}

export const PLAN_DISPLAY_NAMES = {
  starter:     'Starter',
  pro_monthly: 'Pro',
  pro_annual:  'Pro Annuel',
  premium:     'Premium',
}
