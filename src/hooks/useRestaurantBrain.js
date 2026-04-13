/**
 * useRestaurantBrain — recherche un restaurant via Google Places API
 * puis analyse ses avis avec Claude pour générer des insights contenu.
 */

import { useState } from 'react'
import useAppStore from '../store/useAppStore.js'
import { getFeature } from '../utils/plans.js'
import { postJson, requestClaude } from '../utils/serverApi.js'

// Données mock pour le dev sans API key
const MOCK_PLACE = {
  name: 'La Trattoria',
  address: '12 Rue Sainte, 13001 Marseille',
  rating: 4.6,
  totalRatings: 284,
  phone: '+33 4 91 XX XX XX',
  website: 'https://latrattoria-marseille.fr',
  priceLevel: 2,
  reviews: [
    { author: 'Marie T.', rating: 5, text: 'Pasta maison incroyable, sauce tomate parfaite. On revient toutes les semaines !', date: 'Il y a 3 jours' },
    { author: 'Thomas D.', rating: 5, text: 'Ambiance chaleureuse, service rapide. La carbonara est une tuerie. Parfait pour le déjeuner.', date: 'Il y a 1 semaine' },
    { author: 'Sophie L.', rating: 4, text: 'Très bonne cuisine italienne. Les prix sont corrects pour la qualité. Terrasse agréable l\'été.', date: 'Il y a 2 semaines' },
    { author: 'Lucas M.', rating: 5, text: 'Le meilleur tiramisu de Marseille, sans hésitation. Patron adorable.', date: 'Il y a 1 mois' },
    { author: 'Emma B.', rating: 3, text: 'Bonne cuisine mais service un peu lent le samedi soir. À éviter les week-ends chargés.', date: 'Il y a 1 mois' },
  ],
}

const MOCK_INSIGHTS = {
  strengths: ['Pasta maison citée 38× dans les avis', 'Ambiance et accueil très appréciés', 'Tiramisu devenu signature spontanée'],
  opportunities: ['Peu visible le week-end — mentionner l\'attente comme gage de qualité', 'Terrasse peu valorisée sur les réseaux', 'Aucun contenu "carte du jour" détecté'],
  contentIdeas: [
    { hook: '"38 personnes ont commandé cette pasta cette semaine"', format: 'Reel', plateforme: 'TikTok' },
    { hook: 'Le tiramisu dont tout Marseille parle — la recette secrète', format: 'Vidéo courte', plateforme: 'Instagram' },
    { hook: 'POV : t\'arrives à l\'heure et tu as une table en terrasse', format: 'Story', plateforme: 'Instagram' },
  ],
}

export function useRestaurantBrain() {
  const [loading, setLoading] = useState(false)
  const [place, setPlace] = useState(null)
  const [insights, setInsights] = useState(null)
  const [error, setError] = useState(null)
  const [isMock, setIsMock] = useState(false)

  const plan                        = useAppStore((s) => s.user.plan)
  const brainUsed                   = useAppStore((s) => s.usage.restaurantBrainUsedThisMonth ?? 0)
  const incrementRestaurantBrainUsed = useAppStore((s) => s.incrementRestaurantBrainUsed)

  const monthlyMax     = getFeature(plan, 'restaurantBrainPerMonth') // 0 | 5 | 20
  const quotaReached   = monthlyMax !== Infinity && brainUsed >= monthlyMax
  const remaining      = monthlyMax === Infinity ? Infinity : Math.max(0, monthlyMax - brainUsed)

  const search = async (name, city) => {
    if (!name || !city) return
    if (quotaReached) { setError(`Quota mensuel atteint (${monthlyMax} analyses/mois sur ce plan).`); return }
    setLoading(true)
    setError(null)

    try {
      const data = await postJson('/api/google-places', { name, city })
      const placeData = data.place
      setIsMock(false)
      setPlace(placeData)
      incrementRestaurantBrainUsed()
      await analyzeWithClaude(placeData, name)
    } catch (e) {
      setError(e.message || 'Erreur lors de la recherche')
      // Fallback démo — signalé explicitement dans le panel
      setIsMock(true)
      setPlace(MOCK_PLACE)
      setInsights(MOCK_INSIGHTS)
    } finally {
      setLoading(false)
    }
  }

  const analyzeWithClaude = async (placeData, restaurantName) => {
    const reviewsText = placeData.reviews
      .map((r) => `${r.rating}★ — ${r.text}`)
      .join('\n')

    const prompt = `Tu es Chef, expert contenu pour restaurants.

Restaurant : ${restaurantName}
Note Google : ${placeData.rating}/5 (${placeData.totalRatings} avis)
Avis récents :
${reviewsText}

Analyse ces avis et fournis en JSON :
{
  "strengths": ["force 1", "force 2", "force 3"],
  "opportunities": ["opportunité contenu 1", "opportunité 2", "opportunité 3"],
  "contentIdeas": [
    {"hook": "accroche percutante", "format": "Reel|Vidéo courte|Story|Carrousel", "plateforme": "TikTok|Instagram"},
    {"hook": "...", "format": "...", "plateforme": "..."},
    {"hook": "...", "format": "...", "plateforme": "..."}
  ]
}

Réponds UNIQUEMENT en JSON valide.`

    try {
      const data = await requestClaude({
        prompt,
        maxTokens: 800,
      })
      const parsed = JSON.parse(data.text)
      setInsights(parsed)
    } catch {
      setInsights(MOCK_INSIGHTS)
    }
  }

  const reset = () => { setPlace(null); setInsights(null); setError(null); setIsMock(false) }

  return { loading, place, insights, error, isMock, search, reset, quotaReached, remaining, monthlyMax }
}
