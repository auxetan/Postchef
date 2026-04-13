/**
 * Pexels Videos API — stock footage portrait (9:16)
 * Doc : https://www.pexels.com/api/documentation/#videos
 */
import { postJson } from './serverApi.js'

/**
 * Cherche des vidéos portrait matchant un query.
 * @param {string} query
 * @param {number} perPage
 * @returns {Promise<Array<{ id, url, duration, width, height }>>}
 */
export async function searchStockVideo(query, perPage = 5) {
  try {
    const data = await postJson('/api/pexels', {
      query: query.slice(0, 100),
      perPage,
    })

    return data.videos || []
  } catch {
    return []
  }
}
