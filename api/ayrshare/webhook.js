/**
 * POST /api/ayrshare/webhook
 * Reçoit les callbacks Ayrshare après publication/erreur.
 * Met à jour le statut des posts dans la table `scheduled_posts`.
 *
 * Ayrshare envoie un corps JSON du type :
 * {
 *   "id"        : "ayrshare-post-id",
 *   "status"    : "success" | "error",
 *   "platforms" : ["instagram"],
 *   "errors"    : [],
 *   ...
 * }
 */
import { createClient } from '@supabase/supabase-js'
import { ApiError, createApiHandler } from '../_lib/http.js'
import { requireEnv, optionalEnv } from '../_lib/env.js'

export default createApiHandler({
  routeName: 'ayrshare-webhook',
  method: 'POST',
  rateLimit: { limit: 200, windowMs: 60_000 }, // webhooks → limite haute

  async handler({ req, body }) {
    const webhookSecret = optionalEnv('AYRSHARE_WEBHOOK_SECRET')

    // ── Vérification signature optionnelle ─────────────────────────────────
    if (webhookSecret) {
      const signature = req.headers['x-ayrshare-signature'] || ''
      if (signature !== webhookSecret) {
        throw new ApiError(401, 'INVALID_SIGNATURE', 'Signature webhook invalide.')
      }
    }

    const { id: ayrshareId, status: ayrStatus, errors = [] } = body

    if (!ayrshareId) {
      // Ayrshare envoie parfois des pings de santé sans id
      return { received: true }
    }

    // ── Mapper le statut Ayrshare → statut PostChef ────────────────────────
    let newStatus
    if (ayrStatus === 'success') {
      newStatus = 'published'
    } else if (ayrStatus === 'error') {
      newStatus = 'failed'
    } else {
      // Statut intermédiaire (publishing, etc.) : on ignore
      return { received: true, action: 'ignored', ayrshareId }
    }

    const errorMessage = errors.length > 0
      ? errors.map((e) => e?.message || String(e)).join(' | ')
      : null

    // ── Mettre à jour Supabase avec service_role (pas de RLS côté webhook) ─
    const supabaseUrl  = requireEnv('VITE_SUPABASE_URL')
    const serviceKey   = optionalEnv('SUPABASE_SERVICE_ROLE_KEY')

    if (!serviceKey) {
      // Sans service role, on ne peut pas contourner RLS — log et skip
      console.warn('[ayrshare/webhook] SUPABASE_SERVICE_ROLE_KEY absent — skipping DB update')
      return { received: true, action: 'skipped_no_service_key' }
    }

    const adminClient = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })

    const updateData = {
      status:        newStatus,
      error_message: errorMessage,
      ...(newStatus === 'published' ? { published_at: new Date().toISOString() } : {}),
    }

    const { error: updateErr } = await adminClient
      .from('scheduled_posts')
      .update(updateData)
      .eq('ayrshare_scheduled_id', ayrshareId)

    if (updateErr) {
      console.error('[ayrshare/webhook] supabase update error', updateErr)
      // On retourne 200 quand même pour éviter que Ayrshare rerefire
    }

    return { received: true, action: 'updated', ayrshareId, newStatus }
  },
})
