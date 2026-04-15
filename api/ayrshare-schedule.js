/**
 * POST /api/ayrshare-schedule
 *
 * Programme un post pour une date/heure future via Ayrshare.
 *
 * Body: { post: PostObject, profileKey: string, scheduleDate: string (ISO 8601 UTC), mediaUrl?: string }
 * Returns: { ayrshareId, scheduleDate }
 */
import { createClient } from '@supabase/supabase-js'
import { ApiError, createApiHandler } from './_lib/http.js'
import { requireEnv } from './_lib/env.js'
import { buildAyrsharePayload, ayrshareRequest } from './_lib/ayrshare.js'

export default createApiHandler({
  routeName: 'ayrshare-schedule',
  method: 'POST',
  rateLimit: { limit: 20, windowMs: 60_000 },
  async handler({ req, body }) {
    const ayrshareKey = requireEnv('AYRSHARE_API_KEY')
    const supabaseUrl = requireEnv('VITE_SUPABASE_URL')
    const anonKey     = requireEnv('VITE_SUPABASE_ANON_KEY')

    // Valider le JWT Supabase
    const authHeader = req.headers['authorization'] || ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
    if (!token) throw new ApiError(401, 'UNAUTHORIZED', 'Token manquant.')

    const supabase = createClient(supabaseUrl, anonKey, {
      auth: { persistSession: false },
    })
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) throw new ApiError(401, 'UNAUTHORIZED', 'Session invalide.')

    const { post, profileKey, scheduleDate, mediaUrl } = body
    if (!post)          throw new ApiError(400, 'VALIDATION_ERROR', 'Champ "post" manquant.')
    if (!profileKey)    throw new ApiError(400, 'VALIDATION_ERROR', 'profileKey manquant.')
    if (!scheduleDate)  throw new ApiError(400, 'VALIDATION_ERROR', 'scheduleDate manquant.')
    if (!post.plateformes?.length) throw new ApiError(400, 'VALIDATION_ERROR', 'Aucune plateforme sélectionnée.')

    // Vérifier que la date est dans le futur (tolérance 5 min)
    const scheduled = new Date(scheduleDate)
    if (isNaN(scheduled.getTime())) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'scheduleDate invalide (format ISO 8601 attendu).')
    }
    if (scheduled.getTime() < Date.now() - 5 * 60_000) {
      throw new ApiError(400, 'SCHEDULE_PAST', 'La date de programmation est dans le passé.')
    }

    const payload = buildAyrsharePayload({ post, mediaUrl, scheduleDate })

    const { ok, data: schedData } = await ayrshareRequest({
      apiKey: ayrshareKey,
      profileKey,
      method: 'POST',
      path: '/post',
      body: payload,
    })

    if (!ok) {
      console.error('[ayrshare-schedule] error', schedData)
      throw new ApiError(502, 'SCHEDULE_FAILED', schedData?.message || 'Erreur lors de la programmation.')
    }

    return {
      ayrshareId:   schedData.id,
      scheduleDate: scheduleDate,
    }
  },
})
