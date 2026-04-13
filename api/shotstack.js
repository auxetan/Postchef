import { optionalEnv, requireEnv } from './_lib/env.js'
import { ApiError, createApiHandler } from './_lib/http.js'
import { assertEnum, assertObject, assertOptionalString, assertString } from './_lib/validation.js'

function getShotstackConfig() {
  const apiKey = requireEnv('SHOTSTACK_API_KEY')
  const host = optionalEnv('SHOTSTACK_HOST', 'https://api.shotstack.io/edit/stage')
  const ingestHost = host.replace('/edit/', '/ingest/')

  return { apiKey, host, ingestHost }
}

export default createApiHandler({
  routeName: 'shotstack',
  rateLimit: { limit: 40, windowMs: 60_000 },
  async handler({ body }) {
    const action = assertEnum(body.action, 'action', [
      'prepare-upload',
      'submit-render',
      'poll-render',
    ])

    if (action === 'prepare-upload') {
      const filename = assertString(body.filename || 'asset.bin', 'filename', {
        min: 1,
        max: 120,
        pattern: /^[a-zA-Z0-9._-]+$/,
      })
      const contentType = assertOptionalString(body.contentType, 'contentType', {
        min: 3,
        max: 120,
      })

      try {
        const { apiKey, ingestHost } = getShotstackConfig()
        const response = await fetch(`${ingestHost}/upload`, {
          method: 'POST',
          headers: { 'x-api-key': apiKey },
        })

        if (!response.ok) {
          const details = await response.text()
          console.error('[api/shotstack] ingest_upstream_error', {
            status: response.status,
            details,
          })
          throw new ApiError(502, 'SHOTSTACK_UPLOAD_ERROR', 'Préparation de l’upload impossible.')
        }

        const data = await response.json()
        const uploadUrl = data.data?.attributes?.url
        const publicUrl = data.data?.attributes?.sourceUrl

        if (!uploadUrl || !publicUrl) {
          throw new ApiError(502, 'SHOTSTACK_UPLOAD_EMPTY', 'Upload Shotstack incomplet.')
        }

        return {
          strategy: 'shotstack',
          uploadUrl,
          publicUrl,
          contentType: contentType || null,
        }
      } catch (error) {
        if (!(error instanceof ApiError) || error.code !== 'CONFIG_MISSING') throw error
      }

      const cloudName = optionalEnv('CLOUDINARY_CLOUD_NAME')
      const uploadPreset = optionalEnv('CLOUDINARY_UNSIGNED_UPLOAD_PRESET')

      if (!cloudName || !uploadPreset) {
        throw new ApiError(
          503,
          'CONFIG_MISSING',
          'Aucun upload CDN n’est configuré côté serveur.',
        )
      }

      const safePublicId = `postchef/${filename.replace(/\W+/g, '_')}`

      return {
        strategy: 'cloudinary_unsigned',
        uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
        fields: {
          upload_preset: uploadPreset,
          public_id: safePublicId,
        },
      }
    }

    if (action === 'submit-render') {
      const { apiKey, host } = getShotstackConfig()
      const edit = assertObject(body.edit, 'edit')
      const serialized = JSON.stringify(edit)

      if (serialized.length > 200_000) {
        throw new ApiError(413, 'PAYLOAD_TOO_LARGE', 'Le montage dépasse la taille autorisée.')
      }

      const response = await fetch(`${host}/render`, {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'content-type': 'application/json',
        },
        body: serialized,
      })

      if (!response.ok) {
        const details = await response.text()
        console.error('[api/shotstack] render_submit_error', {
          status: response.status,
          details,
        })
        throw new ApiError(502, 'SHOTSTACK_RENDER_ERROR', 'Le rendu vidéo n’a pas pu être lancé.')
      }

      const data = await response.json()
      const renderId = data.response?.id

      if (!renderId) {
        throw new ApiError(502, 'SHOTSTACK_RENDER_EMPTY', 'Shotstack n’a pas renvoyé d’identifiant.')
      }

      return { renderId }
    }

    const { apiKey, host } = getShotstackConfig()
    const renderId = assertString(body.renderId, 'renderId', {
      min: 6,
      max: 120,
      pattern: /^[a-zA-Z0-9_-]+$/,
    })

    const response = await fetch(`${host}/render/${renderId}`, {
      headers: { 'x-api-key': apiKey },
    })

    if (!response.ok) {
      const details = await response.text()
      console.error('[api/shotstack] render_poll_error', {
        status: response.status,
        details,
      })
      throw new ApiError(502, 'SHOTSTACK_POLL_ERROR', 'Le statut du rendu n’a pas pu être récupéré.')
    }

    const data = await response.json()

    return {
      status: data.response?.status || 'unknown',
      url: data.response?.url || null,
      error: data.response?.error || null,
    }
  },
})
