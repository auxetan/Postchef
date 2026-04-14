import { createClient } from '@supabase/supabase-js'
import { ApiError, createApiHandler } from './_lib/http.js'
import { requireEnv, optionalEnv } from './_lib/env.js'

export default createApiHandler({
  routeName: 'delete-account',
  rateLimit: { limit: 5, windowMs: 60_000 },
  async handler({ req, body }) {
    // Valider le JWT de l'utilisateur via anon key
    const supabaseUrl  = requireEnv('VITE_SUPABASE_URL')
    const anonKey      = requireEnv('VITE_SUPABASE_ANON_KEY')
    const serviceKey   = optionalEnv('SUPABASE_SERVICE_ROLE_KEY')

    const authHeader = req.headers['authorization'] || ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
    if (!token) throw new ApiError(401, 'UNAUTHORIZED', 'Token manquant.')

    // Vérifier le token et récupérer l'utilisateur
    const anonClient = createClient(supabaseUrl, anonKey, {
      auth: { persistSession: false },
    })
    const { data: { user }, error: userError } = await anonClient.auth.getUser(token)
    if (userError || !user) throw new ApiError(401, 'UNAUTHORIZED', 'Session invalide.')

    const userId = user.id

    // Supprimer les données applicatives (possible avec RLS + token user)
    const userClient = createClient(supabaseUrl, anonKey, {
      auth: { persistSession: false },
      global: { headers: { Authorization: `Bearer ${token}` } },
    })

    const [appStateRes, restaurantRes, profileRes] = await Promise.all([
      userClient.from('app_state').delete().eq('user_id', userId),
      userClient.from('restaurants').delete().eq('user_id', userId),
      userClient.from('profiles').delete().eq('user_id', userId),
    ])

    for (const res of [appStateRes, restaurantRes, profileRes]) {
      if (res.error) {
        console.error('[delete-account] data delete error', res.error)
        throw new ApiError(500, 'DELETE_FAILED', 'Erreur lors de la suppression des données.')
      }
    }

    // Supprimer le compte auth (nécessite service_role)
    if (serviceKey) {
      const adminClient = createClient(supabaseUrl, serviceKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
      const { error: deleteUserError } = await adminClient.auth.admin.deleteUser(userId)
      if (deleteUserError) {
        console.error('[delete-account] auth delete error', deleteUserError)
        throw new ApiError(500, 'DELETE_AUTH_FAILED', 'Erreur lors de la suppression du compte auth.')
      }
    }

    return { success: true }
  },
})
