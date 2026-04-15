/**
 * POST /api/ayrshare-publish
 *
 * Publie un post immédiatement via Ayrshare.
 *
 * Body: { post: PostObject, profileKey: string, mediaUrl?: string }
 * Returns: { ayrshareId, status, postIds }
 */
import { createClient } from '@supabase/supabase-js'
import { ApiError, createApiHandler } from './_lib/http.js'
import { requireEnv } from './_lib/env.js'
import { buildAyrsharePayload, ayrshareRequest } from './_lib/ayrshare.js'

export default createApiHandler({
  routeName: 'ayrshare-publish',
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

    const { post, profileKey, mediaUrl } = body
    if (!post)        throw new ApiError(400, 'VALIDATION_ERROR', 'Champ "post" manquant.')
    if (!profileKey)  throw new ApiError(400, 'VALIDATION_ERROR', 'profileKey manquant.')
    if (!post.plateformes?.length) throw new ApiError(400, 'VALIDATION_ERROR', 'Aucune plateforme sélectionnée.')

    const payload = buildAyrsharePayload({ post, mediaUrl })

    const { ok, data: publishData } = await ayrshareRequest({
      apiKey: ayrshareKey,
      profileKey,
      method: 'POST',
      path: '/post',
      body: payload,
    })

    if (!ok) {
      console.error('[ayrshare-publish] error', publishData)
      throw new ApiError(502, 'PUBLISH_FAILED', publishData?.message || 'Erreur lors de la publication.')
    }

    return {
      ayrshareId: publishData.id,
      status:     publishData.status,
      postIds:    publishData.postIds,
    }
  },
})
