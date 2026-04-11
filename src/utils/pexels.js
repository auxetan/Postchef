/**
 * Pexels Videos API — stock footage portrait (9:16)
 * Doc : https://www.pexels.com/api/documentation/#videos
 */

const KEY = import.meta.env.VITE_PEXELS_KEY

/**
 * Cherche des vidéos portrait matchant un query.
 * @param {string} query
 * @param {number} perPage
 * @returns {Promise<Array<{ id, url, duration, width, height }>>}
 */
export async function searchStockVideo(query, perPage = 5) {
  if (!KEY) return []

  const url = new URL('https://api.pexels.com/videos/search')
  url.searchParams.set('query',       query.slice(0, 100))
  url.searchParams.set('per_page',    String(perPage))
  url.searchParams.set('orientation', 'portrait')

  const res = await fetch(url, { headers: { Authorization: KEY } })
  if (!res.ok) return []

  const data = await res.json()
  return (data.videos || [])
    .map((v) => {
      const files = (v.video_files || [])
        .filter((f) => f.file_type === 'video/mp4')
        .sort((a, b) => (b.width || 0) - (a.width || 0))
      const best = files.find((f) => f.width && f.width <= 1080) || files[0]
      if (!best?.link) return null
      return { id: v.id, url: best.link, duration: v.duration, width: best.width, height: best.height }
    })
    .filter(Boolean)
}
