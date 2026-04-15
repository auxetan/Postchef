/**
 * Helpers Ayrshare pour les endpoints serverless.
 * Centralise la logique de construction de payload et de mapping.
 */

const AYRSHARE_BASE = 'https://api.ayrshare.com/api'

/** Mapping noms PostChef → noms Ayrshare */
const PLATFORM_MAP = {
  Instagram: 'instagram',
  TikTok:    'tiktok',
  Facebook:  'facebook',
}

export function toAyrshareplatforms(platforms) {
  return platforms.map((p) => PLATFORM_MAP[p] || p.toLowerCase())
}

/** Adapte une légende selon les limites de la plateforme principale */
function adaptCaption(text, platform) {
  const limits = { Instagram: 2200, TikTok: 2200, Facebook: 63206 }
  const limit  = limits[platform] ?? 2200
  if (!text) return ''
  return text.length > limit ? text.slice(0, limit).replace(/\s+\S*$/, '') + '…' : text
}

/**
 * Construit le payload Ayrshare pour un post PostChef.
 * @param {object} opts
 * @param {object} opts.post         - Post PostChef (plateformes, legende, description)
 * @param {string} [opts.mediaUrl]   - URL publique du média (optionnel)
 * @param {string} [opts.scheduleDate] - ISO 8601 UTC pour la programmation (optionnel)
 */
export function buildAyrsharePayload({ post, mediaUrl, scheduleDate }) {
  const platforms    = toAyrshareplatforms(post.plateformes || [])
  const mainPlatform = post.plateformes?.[0] || 'Instagram'
  const caption      = adaptCaption(post.legende || post.description || '', mainPlatform)

  const payload = {
    post: caption,
    platforms,
  }

  if (mediaUrl) {
    payload.mediaUrls = [mediaUrl]
  }

  if (scheduleDate) {
    payload.scheduleDate = scheduleDate
  }

  return payload
}

/**
 * Appel générique à l'API Ayrshare.
 * Lève une erreur descriptive si l'appel échoue.
 */
export async function ayrshareRequest({
  apiKey,
  profileKey,
  method = 'GET',
  path,
  body,
}) {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
  }
  if (profileKey) {
    headers['Profile-Key'] = profileKey
  }

  const opts = { method, headers }
  if (body && method !== 'GET') {
    opts.body = JSON.stringify(body)
  }

  const res  = await fetch(`${AYRSHARE_BASE}${path}`, opts)
  const data = await res.json().catch(() => ({}))
  return { ok: res.ok, status: res.status, data }
}
