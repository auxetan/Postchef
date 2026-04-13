import { optionalEnv } from './_lib/env.js'
import { ApiError, createApiHandler } from './_lib/http.js'
import { assertInteger, assertString } from './_lib/validation.js'

export default createApiHandler({
  routeName: 'pexels',
  rateLimit: { limit: 30, windowMs: 60_000 },
  async handler({ body }) {
    const apiKey = optionalEnv('PEXELS_API_KEY')
    const query = assertString(body.query, 'query', { min: 2, max: 100 })
    const perPage = body.perPage == null
      ? 5
      : assertInteger(body.perPage, 'perPage', { min: 1, max: 10 })

    if (!apiKey) {
      return { videos: [] }
    }

    const url = new URL('https://api.pexels.com/videos/search')
    url.searchParams.set('query', query)
    url.searchParams.set('per_page', String(perPage))
    url.searchParams.set('orientation', 'portrait')

    const response = await fetch(url, {
      headers: { authorization: apiKey },
    })

    if (!response.ok) {
      const details = await response.text()
      console.error('[api/pexels] upstream_error', {
        status: response.status,
        details,
      })
      throw new ApiError(502, 'PEXELS_ERROR', 'La recherche Pexels a échoué.')
    }

    const data = await response.json()
    const videos = (data.videos || [])
      .map((video) => {
        const files = (video.video_files || [])
          .filter((file) => file.file_type === 'video/mp4')
          .sort((a, b) => (b.width || 0) - (a.width || 0))
        const best = files.find((file) => file.width && file.width <= 1080) || files[0]

        if (!best?.link) return null

        return {
          id: video.id,
          url: best.link,
          duration: video.duration,
          width: best.width,
          height: best.height,
        }
      })
      .filter(Boolean)

    return { videos }
  },
})
