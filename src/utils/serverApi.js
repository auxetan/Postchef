export class ServerApiError extends Error {
  constructor(message, status, code) {
    super(message)
    this.name = 'ServerApiError'
    this.status = status
    this.code = code
  }
}

export async function postJson(url, payload) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new ServerApiError(
      data?.error?.message || `La requête a échoué (${response.status}).`,
      response.status,
      data?.error?.code || 'REQUEST_FAILED',
    )
  }

  return data
}

export function dataUrlToMediaPayload(dataUrl, filename = 'upload.bin') {
  if (typeof dataUrl !== 'string' || !dataUrl.startsWith('data:')) {
    throw new Error('dataUrl invalide')
  }

  const [header, base64] = dataUrl.split(',')
  const mimeType = header.match(/^data:(.*?);base64$/)?.[1]

  if (!mimeType || !base64) {
    throw new Error('Impossible de convertir le dataUrl en payload média.')
  }

  return { base64, mimeType, filename }
}

export function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(reader.error || new Error('Lecture du blob impossible.'))
    reader.readAsDataURL(blob)
  })
}

export async function blobToMediaPayload(blob, filename = 'upload.bin') {
  const dataUrl = await blobToDataUrl(blob)
  return dataUrlToMediaPayload(dataUrl, filename)
}

export async function requestClaude({
  prompt,
  imageDataUrl,
  maxTokens = 1200,
  model = 'claude-haiku-4-5-20251001',
}) {
  return postJson('/api/claude', {
    prompt,
    maxTokens,
    model,
    ...(imageDataUrl ? { image: dataUrlToMediaPayload(imageDataUrl, 'image-upload.jpg') } : {}),
  })
}

/**
 * Multi-turn conversation with Claude.
 * messages: [{role: 'user'|'assistant', content: string}]
 * system:   optional system prompt string
 */
export async function requestClaudeChat({
  messages,
  system,
  maxTokens = 1200,
  model = 'claude-haiku-4-5-20251001',
}) {
  return postJson('/api/claude', { messages, system, maxTokens, model })
}

/**
 * Chef IA avec tool-calling.
 * messages: [{role: 'user'|'assistant', content: string}]
 * system:   system prompt string
 * Returns: { text, actions: [{type, data}] }
 */
export async function requestChefIA({ messages, system }) {
  return postJson('/api/chef-ia', { messages, system })
}

export async function generateAiImage({
  prompt,
  size = '1024x1024',
  quality = 'standard',
}) {
  return postJson('/api/openai', {
    operation: 'image',
    prompt,
    size,
    quality,
  })
}

export async function transcribeAudio(blob, { language = 'fr', filename = 'audio.webm' } = {}) {
  return postJson('/api/openai', {
    operation: 'transcription',
    audio: await blobToMediaPayload(blob, filename),
    language,
  })
}

export function resolveImageSrc({ url, isBase64 }) {
  if (!url) return null
  return isBase64 ? `data:image/png;base64,${url}` : url
}
