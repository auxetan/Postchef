/**
 * POST /api/ayrshare/publish
 * Publie ou programme un post sur une ou plusieurs plateformes via Ayrshare.
 * Sauvegarde le résultat dans la table `scheduled_posts` Supabase.
 *
 * Body : {
 *   postId      : string,        // ID du post dans useAppStore
 *   platforms   : string[],      // ['instagram', 'tiktok', 'facebook']
 *   caption     : string,
 *   hashtags?   : string[],
 *   mediaUrl?   : string,        // URL vidéo/image Shotstack ou upload
 *   scheduledAt?: string,        // ISO 8601 — si absent : publication immédiate
 * }
 *
 * Retour : { success, ayrshareId, scheduledAt, status }
 */
import { createClient } from '@supabase/supabase-js'
import { ApiError, createApiHandler } from '../_lib/http.js'
import { requireEnv } from '../_lib/env.js'

const VALID_PLATFORMS = ['instagram', 'tiktok', 'facebook']

// ── Limites caption par plateforme (inline pour éviter import src/) ─────────
const CAPTION_LIMITS = {
  instagram: { max: 2200, hashtagsInCaption: false, maxHashtags: 30 },
  tiktok:    { max: 2200, hashtagsInCaption: true,  maxHashtags: 10 },
  facebook:  { max: 63206, hashtagsInCaption: true,  maxHashtags: 10 },
}

function buildCaption(caption, hashtags = [], platform) {
  const limits = CAPTION_LIMITS[platform] || CAPTION_LIMITS.instagram
  const tags   = hashtags.slice(0, limits.maxHashtags).join(' ')

  if (limits.hashtagsInCaption) {
    const full = caption + (tags ? '\n\n' + tags : '')
    if (full.length <= limits.max) return { post: full, firstComment: null }
    const available = limits.max - tags.length - 4
    return {
      post:         caption.slice(0, Math.max(0, available)) + '…\n\n' + tags,
      firstComment: null,
    }
  }

  // Instagram : hashtags en 1er commentaire
  const truncated = caption.length > limits.max
    ? caption.slice(0, limits.max - 1) + '…'
    : caption
  return { post: truncated, firstComment: tags || null }
}

export default createApiHandler({
  routeName: 'ayrshare-publish',
  method: 'POST',
  rateLimit: { limit: 30, windowMs: 60_000 },

  async handler({ req, body }) {
    const { postId, platforms, caption, hashtags = [], mediaUrl, scheduledAt } = body

    // ── Validation ──────────────────────────────────────────────────────────
    if (!postId)                       throw new ApiError(400, 'MISSING_POST_ID',   'postId requis.')
    if (!Array.isArray(platforms) || platforms.length === 0)
                                       throw new ApiError(400, 'MISSING_PLATFORMS', 'Au moins une plateforme requise.')
    if (!caption)                      throw new ApiError(400, 'MISSING_CAPTION',   'caption requis.')
    const invalidPlatforms = platforms.filter((p) => !VALID_PLATFORMS.includes(p))
    if (invalidPlatforms.length > 0)   throw new ApiError(400, 'INVALID_PLATFORMS', `Plateformes invalides : ${invalidPlatforms.join(', ')}.`)

    const supabaseUrl = requireEnv('VITE_SUPABASE_URL')
    const anonKey     = requireEnv('VITE_SUPABASE_ANON_KEY')
    const ayrshareKey = requireEnv('AYRSHARE_API_KEY')

    // ── Authentification ────────────────────────────────────────────────────
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

    // ── Récupérer le profileKey Ayrshare ────────────────────────────────────
    const { data: profile, error: profileErr } = await userClient
      .from('profiles')
      .select('ayrshare_profile_key')
      .eq('user_id', user.id)
      .single()

    if (profileErr || !profile?.ayrshare_profile_key) {
      throw new ApiError(400, 'NOT_CONNECTED', 'Aucun compte social connecté. Connecte d\'abord tes réseaux dans Réglages → Réseaux sociaux.')
    }

    const profileKey = profile.ayrshare_profile_key

    // ── Construire le payload Ayrshare ──────────────────────────────────────
    // On publie un post multi-plateforme en une seule requête Ayrshare
    // Le caption principal utilise les règles de la première plateforme pour la troncature
    const primaryPlatform = platforms[0]
    const { post: adaptedCaption } = buildCaption(caption, hashtags, primaryPlatform)

    const ayrsharePayload = {
      post:      adaptedCaption,
      platforms: platforms,
      profileKey,
      ...(mediaUrl    ? { mediaUrls: [mediaUrl] }      : {}),
      ...(scheduledAt ? { scheduleDate: scheduledAt }  : {}),
    }

    // Ajouter les hashtags en commentaire Instagram si nécessaire
    const { firstComment } = buildCaption(caption, hashtags, 'instagram')
    if (firstComment && platforms.includes('instagram')) {
      ayrsharePayload.instagramOptions = {
        addAutoHashtags: false,
        firstComment,
      }
    }

    // ── Appel Ayrshare /post ────────────────────────────────────────────────
    const ayrRes = await fetch('https://app.ayrshare.com/api/post', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${ayrshareKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ayrsharePayload),
    })

    const ayrData = await ayrRes.json().catch(() => ({}))

    if (!ayrRes.ok) {
      console.error('[ayrshare/publish] ayrshare error', ayrData)
      const message = ayrData?.message || ayrData?.action || 'Erreur Ayrshare.'
      throw new ApiError(502, 'AYRSHARE_ERROR', message)
    }

    const ayrshareId = ayrData?.id || null
    const status     = scheduledAt ? 'scheduled' : 'published'

    // ── Sauvegarder dans Supabase scheduled_posts ───────────────────────────
    const { error: insertErr } = await userClient
      .from('scheduled_posts')
      .insert({
        user_id:               user.id,
        post_id:               postId,
        platforms,
        caption:               adaptedCaption,
        media_url:             mediaUrl || null,
        scheduled_at:          scheduledAt || new Date().toISOString(),
        ayrshare_scheduled_id: ayrshareId,
        status,
        published_at:          scheduledAt ? null : new Date().toISOString(),
      })

    if (insertErr) {
      console.error('[ayrshare/publish] supabase insert error', insertErr)
      // Non bloquant : la publication a réussi côté Ayrshare
    }

    return {
      success:    true,
      ayrshareId,
      scheduledAt: scheduledAt || null,
      status,
    }
  },
})
