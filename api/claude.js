import { requireEnv } from './_lib/env.js'
import { ApiError, createApiHandler } from './_lib/http.js'
import { assertEnum, assertInteger, assertMediaPayload, assertString } from './_lib/validation.js'

const DEFAULT_MODEL = 'claude-haiku-4-5-20251001'
const ALLOWED_MODELS = [DEFAULT_MODEL, 'claude-sonnet-4-6']

function buildMessages(body, image) {
  // Multi-turn: body.messages = [{role, content}]
  if (Array.isArray(body.messages) && body.messages.length > 0) {
    return body.messages.map((m) => {
      if (typeof m !== 'object' || !m.role || !m.content) throw new ApiError(400, 'INVALID_MESSAGES', 'messages mal formés')
      if (!['user', 'assistant'].includes(m.role)) throw new ApiError(400, 'INVALID_ROLE', `role invalide: ${m.role}`)
      return { role: m.role, content: String(m.content).slice(0, 4000) }
    })
  }
  // Single-turn: body.prompt + optional image
  const prompt = assertString(body.prompt, 'prompt', { min: 1, max: 8_000 })
  const content = image
    ? [
        { type: 'image', source: { type: 'base64', media_type: image.mimeType, data: image.base64 } },
        { type: 'text', text: prompt },
      ]
    : prompt
  return [{ role: 'user', content }]
}

export default createApiHandler({
  routeName: 'claude',
  rateLimit: { limit: 30, windowMs: 60_000 },
  async handler({ body }) {
    const apiKey = requireEnv('ANTHROPIC_API_KEY')
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

    const messages = buildMessages(body, image)
    const systemText = body.system ? String(body.system).slice(0, 2000) : undefined
    // Prompt caching — system prompts répétés (ex: Chef IA) économisent ~90% des tokens
    const system = systemText
      ? [{ type: 'text', text: systemText, cache_control: { type: 'ephemeral' } }]
      : undefined

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'prompt-caching-2024-07-31',
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        ...(system ? { system } : {}),
        messages,
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
