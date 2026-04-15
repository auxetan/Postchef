/**
 * Adaptateurs multi-plateforme PostChef.
 * Chaque plateforme a ses propres contraintes de format pour les captions,
 * les hashtags et les médias.
 */

// ── Limites par plateforme ──────────────────────────────────────────────────
export const PLATFORM_LIMITS = {
  instagram: {
    captionMaxChars: 2200,
    hashtagsInCaption: false,   // Best practice : hashtags en 1er commentaire
    maxHashtags: 30,
    videoMaxSeconds: 90,        // Reels
    videoRatio: '9:16',
    imageRatios: ['1:1', '4:5'],
  },
  tiktok: {
    captionMaxChars: 2200,
    hashtagsInCaption: true,
    maxHashtags: 10,
    videoMaxSeconds: 180,
    videoRatio: '9:16',
    imageRatios: ['9:16'],
  },
  facebook: {
    captionMaxChars: 63206,
    hashtagsInCaption: true,
    maxHashtags: 10,
    videoMaxSeconds: 240,
    videoRatio: '16:9',
    imageRatios: ['1:1', '16:9', '4:5'],
  },
}

/**
 * Adapte la caption pour une plateforme donnée.
 * - Tronque si dépassement
 * - Gère les hashtags selon la politique de la plateforme
 */
export function adaptCaption(caption = '', hashtags = [], platform = 'instagram') {
  const limits = PLATFORM_LIMITS[platform] || PLATFORM_LIMITS.instagram
  const hashtagStr = hashtags.slice(0, limits.maxHashtags).join(' ')

  if (limits.hashtagsInCaption) {
    const full = caption + (hashtagStr ? '\n\n' + hashtagStr : '')
    if (full.length <= limits.captionMaxChars) return { caption: full, firstComment: null }
    // Trop long : tronquer la caption, garder les hashtags
    const available = limits.captionMaxChars - hashtagStr.length - 4 // '\n\n' + '…'
    return {
      caption: caption.slice(0, Math.max(0, available)) + '…\n\n' + hashtagStr,
      firstComment: null,
    }
  }

  // Instagram : hashtags en 1er commentaire
  const truncated = caption.length > limits.captionMaxChars
    ? caption.slice(0, limits.captionMaxChars - 1) + '…'
    : caption
  return {
    caption: truncated,
    firstComment: hashtagStr || null,
  }
}

/**
 * Adapte les hashtags selon la plateforme (limite + règles).
 */
export function adaptHashtags(hashtags = [], platform = 'instagram') {
  const limits = PLATFORM_LIMITS[platform] || PLATFORM_LIMITS.instagram
  return hashtags.slice(0, limits.maxHashtags)
}

/**
 * Vérifie si une vidéo est compatible avec la plateforme.
 * @returns {{ ok: boolean, warnings: string[] }}
 */
export function checkMediaCompat(durationSeconds, platform = 'instagram') {
  const limits = PLATFORM_LIMITS[platform] || PLATFORM_LIMITS.instagram
  const warnings = []

  if (durationSeconds > limits.videoMaxSeconds) {
    warnings.push(
      `Vidéo trop longue pour ${platform} (max ${limits.videoMaxSeconds}s, actuelle ${durationSeconds}s)`
    )
  }

  return { ok: warnings.length === 0, warnings }
}

/**
 * Retourne le payload Ayrshare adapté pour une plateforme.
 */
export function buildAyrsharePayload({ caption, hashtags, mediaUrl, platform, scheduledAt }) {
  const { caption: adaptedCaption, firstComment } = adaptCaption(caption, hashtags, platform)

  return {
    post: adaptedCaption,
    platforms: [platform],
    ...(mediaUrl ? { mediaUrls: [mediaUrl] } : {}),
    ...(scheduledAt ? { scheduleDate: scheduledAt } : {}),
    ...(firstComment ? { instagramOptions: { addAutoHashtags: false } } : {}),
  }
}

/** Libellé court de la plateforme */
export const PLATFORM_DISPLAY = {
  instagram: 'Instagram',
  tiktok:    'TikTok',
  facebook:  'Facebook',
}
