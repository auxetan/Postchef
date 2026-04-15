/**
 * Adaptation du contenu par plateforme.
 * Limites de caractères, hashtags, ratios vidéo.
 */

export const PLATFORM_LIMITS = {
  Instagram: { caption: 2200, hashtagsMax: 30, videoDuration: 90 },
  TikTok:    { caption: 2200, hashtagsMax: null, videoDuration: 600 },
  Facebook:  { caption: 63206, hashtagsMax: null, videoDuration: 240 },
}

export const PLATFORM_RATIOS = {
  Instagram: { reel: '9:16', feed: '1:1', story: '9:16' },
  TikTok:    { video: '9:16' },
  Facebook:  { reel: '9:16', post: '4:5' },
}

/**
 * Adapte une légende pour une plateforme spécifique.
 * - Tronque si nécessaire (au dernier mot complet)
 * - Formate les hashtags (pas de hashtags pour Facebook)
 */
export function adaptCaption(caption, platform, hashtags = []) {
  const limit = PLATFORM_LIMITS[platform]?.caption ?? 2200
  const tags = hashtags.map((h) => (h.startsWith('#') ? h : `#${h}`)).join(' ')

  let text = caption ?? ''

  if (platform === 'Facebook') {
    // Facebook : pas de hashtags dans la légende
    return text.length > limit ? text.slice(0, limit).replace(/\s+\S*$/, '') + '…' : text
  }

  const separator = '\n\n'
  const totalLen = text.length + (tags ? separator.length + tags.length : 0)

  if (totalLen > limit) {
    const maxCaption = limit - (tags ? separator.length + tags.length : 0)
    if (maxCaption > 0 && text.length > maxCaption) {
      text = text.slice(0, maxCaption).replace(/\s+\S*$/, '') + '…'
    } else if (maxCaption <= 0) {
      return text.slice(0, limit).replace(/\s+\S*$/, '') + '…'
    }
  }

  return tags ? `${text}${separator}${tags}` : text
}

/**
 * Mapping des noms PostChef → noms Ayrshare.
 */
export function toAyrshareplatforms(platforms) {
  const MAP = {
    Instagram: 'instagram',
    TikTok:    'tiktok',
    Facebook:  'facebook',
    Twitter:   'twitter',
    LinkedIn:  'linkedin',
  }
  return platforms.map((p) => MAP[p] || p.toLowerCase())
}
