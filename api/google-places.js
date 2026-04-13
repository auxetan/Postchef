import { requireEnv } from './_lib/env.js'
import { ApiError, createApiHandler } from './_lib/http.js'
import { assertString } from './_lib/validation.js'

export default createApiHandler({
  routeName: 'google-places',
  rateLimit: { limit: 20, windowMs: 60_000 },
  async handler({ body }) {
    const apiKey = requireEnv('GOOGLE_PLACES_API_KEY')
    const name = assertString(body.name, 'name', { min: 2, max: 120 })
    const city = assertString(body.city, 'city', { min: 2, max: 120 })

    const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-goog-api-key': apiKey,
        'x-goog-fieldmask': [
          'places.displayName',
          'places.formattedAddress',
          'places.rating',
          'places.userRatingCount',
          'places.internationalPhoneNumber',
          'places.websiteUri',
          'places.priceLevel',
          'places.reviews',
        ].join(','),
      },
      body: JSON.stringify({ textQuery: `${name} restaurant ${city}` }),
    })

    if (!response.ok) {
      const details = await response.text()
      console.error('[api/google-places] upstream_error', {
        status: response.status,
        details,
      })
      throw new ApiError(502, 'GOOGLE_PLACES_ERROR', 'Google Places a refusé la requête.')
    }

    const data = await response.json()
    const place = data.places?.[0]

    if (!place) {
      throw new ApiError(404, 'PLACE_NOT_FOUND', 'Restaurant non trouvé.')
    }

    return {
      place: {
        name: place.displayName?.text || name,
        address: place.formattedAddress || '',
        rating: place.rating || 0,
        totalRatings: place.userRatingCount || 0,
        phone: place.internationalPhoneNumber || '',
        website: place.websiteUri || '',
        priceLevel: place.priceLevel || 0,
        reviews: (place.reviews || []).slice(0, 5).map((review) => ({
          author: review.authorAttribution?.displayName || 'Anonyme',
          rating: review.rating || 0,
          text: review.originalText?.text || review.text?.text || '',
          date: review.relativePublishTimeDescription || '',
        })),
      },
    }
  },
})
