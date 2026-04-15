/**
 * Prompt Claude pour la Virality Engine du Studio.
 * Génère un ViralityDirective JSON optimisé pour la viralité restaurant.
 * Supporte :
 *  - Multimodal Vision : 3 frames par clip (début, milieu, fin)
 *  - ClipAnything : directive NL de l'utilisateur pour guider l'IA
 *  - Score multi-axes : Hook / Flow / Value / Trend (0–99)
 *  - Multi-highlights : 2–3 meilleurs moments par clip
 *  - Caption style : kinetic / classic / minimal / none
 */

function extractBase64(dataUrl) {
  return dataUrl.split(',')[1]
}

export function buildViralityPrompt({ restaurant, clips, platform, objective, clipAnything, captionLanguage, brandKit, templateHint }) {
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
LANGUE DES CAPTIONS : ${captionLanguage || 'fr'} (écris les captions et overlays dans cette langue)
${brandKit?.primaryColor ? `COULEUR DE MARQUE : ${brandKit.primaryColor}\n` : ''}${brandKit?.logoDataUrl ? 'LOGO : disponible, intégrer en bas à droite discrètement\n' : ''}${templateHint ? `\nFORMAT VIDÉO (priorité haute) : ${templateHint}\n` : ''}${clipAnything ? `\nDIRECTIVE CRÉATEUR (priorité maximale) : "${clipAnything}"\n` : ''}
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
9. Pour chaque clip, identifier 2–3 meilleurs moments (highlights) avec un score
10. Recommander le style de captions optimal pour la plateforme et l'objectif
11. Suggérer 1–3 B-roll IA (plans d'ambiance, gros plans plats, textures) à insérer entre les clips pour booster le rythme si pertinent
12. Les captions et text_overlays doivent être dans la langue demandée

Pour les scores multi-axes (0–99) :
- hook : force d'accroche des 2 premières secondes
- flow : rythme et fluidité du montage avec ces clips
- value : valeur perçue du contenu pour la cible
- trend : alignement sur les tendances virales actuelles

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
  "virality_score": 85,
  "virality_axes": {
    "hook": 88,
    "flow": 74,
    "value": 82,
    "trend": 79
  },
  "virality_reasons": [
    "Reason 1 why this will perform well",
    "Reason 2"
  ],
  "clip_order": [1, 2, 3],
  "clip_trims": [
    { "clip_index": 0, "start": 0.0, "end": 3.5 },
    { "clip_index": 1, "start": 1.0, "end": 4.0 }
  ],
  "clip_highlights": [
    {
      "clip_index": 0,
      "highlights": [
        { "start": 0.5, "end": 3.0, "score": 91, "reason": "Moment de révélation du plat" },
        { "start": 5.0, "end": 7.5, "score": 78, "reason": "Texture et couleurs appétissantes" }
      ]
    }
  ],
  "caption_style": "kinetic|classic|minimal|none",
  "caption_language": "${captionLanguage || 'fr'}",
  "b_roll_slots": [
    {
      "after_clip": 0,
      "duration": 1.5,
      "purpose": "dish_closeup",
      "label": "Gros plan signature",
      "prompt": "Professional food photography, extreme close-up macro of ${restaurant.specialite || 'signature dish'}, natural window light, steam rising, shallow depth of field, 8K, appetizing, vertical 9:16",
      "enabled": false
    }
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
  "caption": "Caption complète prête à publier (150 chars max, avec emojis)",
  "hashtags": ["#hashtag1", "#hashtag2", "#hashtag3"],
  "narration_script": "Script de 2-3 phrases à lire pendant le tournage (voix off, max 30 mots)"
}`,
  })

  return content
}
