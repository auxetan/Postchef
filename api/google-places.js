import { requireEnv } from './_lib/env.js'
import { ApiError, createApiHandler } from './_lib/http.js'
import { assertString } from './_lib/validation.js'

// SerpAPI Google Maps — remplace Google Places API (tier gratuit disponible)
// Doc: https://serpapi.com/google-maps-api
export default createApiHandler({
  routeName: 'google-places',
  rateLimit: { limit: 20, windowMs: 60_000 },
  async handler({ body }) {
    const apiKey = requireEnv('SERPAPI_KEY')
    const name = assertString(body.name, 'name', { min: 2, max: 120 })
    const city = assertString(body.city, 'city', { min: 2, max: 120 })

    const query = `${name} restaurant ${city}`
    const url = new URL('https://serpapi.com/search.json')
    url.searchParams.set('engine', 'google_maps')
    url.searchParams.set('q', query)
    url.searchParams.set('hl', 'fr')
    url.searchParams.set('api_key', apiKey)

    const response = await fetch(url.toString())

    if (!response.ok) {
      const details = await response.text()
      console.error('[api/google-places] serpapi_error', {
        status: response.status,
        details,
      })
      throw new ApiError(502, 'SERPAPI_ERROR', 'SerpAPI a refusé la requête.')
    }

    const data = await response.json()

    if (data.error) {
      console.error('[api/google-places] serpapi_api_error', data.error)
      throw new ApiError(502, 'SERPAPI_ERROR', data.error)
    }

    const results = data.local_results || []
    const place = results[0]

    if (!place) {
      throw new ApiError(404, 'PLACE_NOT_FOUND', 'Restaurant non trouvé.')
    }

    // Extraction des avis depuis SerpAPI (disponibles dans local_results avec reviews_data)
    const reviews = (place.reviews_data || []).slice(0, 5).map((review) => ({
      author: review.username || 'Anonyme',
      rating: review.rating || 0,
      text: review.description || review.snippet || '',
      date: review.date || '',
    }))

    return {
      place: {
        name: place.title || name,
        address: place.address || '',
        rating: place.rating || 0,
        totalRatings: place.reviews || 0,
        phone: place.phone || '',
        website: place.website || '',
        priceLevel: place.price ? place.price.length : 0, // "$" → 1, "$$" → 2, etc.
        reviews,
      },
    }
  },
})
