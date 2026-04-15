/**
 * POST /api/ayrshare/connect
 * Crée ou récupère le profileKey Ayrshare de l'utilisateur,
 * retourne l'URL de connexion pour la plateforme demandée.
 *
 * Body : { platform: 'instagram' | 'tiktok' | 'facebook' }
 * Retour : { profileKey, connectUrl, platform }
 */
import { createClient } from '@supabase/supabase-js'
import { ApiError, createApiHandler } from '../_lib/http.js'
import { requireEnv } from '../_lib/env.js'

const VALID_PLATFORMS = ['instagram', 'tiktok', 'facebook']

export default createApiHandler({
  routeName: 'ayrshare-connect',
  method: 'POST',
  rateLimit: { limit: 20, windowMs: 60_000 },

  async handler({ req, body }) {
    const { platform } = body
    if (!platform || !VALID_PLATFORMS.includes(platform)) {
      throw new ApiError(400, 'INVALID_PLATFORM', 'Plateforme invalide. Valeurs acceptées : instagram, tiktok, facebook.')
    }

    const supabaseUrl  = requireEnv('VITE_SUPABASE_URL')
    const anonKey      = requireEnv('VITE_SUPABASE_ANON_KEY')
    const ayrshareKey  = requireEnv('AYRSHARE_API_KEY')

    // ── Authentification ──────────────────────────────────────────────────────
    const authHeader = req.headers['authorization'] || ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
    if (!token) throw new ApiError(401, 'UNAUTHORIZED', 'Token manquant.')

    const anonClient = createClient(supabaseUrl, anonKey, { auth: { persistSession: false } })
    const { data: { user }, error: userError } = await anonClient.auth.getUser(token)
    if (userError || !user) throw new ApiError(401, 'UNAUTHORIZED', 'Session invalide.')

    const userClient = createClient(supabaseUrl, anonKey, {
      auth: { persistSession: false },
      global: { headers: { Authorization: `Bearer ${token}` } },
    })

    // ── Récupérer le profil utilisateur ───────────────────────────────────────
    const { data: profile, error: profileErr } = await userClient
      .from('profiles')
      .select('ayrshare_profile_key, first_name')
      .eq('user_id', user.id)
      .single()

    if (profileErr) {
      console.error('[ayrshare/connect] profile fetch error', profileErr)
      throw new ApiError(500, 'PROFILE_ERROR', 'Impossible de récupérer le profil utilisateur.')
    }

    let profileKey = profile?.ayrshare_profile_key || ''

    // ── Créer le profil Ayrshare si inexistant ────────────────────────────────
    if (!profileKey) {
      const title = profile?.first_name || `postchef-${user.id.slice(0, 8)}`

      const createRes = await fetch('https://app.ayrshare.com/api/profiles/profile', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${ayrshareKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title }),
      })

      if (!createRes.ok) {
        const errBody = await createRes.json().catch(() => ({}))
        console.error('[ayrshare/connect] create profile failed', errBody)
        throw new ApiError(502, 'AYRSHARE_CREATE_FAILED', 'Impossible de créer le profil Ayrshare.')
      }

      const { profileKey: newKey } = await createRes.json()
      profileKey = newKey

      // Persister la clé dans Supabase
      const { error: updateErr } = await userClient
        .from('profiles')
        .update({ ayrshare_profile_key: profileKey })
        .eq('user_id', user.id)

      if (updateErr) {
        console.error('[ayrshare/connect] save profileKey error', updateErr)
        // Non bloquant : l'utilisateur peut recharger
      }
    }

    // ── Générer l'URL de connexion ─────────────────────────────────────────────
    // URL native Ayrshare : redirige l'utilisateur pour OAuth plateforme
    const connectUrl = `https://app.ayrshare.com/connect?profileKey=${encodeURIComponent(profileKey)}&platform=${platform}`

    return { profileKey, connectUrl, platform }
  },
})
