import { requireEnv } from './_lib/env.js'
import { ApiError, createApiHandler } from './_lib/http.js'
import { assertEnum, assertInteger, assertMediaPayload, assertString } from './_lib/validation.js'

const DEFAULT_MODEL = 'claude-haiku-4-5-20251001'
const ALLOWED_MODELS = [DEFAULT_MODEL]

export default createApiHandler({
  routeName: 'claude',
  rateLimit: { limit: 20, windowMs: 60_000 },
  async handler({ body }) {
    const apiKey = requireEnv('ANTHROPIC_API_KEY')
    const prompt = assertString(body.prompt, 'prompt', { min: 10, max: 8_000 })
    const model = body.model
      ? assertEnum(body.model, 'model', ALLOWED_MODELS)
      : DEFAULT_MODEL
    const maxTokens = body.maxTokens == null
      ? 1_200
      : assertInteger(body.maxTokens, 'maxTokens', { min: 128, max: 4_096 })
    const image = body.image
      ? assertMediaPayload(body.image, 'image', {
          maxBytes: 5 * 1024 * 1024,
          allowedMimePrefixes: ['image/'],
        })
      : null

    const content = image
      ? [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: image.mimeType,
              data: image.base64,
            },
          },
          { type: 'text', text: prompt },
        ]
      : prompt

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        messages: [{ role: 'user', content }],
      }),
    })

    if (!response.ok) {
      const details = await response.text()
      console.error('[api/claude] upstream_error', {
        status: response.status,
        details,
      })
      throw new ApiError(502, 'ANTHROPIC_ERROR', 'Claude a refusé la requête.')
    }

    const data = await response.json()
    const text = (data.content || [])
      .filter((block) => block.type === 'text')
      .map((block) => block.text)
      .join('\n')
      .trim()

    if (!text) {
      throw new ApiError(502, 'ANTHROPIC_EMPTY', 'Claude a renvoyé une réponse vide.')
    }

    return {
      text,
      usage: data.usage || null,
      model: data.model || model,
    }
  },
})
