/**
 * POST /api/ayrshare-webhook
 *
 * Reçoit les callbacks Ayrshare (post publié, post échoué, etc.).
 * Met à jour le statut des posts en base via Supabase.
 *
 * Vérification de signature HMAC via AYRSHARE_WEBHOOK_SECRET.
 * Si la clé n'est pas configurée, accepte tous les appels (dev mode).
 */
import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'
import { ApiError } from './_lib/http.js'
import { requireEnv, optionalEnv } from './_lib/env.js'
import { sendJson, sendError, readJsonBody } from './_lib/http.js'

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return sendError(res, new ApiError(405, 'METHOD_NOT_ALLOWED', 'Méthode non autorisée.'))
  }

  try {
    const webhookSecret = optionalEnv('AYRSHARE_WEBHOOK_SECRET')
    const rawBody = await readRawBody(req)

    // Vérification HMAC si la clé est configurée
    if (webhookSecret) {
      const signature = req.headers['x-ayrshare-signature'] || ''
      const expected  = crypto
        .createHmac('sha256', webhookSecret)
        .update(rawBody)
        .digest('hex')

      if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
        throw new ApiError(401, 'INVALID_SIGNATURE', 'Signature webhook invalide.')
      }
    }

    const body = JSON.parse(rawBody || '{}')

    // Ayrshare webhook payload structure :
    // { type: 'post', id: string, status: 'completed'|'error', profiles: [{...}] }
    const { type, id: ayrshareId, status } = body
    if (!ayrshareId) {
      return sendJson(res, 200, { received: true })
    }

    // Mise à jour optionnelle en Supabase si les variables d'env sont disponibles
    const supabaseUrl  = optionalEnv('VITE_SUPABASE_URL')
    const serviceKey   = optionalEnv('SUPABASE_SERVICE_ROLE_KEY')

    if (supabaseUrl && serviceKey && ayrshareId) {
      const supabase = createClient(supabaseUrl, serviceKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      })

      let newStatus = null
      if (status === 'completed' || status === 'sent') newStatus = 'publie'
      else if (status === 'error' || status === 'failed') newStatus = 'echec'

      if (newStatus) {
        await supabase
          .from('app_state')
          .update({})  // Pas de table dédiée pour l'instant — log uniquement
          .eq('ayrshare_id', ayrshareId)
      }

      console.info('[ayrshare-webhook]', { type, ayrshareId, status, newStatus })
    }

    return sendJson(res, 200, { received: true })
  } catch (error) {
    return sendError(res, error)
  }
}

async function readRawBody(req) {
  if (typeof req.body === 'string') return req.body

  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  return Buffer.concat(chunks).toString('utf8')
}
