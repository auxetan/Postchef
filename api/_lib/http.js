import { checkRateLimit } from './rateLimit.js'

export class ApiError extends Error {
  constructor(status, code, message, details = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }
}

export function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for']
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim()
  }

  return req.socket?.remoteAddress || 'unknown'
}

export async function readJsonBody(req) {
  if (req.body && typeof req.body === 'object') return req.body

  if (typeof req.body === 'string') {
    return req.body.length ? JSON.parse(req.body) : {}
  }

  const chunks = []

  for await (const chunk of req) {
    chunks.push(chunk)
  }

  if (chunks.length === 0) return {}

  const raw = Buffer.concat(chunks).toString('utf8')
  return raw.length ? JSON.parse(raw) : {}
}

export function sendJson(res, status, payload) {
  res.status(status).json(payload)
}

export function sendError(res, error) {
  if (error instanceof ApiError) {
    return sendJson(res, error.status, {
      error: {
        code: error.code,
        message: error.message,
        ...(error.details ? { details: error.details } : {}),
      },
    })
  }

  console.error('[api] unexpected_error', error)

  return sendJson(res, 500, {
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Une erreur interne est survenue.',
    },
  })
}

export function createApiHandler({
  routeName,
  method = 'POST',
  rateLimit = { limit: 30, windowMs: 60_000 },
  handler,
}) {
  return async function apiHandler(req, res) {
    res.setHeader('Cache-Control', 'no-store')

    if (req.method !== method) {
      res.setHeader('Allow', method)
      return sendError(
        res,
        new ApiError(405, 'METHOD_NOT_ALLOWED', `Méthode ${req.method} non autorisée.`),
      )
    }

    try {
      const ip = getClientIp(req)
      const rateKey = `${routeName}:${ip}`
      const limitState = checkRateLimit({
        key: rateKey,
        limit: rateLimit.limit,
        windowMs: rateLimit.windowMs,
      })

      if (!limitState.allowed) {
        res.setHeader('Retry-After', String(Math.ceil(limitState.retryAfterMs / 1000)))
        throw new ApiError(
          429,
          'RATE_LIMITED',
          'Trop de requêtes en peu de temps. Réessaie dans quelques instants.',
        )
      }

      const body = await readJsonBody(req)
      const data = await handler({ req, res, body, ip })

      if (!res.writableEnded) {
        sendJson(res, 200, data)
      }
    } catch (error) {
      if (!(error instanceof ApiError)) {
        console.error(`[api/${routeName}] handler_failed`, {
          message: error?.message,
          stack: error?.stack,
        })
      }

      sendError(res, error)
    }
  }
}
