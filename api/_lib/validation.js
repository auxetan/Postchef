import { ApiError } from './http.js'

export function assertString(value, field, { min = 1, max = 5000, pattern } = {}) {
  if (typeof value !== 'string') {
    throw new ApiError(400, 'INVALID_PAYLOAD', `Le champ ${field} doit être une chaîne.`)
  }

  const normalized = value.trim()

  if (normalized.length < min || normalized.length > max) {
    throw new ApiError(
      400,
      'INVALID_PAYLOAD',
      `Le champ ${field} doit contenir entre ${min} et ${max} caractères.`,
    )
  }

  if (pattern && !pattern.test(normalized)) {
    throw new ApiError(400, 'INVALID_PAYLOAD', `Le champ ${field} est invalide.`)
  }

  return normalized
}

export function assertOptionalString(value, field, options = {}) {
  if (value == null || value === '') return null
  return assertString(value, field, options)
}

export function assertEnum(value, field, allowed) {
  if (!allowed.includes(value)) {
    throw new ApiError(
      400,
      'INVALID_PAYLOAD',
      `Le champ ${field} doit être l'une des valeurs suivantes: ${allowed.join(', ')}.`,
    )
  }

  return value
}

export function assertInteger(value, field, { min = 0, max = Number.MAX_SAFE_INTEGER } = {}) {
  if (!Number.isInteger(value) || value < min || value > max) {
    throw new ApiError(
      400,
      'INVALID_PAYLOAD',
      `Le champ ${field} doit être un entier entre ${min} et ${max}.`,
    )
  }

  return value
}

export function assertObject(value, field) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new ApiError(400, 'INVALID_PAYLOAD', `Le champ ${field} doit être un objet.`)
  }

  return value
}

export function assertMediaPayload(
  value,
  field,
  {
    maxBytes = 5 * 1024 * 1024,
    allowedMimePrefixes = ['image/'],
  } = {},
) {
  const media = assertObject(value, field)
  const base64 = assertString(media.base64, `${field}.base64`, { min: 16, max: maxBytes * 2 })
  const mimeType = assertString(media.mimeType, `${field}.mimeType`, { min: 3, max: 100 })
  const filename = assertOptionalString(media.filename, `${field}.filename`, { min: 1, max: 120 })

  if (!allowedMimePrefixes.some((prefix) => mimeType.startsWith(prefix))) {
    throw new ApiError(
      400,
      'INVALID_PAYLOAD',
      `Le type MIME de ${field} n'est pas autorisé.`,
    )
  }

  const approxBytes = Math.ceil((base64.length * 3) / 4)
  if (approxBytes > maxBytes) {
    throw new ApiError(
      413,
      'PAYLOAD_TOO_LARGE',
      `Le média ${field} dépasse la taille maximale autorisée.`,
    )
  }

  return { base64, mimeType, filename }
}
