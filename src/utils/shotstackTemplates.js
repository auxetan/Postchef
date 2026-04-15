/**
 * RESTAURANT_TEMPLATES — 5 templates vidéo pré-configurés pour les restaurants.
 * Chaque template définit :
 *  - Les métadonnées visuelles (UI card)
 *  - Les config Shotstack (transitions, caption style, music mood)
 *  - Une fonction buildDirectiveOverrides(clips, restaurant) qui retourne les overrides
 *    à merger sur la directive Claude avant le rendu.
 */

export const RESTAURANT_TEMPLATES = [
  {
    id: 'recipe_quick',
    name: 'Recette Rapide',
    emoji: '⚡',
    duration: '15s',
    tagline: '3 plans percutants, rythme soutenu',
    badge: 'VIRAL',
    captionStyle: 'kinetic',
    musicMood: 'warm_upbeat',
    targetDuration: 15,
    maxClips: 3,
    transition: 'zoom',
    preview: {
      bg: 'from-orange-500 to-amber-400',
      textColor: 'text-white',
      captionDemo: ['INGRÉDIENTS', 'SECRETS', '→ RÉSULTAT'],
    },
    buildDirectiveOverrides: (clips, restaurant) => ({
      caption_style: 'kinetic',
      clip_trims: clips.slice(0, 3).map((clip, i) => ({
        clip_index: i,
        start: 0,
        end: Math.min(clip.duration, 5),
      })),
      text_overlays: [
        {
          text: restaurant?.name || 'Recette',
          position: 'top',
          timing_start: 0,
          timing_end: 2,
          style: 'bold_white',
        },
        {
          text: 'Swipe pour la recette ↓',
          position: 'bottom',
          timing_start: 12,
          timing_end: 15,
          style: 'minimal',
        },
      ],
    }),
  },

  {
    id: 'signature_dish',
    name: 'Plat Signature',
    emoji: '⭐',
    duration: '30s',
    tagline: 'Présentation premium, transitions élégantes',
    badge: null,
    captionStyle: 'classic',
    musicMood: 'elegant',
    targetDuration: 30,
    maxClips: 5,
    transition: 'fade',
    preview: {
      bg: 'from-purple-600 to-indigo-500',
      textColor: 'text-white',
      captionDemo: ['Notre spécialité', 'de saison'],
    },
    buildDirectiveOverrides: (clips, restaurant) => ({
      caption_style: 'classic',
      clip_trims: clips.slice(0, 5).map((clip, i) => ({
        clip_index: i,
        start: 0,
        end: Math.min(clip.duration, 6),
      })),
      text_overlays: [
        {
          text: restaurant?.name || '',
          position: 'bottom',
          timing_start: 0,
          timing_end: 3,
          style: 'minimal',
        },
        {
          text: 'Réservez votre table',
          position: 'bottom',
          timing_start: 26,
          timing_end: 30,
          style: 'bold_white',
        },
      ],
    }),
  },

  {
    id: 'behind_scenes',
    name: 'Coulisses Cuisine',
    emoji: '👨‍🍳',
    duration: '20s',
    tagline: 'Authenticité, ambiance, storytelling',
    badge: 'TENDANCE',
    captionStyle: 'neon',
    musicMood: 'chill',
    targetDuration: 20,
    maxClips: 4,
    transition: 'slideLeft',
    preview: {
      bg: 'from-gray-800 to-gray-900',
      textColor: 'text-green-400',
      captionDemo: ['Bienvenue dans', 'notre cuisine'],
    },
    buildDirectiveOverrides: (clips, restaurant) => ({
      caption_style: 'neon',
      clip_trims: clips.slice(0, 4).map((clip, i) => ({
        clip_index: i,
        start: 0,
        end: Math.min(clip.duration, 5),
      })),
      text_overlays: [
        {
          text: 'Dans les coulisses de ' + (restaurant?.name || 'notre cuisine'),
          position: 'top',
          timing_start: 0,
          timing_end: 3,
          style: 'minimal',
        },
        {
          text: 'Suivez-nous pour la suite',
          position: 'bottom',
          timing_start: 17,
          timing_end: 20,
          style: 'bold_white',
        },
      ],
    }),
  },

  {
    id: 'client_review',
    name: 'Avis Client',
    emoji: '💬',
    duration: '15s',
    tagline: 'Témoignage authentique, confiance instantanée',
    badge: null,
    captionStyle: 'bold_impact',
    musicMood: 'neutral',
    targetDuration: 15,
    maxClips: 2,
    transition: 'fade',
    preview: {
      bg: 'from-emerald-500 to-teal-400',
      textColor: 'text-white',
      captionDemo: ['"INCROYABLE !"', '⭐⭐⭐⭐⭐'],
    },
    buildDirectiveOverrides: (clips, restaurant) => ({
      caption_style: 'bold_impact',
      clip_trims: clips.slice(0, 2).map((clip, i) => ({
        clip_index: i,
        start: 0,
        end: Math.min(clip.duration, 7.5),
      })),
      text_overlays: [
        {
          text: '⭐⭐⭐⭐⭐',
          position: 'top',
          timing_start: 0,
          timing_end: 2,
          style: 'bold_white',
        },
        {
          text: restaurant?.name || 'Venez nous rendre visite',
          position: 'bottom',
          timing_start: 12,
          timing_end: 15,
          style: 'bold_white',
        },
      ],
    }),
  },

  {
    id: 'daily_menu',
    name: 'Menu du Jour',
    emoji: '📋',
    duration: '10s',
    tagline: 'Slideshow rapide, plat + prix mis en avant',
    badge: 'QUOTIDIEN',
    captionStyle: 'karaoke',
    musicMood: 'corporate',
    targetDuration: 10,
    maxClips: 3,
    transition: 'slideUp',
    preview: {
      bg: 'from-yellow-400 to-orange-400',
      textColor: 'text-gray-900',
      captionDemo: ['Menu du Jour', 'Entrée · Plat · Dessert'],
    },
    buildDirectiveOverrides: (clips, restaurant) => ({
      caption_style: 'karaoke',
      clip_trims: clips.slice(0, 3).map((clip, i) => ({
        clip_index: i,
        start: 0,
        end: Math.min(clip.duration, 3.3),
      })),
      text_overlays: [
        {
          text: 'Menu du Jour',
          position: 'top',
          timing_start: 0,
          timing_end: 2.5,
          style: 'bold_white',
        },
        {
          text: restaurant?.name || '',
          position: 'bottom',
          timing_start: 7,
          timing_end: 10,
          style: 'minimal',
        },
      ],
    }),
  },
]

/** Retourne un template par id */
export function getTemplate(id) {
  return RESTAURANT_TEMPLATES.find((t) => t.id === id) ?? RESTAURANT_TEMPLATES[0]
}

/** Mappe les moods vers les pistes musicales de la bibliothèque MusicSelector */
export const MOOD_TO_TRACK_URL = {
  warm_upbeat: 'https://cdn.pixabay.com/audio/2024/11/28/audio_3a4b923ecd.mp3',
  elegant:     'https://cdn.pixabay.com/audio/2024/09/10/audio_6e5d780da7.mp3',
  chill:       'https://cdn.pixabay.com/audio/2024/01/30/audio_b35c1b7ee8.mp3',
  neutral:     'https://cdn.pixabay.com/audio/2023/10/30/audio_0d26b3e7f4.mp3',
  corporate:   'https://cdn.pixabay.com/audio/2024/03/08/audio_3b86d5de7f.mp3',
}
