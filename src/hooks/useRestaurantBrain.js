/**
 * useRestaurantBrain — recherche un restaurant via Google Places API
 * puis analyse ses avis avec Claude pour générer des insights contenu.
 *
 * Pour activer Google Places :
 *   1. Créer un fichier .env à la racine avec :
 *      VITE_GOOGLE_PLACES_KEY=ta_clé_ici
 *   2. Activer "Places API (New)" dans Google Cloud Console
 *
 * Pour activer Claude :
 *      VITE_ANTHROPIC_KEY=ta_clé_ici
 *   ⚠️  Ne jamais exposer une clé Anthropic en frontend prod — utiliser un backend.
 */

import { useState } from 'react'
import useAppStore from '../store/useAppStore.js'
import { getFeature } from '../utils/plans.js'

const GOOGLE_KEY    = import.meta.env.VITE_GOOGLE_PLACES_KEY
const ANTHROPIC_KEY = import.meta.env.VITE_ANTHROPIC_KEY

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
      if (GOOGLE_KEY) {
        // Appel réel Google Places
        const query = encodeURIComponent(`${name} ${city}`)
        const res = await fetch(
          `https://places.googleapis.com/v1/places:searchText`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Goog-Api-Key': GOOGLE_KEY,
              'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.internationalPhoneNumber,places.websiteUri,places.priceLevel,places.reviews',
            },
            body: JSON.stringify({ textQuery: `${name} restaurant ${city}` }),
          }
        )
        const data = await res.json()
        const p = data.places?.[0]
        if (!p) throw new Error('Restaurant non trouvé')

        const placeData = {
          name: p.displayName?.text || name,
          address: p.formattedAddress || '',
          rating: p.rating || 0,
          totalRatings: p.userRatingCount || 0,
          phone: p.internationalPhoneNumber || '',
          website: p.websiteUri || '',
          priceLevel: p.priceLevel || 0,
          reviews: (p.reviews || []).slice(0, 5).map((r) => ({
            author: r.authorAttribution?.displayName || 'Anonyme',
            rating: r.rating || 0,
            text: r.originalText?.text || r.text?.text || '',
            date: r.relativePublishTimeDescription || '',
          })),
        }
        setPlace(placeData)
        incrementRestaurantBrainUsed()
        await analyzeWithClaude(placeData, name)
      } else {
        // Mock pour le dev
        await new Promise((r) => setTimeout(r, 1800))
        setPlace(MOCK_PLACE)
        incrementRestaurantBrainUsed()
        await new Promise((r) => setTimeout(r, 1200))
        setInsights(MOCK_INSIGHTS)
      }
    } catch (e) {
      setError(e.message || 'Erreur lors de la recherche')
      // Fallback mock
      setPlace(MOCK_PLACE)
      setInsights(MOCK_INSIGHTS)
    } finally {
      setLoading(false)
    }
  }

  const analyzeWithClaude = async (placeData, restaurantName) => {
    if (!ANTHROPIC_KEY) {
      setInsights(MOCK_INSIGHTS)
      return
    }

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
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_KEY,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 800,
          messages: [{ role: 'user', content: prompt }],
        }),
      })
      const data = await res.json()
      const parsed = JSON.parse(data.content[0].text)
      setInsights(parsed)
    } catch {
      setInsights(MOCK_INSIGHTS)
    }
  }

  const reset = () => { setPlace(null); setInsights(null); setError(null) }

  return { loading, place, insights, error, search, reset, quotaReached, remaining, monthlyMax }
}
