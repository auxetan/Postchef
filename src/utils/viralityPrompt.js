/**
 * Prompt Claude pour la Virality Engine du Studio.
 * Génère un ViralityDirective JSON optimisé pour la viralité restaurant.
 * Supporte le multimodal Vision : envoie 3 frames par clip (début, milieu, fin).
 */

function extractBase64(dataUrl) {
  return dataUrl.split(',')[1]
}

export function buildViralityPrompt({ restaurant, clips, platform, objective }) {
  const content = []

  // Injection des frames de chaque clip (Vision multimodal)
  clips.forEach((clip, i) => {
    const framesToSend = clip.frames?.filter(Boolean) || (clip.thumbnail ? [clip.thumbnail] : [])
    framesToSend.forEach((frame) => {
      content.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: 'image/jpeg',
          data: extractBase64(frame),
        },
      })
    })
    content.push({
      type: 'text',
      text: `[Clip ${i + 1} : durée ${clip.duration.toFixed(1)}s — ${clip.analysisLabel || 'contenu inconnu'} — ${framesToSend.length} frame(s) : début, milieu, fin]`,
    })
  })

  // Prompt texte principal
  content.push({
    type: 'text',
    text: `Tu es un expert en contenu viral pour les restaurants sur TikTok et Instagram Reels en 2025.

CONTEXTE RESTAURANT :
- Nom : ${restaurant.name}
- Ville : ${restaurant.city}
- Cuisine : ${restaurant.cuisineTypes?.join(', ') || 'Non précisé'}
- Spécialité : ${restaurant.specialite || 'Non précisée'}
- Style clientèle : ${restaurant.clientele?.profils?.join(', ') || 'généraliste'}
- Objectif : ${objective}

PLATEFORME CIBLE : ${platform}

MISSION : Génère un "ViralityDirective" JSON optimisé pour la viralité maximale.
Les règles de viralité restaurant 2025 que tu dois appliquer :
1. Les 2 premières secondes doivent être un "pattern interrupt" visuel ou textuel
2. La durée idéale est 8-15 secondes (rétention maximale)
3. Le texte du hook doit apparaître dans les 2 premières secondes, court (max 8 mots)
4. Les coupes doivent suivre un rythme qui correspond à la musique (cuts every 2-4s)
5. Toujours finir par un CTA clair (réserver / passer / lien en bio)
6. Pour TikTok : favoriser les formats "reveal" et "asmr food"
7. Pour Instagram : favoriser les formats "aesthetic" et "behind the scenes"
8. Proposer 3 variantes de hook (A/B/C) pour permettre le test et l'optimisation

Réponds UNIQUEMENT avec ce JSON valide, sans commentaires :

{
  "template": "dish_reveal|behind_scenes|daily_special|ambiance|asmr_moment",
  "hook_type": "pattern_interrupt|question|provocateur|reveal|asmr",
  "hook_text": "texte court et viral (max 8 mots)",
  "hook_variants": [
    {
      "hook_type": "pattern_interrupt",
      "hook_text": "Attends de voir ça...",
      "virality_score": 85,
      "reason": "Pattern interrupt fort, curiosité immédiate"
    },
    {
      "hook_type": "question",
      "hook_text": "Tu savais que ce plat...",
      "virality_score": 78,
      "reason": "Engagement par la question, rétention +12%"
    },
    {
      "hook_type": "pov",
      "hook_text": "POV: ton premier resto à ${restaurant.city}",
      "virality_score": 82,
      "reason": "Format POV trending, identification immédiate"
    }
  ],
  "clip_order": [1, 2, 3],
  "clip_trims": [
    { "clip_index": 0, "start": 0.0, "end": 3.5 },
    { "clip_index": 1, "start": 1.0, "end": 4.0 }
  ],
  "text_overlays": [
    { "text": "...", "timing_start": 0, "timing_end": 2.5, "position": "top|center|bottom", "style": "bold_white|subtle_dark|accent_green" },
    { "text": "📍 ${restaurant.city}", "timing_start": 4, "timing_end": 7, "position": "bottom", "style": "subtle_dark" },
    { "text": "Réservez 👆 lien en bio", "timing_start": 9, "timing_end": 12, "position": "center", "style": "bold_white" }
  ],
  "transition_style": "hard_cut|smooth_fade|zoom_transition",
  "music_mood": "warm_upbeat|energetic|chill_ambient|asmr_natural",
  "music_bpm_range": "slow_60-80|medium_90-110|fast_120-140",
  "total_duration": 12,
  "virality_score": 85,
  "virality_reasons": [
    "Reason 1 why this will perform well",
    "Reason 2"
  ],
  "caption": "Caption complète prête à publier (150 chars max, avec emojis)",
  "hashtags": ["#hashtag1", "#hashtag2", "#hashtag3"]
}`,
  })

  return content
}
