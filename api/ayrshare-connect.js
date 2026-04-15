/**
 * POST /api/ayrshare-connect
 *
 * Crée (ou réutilise) un profil Ayrshare pour l'utilisateur,
 * génère un JWT Social Manager et retourne l'URL de connexion.
 *
 * Body: { profileKey?: string }
 *   - profileKey : si déjà connu, on ne crée pas de nouveau profil
 *
 * Returns: { profileKey, socialManagerUrl }
 */
import { createClient } from '@supabase/supabase-js'
import { ApiError, createApiHandler } from './_lib/http.js'
import { requireEnv } from './_lib/env.js'
import { ayrshareRequest } from './_lib/ayrshare.js'

export default createApiHandler({
  routeName: 'ayrshare-connect',
  method: 'POST',
  rateLimit: { limit: 10, windowMs: 60_000 },
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
    const { data: { user }, error } = await supabase.auth.getUser(token)
    if (error || !user) throw new ApiError(401, 'UNAUTHORIZED', 'Session invalide.')

    let { profileKey } = body

    // Si pas de profileKey, créer un nouveau profil Ayrshare
    if (!profileKey) {
      const { ok, data: createData } = await ayrshareRequest({
        apiKey: ayrshareKey,
        method: 'POST',
        path: '/profiles/createProfile',
        body: { title: `postchef-${user.id}` },
      })
      if (!ok || !createData.profileKey) {
        console.error('[ayrshare-connect] create profile error', createData)
        throw new ApiError(502, 'AYRSHARE_ERROR', 'Impossible de créer le profil Ayrshare.')
      }
      profileKey = createData.profileKey
    }

    // Générer un JWT pour le Social Manager Ayrshare
    const { ok: jwtOk, data: jwtData } = await ayrshareRequest({
      apiKey: ayrshareKey,
      method: 'POST',
      path: '/profiles/generateJWT',
      body: { profileKey },
    })
    if (!jwtOk || !jwtData.token) {
      console.error('[ayrshare-connect] generate JWT error', jwtData)
      throw new ApiError(502, 'AYRSHARE_ERROR', 'Impossible de générer le lien de connexion.')
    }

    const socialManagerUrl = `https://app.ayrshare.com/social-accounts?jwt=${jwtData.token}`

    return { profileKey, socialManagerUrl }
  },
})
