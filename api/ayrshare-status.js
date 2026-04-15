/**
 * POST /api/ayrshare-status
 *
 * Vérifie les plateformes connectées pour un profil Ayrshare.
 *
 * Body: { profileKey: string }
 * Returns: { connected: string[] }  ex: ["instagram", "tiktok"]
 */
import { createClient } from '@supabase/supabase-js'
import { ApiError, createApiHandler } from './_lib/http.js'
import { requireEnv } from './_lib/env.js'
import { ayrshareRequest } from './_lib/ayrshare.js'

// Mapping Ayrshare → noms PostChef
const PLATFORM_LABELS = {
  instagram: 'Instagram',
  tiktok:    'TikTok',
  facebook:  'Facebook',
  twitter:   'Twitter',
  linkedin:  'LinkedIn',
}

export default createApiHandler({
  routeName: 'ayrshare-status',
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
    const { data: { user }, error } = await supabase.auth.getUser(token)
    if (error || !user) throw new ApiError(401, 'UNAUTHORIZED', 'Session invalide.')

    const { profileKey } = body
    if (!profileKey) throw new ApiError(400, 'VALIDATION_ERROR', 'profileKey manquant.')

    const { ok, data } = await ayrshareRequest({
      apiKey: ayrshareKey,
      profileKey,
      method: 'GET',
      path: '/user',
    })
    if (!ok) {
      console.error('[ayrshare-status] error', data)
      throw new ApiError(502, 'AYRSHARE_ERROR', 'Impossible de récupérer le statut des réseaux.')
    }

    // activeSocialAccounts = tableau des plateformes actuellement connectées
    const active = Array.isArray(data.activeSocialAccounts) ? data.activeSocialAccounts : []
    const connected = active
      .map((p) => PLATFORM_LABELS[p.toLowerCase()] || p)
      .filter(Boolean)

    return { connected }
  },
})
