/**
 * Upload un Blob ou data URL vers une URL publique accessible par Shotstack.
 * Stratégie :
 *   1. Shotstack Ingest API (natif, gratuit avec le plan)
 *   2. Cloudinary unsigned upload (fallback)
 * Lève une erreur si aucun CDN n'est configuré.
 */

const SHOTSTACK_KEY  = import.meta.env.VITE_SHOTSTACK_KEY
const SHOTSTACK_HOST = (import.meta.env.VITE_SHOTSTACK_HOST || 'https://api.shotstack.io/edit/stage')
const INGEST_HOST    = SHOTSTACK_HOST.replace('/edit/', '/ingest/')

const CLD_CLOUD  = import.meta.env.VITE_CLOUDINARY_CLOUD
const CLD_PRESET = import.meta.env.VITE_CLOUDINARY_PRESET

/**
 * @param {Blob|string} blobOrDataUrl
 * @param {string}      filename
 * @returns {Promise<string>} URL publique HTTPS
 */
export async function uploadToCdn(blobOrDataUrl, filename = 'asset') {
  const blob = typeof blobOrDataUrl === 'string'
    ? await (await fetch(blobOrDataUrl)).blob()
    : blobOrDataUrl

  // ── Option 1 : Shotstack Ingest ──────────────────────────────────────────
  if (SHOTSTACK_KEY) {
    try {
      const initRes = await fetch(`${INGEST_HOST}/upload`, {
        method:  'POST',
        headers: { 'x-api-key': SHOTSTACK_KEY },
      })
      if (initRes.ok) {
        const { data } = await initRes.json()
        const uploadUrl = data?.attributes?.url
        if (uploadUrl) {
          await fetch(uploadUrl, { method: 'PUT', body: blob })
          return data.attributes.sourceUrl || uploadUrl.split('?')[0]
        }
      }
    } catch (e) {
      console.warn('[ingestAsset] Shotstack Ingest failed, fallback Cloudinary', e)
    }
  }

  // ── Option 2 : Cloudinary unsigned ──────────────────────────────────────
  if (CLD_CLOUD && CLD_PRESET) {
    const form = new FormData()
    form.append('file',           blob)
    form.append('upload_preset',  CLD_PRESET)
    form.append('public_id',      `postchef/${filename.replace(/\W+/g, '_')}`)
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLD_CLOUD}/auto/upload`,
      { method: 'POST', body: form },
    )
    if (!res.ok) throw new Error(`Cloudinary upload failed: ${res.status}`)
    const d = await res.json()
    return d.secure_url
  }

  throw new Error('Aucun CDN configuré — ajoute VITE_SHOTSTACK_KEY ou VITE_CLOUDINARY_CLOUD + VITE_CLOUDINARY_PRESET')
}
