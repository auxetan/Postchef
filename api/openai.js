import { optionalEnv, requireEnv } from './_lib/env.js'
import { ApiError, createApiHandler } from './_lib/http.js'
import {
  assertEnum,
  assertInteger,
  assertMediaPayload,
  assertOptionalString,
  assertString,
} from './_lib/validation.js'

const IMAGE_SIZES = ['1024x1024', '1024x1792', '1792x1024']
const IMAGE_QUALITIES = ['standard', 'hd']

export default createApiHandler({
  routeName: 'openai',
  rateLimit: { limit: 12, windowMs: 60_000 },
  async handler({ body }) {
    const apiKey = requireEnv('OPENAI_API_KEY')
    const operation = assertEnum(body.operation, 'operation', ['image', 'transcription'])

    if (operation === 'image') {
      const prompt = assertString(body.prompt, 'prompt', { min: 10, max: 2_000 })
      const size = body.size
        ? assertEnum(body.size, 'size', IMAGE_SIZES)
        : '1024x1024'
      const quality = body.quality
        ? assertEnum(body.quality, 'quality', IMAGE_QUALITIES)
        : 'standard'

      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          authorization: `Bearer ${apiKey}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: optionalEnv('OPENAI_IMAGE_MODEL', 'gpt-image-1'),
          prompt,
          size,
          quality,
        }),
      })

      if (!response.ok) {
        const details = await response.text()
        console.error('[api/openai:image] upstream_error', {
          status: response.status,
          details,
        })
        throw new ApiError(502, 'OPENAI_IMAGE_ERROR', 'La génération d’image a échoué.')
      }

      const data = await response.json()
      const image = data.data?.[0]
      const url = image?.url || image?.b64_json

      if (!url) {
        throw new ApiError(502, 'OPENAI_IMAGE_EMPTY', 'Aucune image n’a été renvoyée.')
      }

      return {
        url,
        revisedPrompt: image.revised_prompt || null,
        isBase64: Boolean(image.b64_json),
      }
    }

    const audio = assertMediaPayload(body.audio, 'audio', {
      maxBytes: 8 * 1024 * 1024,
      allowedMimePrefixes: ['audio/', 'video/'],
    })
    const language = assertOptionalString(body.language, 'language', { min: 2, max: 10 })
    const filename = audio.filename || 'audio.webm'
    const bytes = Buffer.from(audio.base64, 'base64')

    const form = new FormData()
    form.append('file', new Blob([bytes], { type: audio.mimeType }), filename)
    form.append('model', optionalEnv('OPENAI_TRANSCRIPTION_MODEL', 'whisper-1'))
    form.append('response_format', 'verbose_json')
    form.append('timestamp_granularities[]', 'word')
    if (language && language !== 'auto') form.append('language', language)

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { authorization: `Bearer ${apiKey}` },
      body: form,
    })

    if (!response.ok) {
      const details = await response.text()
      console.error('[api/openai:transcription] upstream_error', {
        status: response.status,
        details,
      })
      throw new ApiError(502, 'OPENAI_TRANSCRIPTION_ERROR', 'La transcription audio a échoué.')
    }

    const data = await response.json()

    return {
      text: data.text || '',
      words: (data.words || []).map((word) => ({
        word: word.word,
        start: word.start,
        end: word.end,
      })),
    }
  },
})
