/**
 * /api/google-places — Restaurant Brain : recherche + avis Google via SerpAPI
 *
 * Flux en 2 étapes :
 *   1. engine=google_maps  → trouve le restaurant, récupère data_id
 *   2. engine=google_maps_reviews → récupère les avis détaillés avec data_id
 *
 * Quota SerpAPI free tier : 250 recherches/mois (chaque étape = 1 recherche)
 */
import { requireEnv } from './_lib/env.js'
import { ApiError, createApiHandler } from './_lib/http.js'
import { assertString } from './_lib/validation.js'

async function serpFetch(params, apiKey) {
  const url = new URL('https://serpapi.com/search.json')
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)
  url.searchParams.set('api_key', apiKey)

  const res = await fetch(url.toString())
  if (!res.ok) {
    const details = await res.text()
    console.error('[api/google-places] serpapi_error', { status: res.status, details })
    throw new ApiError(502, 'SERPAPI_ERROR', `SerpAPI a retourné ${res.status}.`)
  }
  const data = await res.json()
  if (data.error) {
    console.error('[api/google-places] serpapi_api_error', data.error)
    throw new ApiError(502, 'SERPAPI_ERROR', String(data.error))
  }
  return data
}

export default createApiHandler({
  routeName: 'google-places',
  rateLimit: { limit: 20, windowMs: 60_000 },
  async handler({ body }) {
    const apiKey = requireEnv('SERPAPI_KEY')
    const name = assertString(body.name, 'name', { min: 2, max: 120 })
    const city = assertString(body.city, 'city', { min: 2, max: 120 })

    // ── Étape 1 : recherche Google Maps → data_id ──────────────────────────
    const searchData = await serpFetch({
      engine: 'google_maps',
      q: `${name} restaurant ${city}`,
      hl: 'fr',
      type: 'search',
    }, apiKey)

    const place = (searchData.local_results || [])[0]
    if (!place) {
      throw new ApiError(404, 'PLACE_NOT_FOUND', 'Restaurant non trouvé sur Google Maps.')
    }

    // data_id est requis pour récupérer les avis
    const dataId = place.data_id

    // Infos de base déjà disponibles depuis la recherche
    const baseInfo = {
      name: place.title || name,
      address: place.address || '',
      rating: place.rating || 0,
      totalRatings: place.reviews || 0,
      phone: place.phone || '',
      website: place.website || '',
      priceLevel: place.price ? place.price.length : 0,
    }

    // ── Étape 2 : avis détaillés via google_maps_reviews ──────────────────
    let reviews = []
    if (dataId) {
      try {
        const reviewsData = await serpFetch({
          engine: 'google_maps_reviews',
          data_id: dataId,
          hl: 'fr',
          sort_by: 'qualityScore',
          num: '10',
        }, apiKey)

        reviews = (reviewsData.reviews || []).slice(0, 10).map((r) => ({
          author: r.user?.name || r.name || 'Anonyme',
          rating: r.rating || 0,
          text: r.snippet || r.original_snippet || '',
          date: r.date || '',
          isLocalGuide: r.user?.local_guide || false,
          likes: r.likes || 0,
        }))

        // Sujets fréquents disponibles sur la 1re page des avis
        const topics = (reviewsData.topics || []).slice(0, 8).map((t) => ({
          keyword: t.keyword || t.title || '',
          count: t.reviews_count || t.count || 0,
        }))
        baseInfo.topics = topics
      } catch (err) {
        // Avis indisponibles (quota épuisé, etc.) → on retourne les infos de base
        console.warn('[api/google-places] reviews_fetch_failed', err.message)
      }
    }

    return {
      place: {
        ...baseInfo,
        reviews,
      },
    }
  },
})
