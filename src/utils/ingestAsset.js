/**
 * Upload un Blob ou data URL vers une URL publique accessible par Shotstack.
 * Stratégie :
 *   1. Shotstack Ingest API (natif, gratuit avec le plan)
 *   2. Cloudinary unsigned upload (fallback)
 * Lève une erreur si aucun CDN n'est configuré.
 */
import { postJson } from './serverApi.js'

/**
 * @param {Blob|string} blobOrDataUrl
 * @param {string}      filename
 * @returns {Promise<string>} URL publique HTTPS
 */
export async function uploadToCdn(blobOrDataUrl, filename = 'asset') {
  const blob = typeof blobOrDataUrl === 'string'
    ? await (await fetch(blobOrDataUrl)).blob()
    : blobOrDataUrl

  const config = await postJson('/api/shotstack', {
    action: 'prepare-upload',
    filename: filename.replace(/\W+/g, '_'),
    contentType: blob.type || 'application/octet-stream',
  })

  if (config.strategy === 'shotstack') {
    const uploadResponse = await fetch(config.uploadUrl, {
      method: 'PUT',
      headers: config.contentType ? { 'Content-Type': config.contentType } : undefined,
      body: blob,
    })

    if (!uploadResponse.ok) {
      throw new Error(`Upload Shotstack impossible (${uploadResponse.status})`)
    }

    return config.publicUrl
  }

  if (config.strategy === 'cloudinary_unsigned') {
    const form = new FormData()
    form.append('file', blob)
    Object.entries(config.fields || {}).forEach(([key, value]) => {
      form.append(key, value)
    })

    const res = await fetch(config.uploadUrl, { method: 'POST', body: form })
    if (!res.ok) throw new Error(`Cloudinary upload failed: ${res.status}`)
    const d = await res.json()
    return d.secure_url
  }

  throw new Error('Aucun CDN configuré côté serveur.')
}
