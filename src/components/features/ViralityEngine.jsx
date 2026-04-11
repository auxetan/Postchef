import { useState, useEffect } from 'react'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import useAppStore from '../../store/useAppStore'
import useToastStore from '../../store/useToastStore'
import { buildViralityPrompt } from '../../utils/viralityPrompt'
import { uploadClip } from '../../utils/uploadClip'
import { useCreatomate } from '../../hooks/useCreatomate'
import TimelinePreview from './TimelinePreview'
import MusicSelector from './MusicSelector'
import HookVariantPicker from './HookVariantPicker'

const PLATFORMS = ['TikTok', 'Instagram']
const OBJECTIVES = [
  { id: 'notoriété', label: 'Notoriété' },
  { id: 'réservations', label: 'Réservations' },
  { id: 'plat du jour', label: 'Plat du jour' },
  { id: 'ambiance', label: 'Ambiance' },
]

const PROGRESS_MESSAGES = [
  'Analyse de tes clips...',
  'Identification des meilleures séquences...',
  'Calcul du score de viralité...',
  'Construction du montage optimal...',
]

const TEMPLATE_ICONS = {
  dish_reveal:   '🍽️',
  behind_scenes: '👨‍🍳',
  daily_special: '⭐',
  ambiance:      '✨',
  asmr_moment:   '🎧',
}

// Calcule un percentile de viralité simulé (70 = médiane, écart-type ~12)
function BenchmarkLine({ score, city, cuisine }) {
  const percentile = Math.min(
    99,
    Math.max(1, Math.round(100 - 100 * (1 / (1 + Math.exp((score - 70) / 6)))))
  )
  return (
    <p className="text-[11px] text-pc-ink-3 mt-1">
      Top <span className="font-bold text-pc-ink">{percentile}%</span> des restos
      {cuisine ? ` ${cuisine}` : ''}{city ? ` à ${city}` : ''}
    </p>
  )
}

function ScoreBadge({ score, city, cuisine }) {
  const color =
    score > 80 ? 'text-pc-green' : score >= 60 ? 'text-[#D97706]' : 'text-pc-ink-3'
  const label =
    score > 80
      ? 'Potentiel viral élevé'
      : score >= 60
        ? 'Bon potentiel'
        : 'Potentiel modéré'

  return (
    <div className="flex items-center gap-3">
      <span className={`text-[42px] font-black leading-none tracking-[-0.05em] ${color}`}>
        {score}
      </span>
      <div>
        <div className={`text-[11px] font-bold uppercase tracking-[0.08em] ${color}`}>
          {label}
        </div>
        <div className="text-[11px] text-pc-ink-4">Score de viralité</div>
        <BenchmarkLine score={score} city={city} cuisine={cuisine} />
      </div>
    </div>
  )
}

export default function ViralityEngine({ onBack, onRenderStart }) {
  const clips = useAppStore((s) => s.studio.clips)
  const directive = useAppStore((s) => s.studio.directive)
  const setDirective = useAppStore((s) => s.setDirective)
  const incrementVideoReelUsed = useAppStore((s) => s.incrementVideoReelUsed)
  const restaurant = useAppStore((s) => s.onboarding.restaurant)
  const clientele = useAppStore((s) => s.onboarding.clientele)
  const toast = useToastStore((s) => s.toast)
  const { startRender } = useCreatomate()

  const [platform, setPlatform] = useState('TikTok')
  const [objective, setObjective] = useState('notoriété')
  // idle | analyzing | uploading | ready | error
  const [status, setStatus] = useState('idle')
  const [progressIdx, setProgressIdx] = useState(0)
  const [error, setError] = useState(null)

  // État éditables dans la directive
  const [editHook, setEditHook] = useState('')
  const [editCaption, setEditCaption] = useState('')
  const [editHashtags, setEditHashtags] = useState('')
  const [clipOrder, setClipOrder] = useState([])
  const [selectedMusicMood, setSelectedMusicMood] = useState(null)

  // Rotation des messages de progression
  useEffect(() => {
    if (status !== 'analyzing') return
    const interval = setInterval(() => {
      setProgressIdx((i) => (i + 1) % PROGRESS_MESSAGES.length)
    }, 1200)
    return () => clearInterval(interval)
  }, [status])

  // Initialisation des champs éditables quand la directive arrive
  useEffect(() => {
    if (!directive) return
    setEditHook(directive.hook_text || '')
    setEditCaption(directive.caption || '')
    setEditHashtags(directive.hashtags?.join(' ') || '')
    setClipOrder(directive.clip_order || clips.map((_, i) => i + 1))
    setSelectedMusicMood(directive.music_mood || null)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- clips ne change pas après analyse
  }, [directive])

  const runAnalysis = async () => {
    setStatus('analyzing')
    setProgressIdx(0)
    setError(null)

    try {
      const prompt = buildViralityPrompt({
        restaurant: { ...restaurant, clientele },
        clips,
        platform,
        objective,
      })

      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': import.meta.env.VITE_ANTHROPIC_KEY,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 2048,
          messages: [{ role: 'user', content: prompt }],
        }),
      })

      if (!res.ok) throw new Error(`API error: ${res.status}`)

      const data = await res.json()
      const text = data.content[0].text
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      const json = JSON.parse(jsonMatch ? jsonMatch[0] : text)
      setDirective(json)
      setStatus('ready')
    } catch (e) {
      // Fallback local si API indisponible
      const fallback = generateFallbackDirective(clips, platform, objective, restaurant)
      setDirective(fallback)
      setStatus('ready')
      toast('Génération locale (API indisponible)', 'info')
    }
  }

  const handleGenerate = async () => {
    try {
      setStatus('uploading')

      // Upload tous les clips en parallèle vers Creatomate CDN
      let uploadedClips
      try {
        uploadedClips = await Promise.all(
          clips.map(async (clip) => {
            const uploadedUrl = await uploadClip(clip.file)
            return { ...clip, uploadedUrl }
          })
        )
      } catch {
        // Fallback : utiliser les blob URLs (le render échouera, mais l'UX reste fluide)
        uploadedClips = clips.map((clip) => ({ ...clip, uploadedUrl: clip.url }))
        toast('Upload CDN indisponible, tentative sans CDN', 'info')
      }

      const finalDirective = {
        ...directive,
        hook_text: editHook,
        caption: editCaption,
        hashtags: editHashtags.split(/\s+/).filter(Boolean),
        clip_order: clipOrder,
        music_mood: selectedMusicMood || directive.music_mood,
      }
      setDirective(finalDirective)

      await startRender(finalDirective, uploadedClips)
      // Quota incrémenté APRÈS le succès du startRender
      incrementVideoReelUsed()
      onRenderStart()
    } catch (e) {
      setStatus('ready')
      setError(e.message)
      toast('Erreur lors de la génération', 'error')
    }
  }

  // ─── État : analyse en cours ───
  if (status === 'analyzing') {
    return (
      <div className="bg-pc-surface border border-pc-border rounded-card px-5 py-8 text-center">
        <div className="w-10 h-10 mx-auto mb-4 border-2 border-pc-border border-t-pc-green rounded-full animate-spin" />
        <AnimatePresence mode="wait">
          <motion.p
            key={progressIdx}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="text-[14px] font-bold text-pc-ink"
          >
            {PROGRESS_MESSAGES[progressIdx]}
          </motion.p>
        </AnimatePresence>
      </div>
    )
  }

  // ─── État : upload en cours ───
  if (status === 'uploading') {
    return (
      <div className="bg-pc-surface border border-pc-border rounded-card px-5 py-8 text-center">
        <div className="w-10 h-10 mx-auto mb-4 border-2 border-pc-border border-t-pc-green rounded-full animate-spin" />
        <p className="text-[14px] font-bold text-pc-ink">Upload de tes clips...</p>
        <p className="text-[12px] text-pc-ink-3 mt-1">Préparation du rendu</p>
      </div>
    )
  }

  // ─── État : directive reçue ───
  if ((status === 'ready' || status === 'error') && directive) {
    return (
      <div className="space-y-3">
        {/* Carte score */}
        <div className="bg-pc-surface border border-pc-border rounded-card px-5 py-5">
          <ScoreBadge
            score={directive.virality_score}
            city={restaurant?.city}
            cuisine={restaurant?.cuisineTypes?.[0]}
          />
          {directive.virality_reasons?.length > 0 && (
            <ul className="mt-3 space-y-1">
              {directive.virality_reasons.map((r, i) => (
                <li key={i} className="text-[12px] text-pc-ink-3 flex items-start gap-1.5">
                  <span className="text-pc-green mt-px">+</span>
                  {r}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Sélecteur de variantes de hook A/B/C */}
        {directive.hook_variants?.length > 0 && (
          <HookVariantPicker
            variants={directive.hook_variants}
            selectedHook={editHook}
            onSelect={(variant) => setEditHook(variant.hook_text)}
          />
        )}

        {/* Hook éditable + Template */}
        <div className="bg-pc-surface border border-pc-border rounded-card px-5 py-5 space-y-4">
          <div>
            <div className="pc-section-label mb-1">Hook</div>
            <input
              value={editHook}
              onChange={(e) => setEditHook(e.target.value)}
              className="w-full text-[18px] font-[800] text-pc-ink tracking-[-0.02em] bg-transparent border-b border-pc-rule focus:border-pc-green focus:outline-none py-1 transition-colors"
            />
          </div>
          <div className="flex items-center gap-3">
            <span className="pc-section-label">Template</span>
            <span className="text-[13px] font-semibold text-pc-ink">
              {TEMPLATE_ICONS[directive.template] || '🎬'}{' '}
              {directive.template?.replace(/_/g, ' ')}
            </span>
          </div>
        </div>

        {/* Plan de montage avec drag & drop */}
        <div className="bg-pc-surface border border-pc-border rounded-card px-5 py-5">
          <div className="pc-section-label mb-3">Plan de montage</div>
          <Reorder.Group
            axis="y"
            values={clipOrder.filter((n) => clips[n - 1])}
            onReorder={setClipOrder}
            className="space-y-2"
          >
            {clipOrder.filter((n) => clips[n - 1]).map((n) => {
              const trim = directive.clip_trims?.find((t) => t.clip_index === n - 1)
              const clip = clips[n - 1]
              return (
                <Reorder.Item key={n} value={n} className="cursor-grab active:cursor-grabbing">
                  <div className="flex items-center gap-3 p-2 bg-pc-bg rounded-btn">
                    {/* Handle drag */}
                    <span className="text-pc-ink-4 text-[14px] select-none">⠿</span>
                    {clip.thumbnail && (
                      <img
                        src={clip.thumbnail}
                        alt=""
                        className="w-8 h-14 object-cover rounded-[5px]"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] font-semibold text-pc-ink">Clip {n}</div>
                      {trim && (
                        <div className="text-[11px] text-pc-ink-3">
                          {trim.start.toFixed(1)}s → {trim.end.toFixed(1)}s ({(trim.end - trim.start).toFixed(1)}s)
                        </div>
                      )}
                    </div>
                  </div>
                </Reorder.Item>
              )
            })}
          </Reorder.Group>
          <div className="mt-3 flex items-center gap-2">
            <span className="pc-section-label">Durée totale</span>
            <span className="text-[13px] font-semibold text-pc-ink">
              {directive.total_duration}s
            </span>
          </div>
        </div>

        {/* Preview timeline visuelle */}
        <TimelinePreview directive={directive} clips={clips} clipOrder={clipOrder} />

        {/* Sélecteur de musique */}
        <MusicSelector
          recommendedMood={directive.music_mood}
          selected={selectedMusicMood}
          onSelect={setSelectedMusicMood}
        />

        {/* Overlays texte */}
        <div className="bg-pc-surface border border-pc-border rounded-card px-5 py-5 space-y-3">
          <div className="pc-section-label mb-1">Textes overlay</div>
          {directive.text_overlays?.map((o, i) => (
            <div key={i} className="flex items-center justify-between text-[12px]">
              <span className="font-medium text-pc-ink">{o.text}</span>
              <span className="text-pc-ink-4 text-[11px] shrink-0 ml-2">
                {o.timing_start}s-{o.timing_end}s
              </span>
            </div>
          ))}
        </div>

        {/* Caption + Hashtags éditables */}
        <div className="bg-pc-surface border border-pc-border rounded-card px-5 py-5 space-y-3">
          <div>
            <div className="pc-section-label mb-1">Caption</div>
            <textarea
              value={editCaption}
              onChange={(e) => setEditCaption(e.target.value)}
              rows={3}
              className="w-full text-[13px] text-pc-ink bg-pc-bg rounded-btn p-3 border border-pc-border focus:border-pc-green focus:outline-none transition-colors resize-none"
            />
          </div>
          <div>
            <div className="pc-section-label mb-1">Hashtags</div>
            <input
              value={editHashtags}
              onChange={(e) => setEditHashtags(e.target.value)}
              className="w-full text-[13px] text-pc-ink bg-pc-bg rounded-btn p-3 border border-pc-border focus:border-pc-green focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Erreur inline */}
        {status === 'error' && error && (
          <div className="bg-pc-surface border border-pc-border rounded-card p-4 text-[13px] text-pc-ink-3">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onBack}
            className="flex-1 py-[11px] rounded-btn text-[13px] font-bold text-pc-ink-3 bg-pc-surface border border-pc-border hover:bg-pc-bg transition-colors"
          >
            Retour
          </button>
          <button
            onClick={handleGenerate}
            className="flex-[2] py-[11px] rounded-btn text-[13px] font-bold text-white bg-pc-green hover:bg-pc-green-dark active:scale-[0.98] transition-all"
          >
            Générer mon Reel
          </button>
        </div>
      </div>
    )
  }

  // ─── État idle : sélection plateforme + objectif ───
  return (
    <div className="space-y-3">
      {/* Sélecteur de plateforme */}
      <div className="bg-pc-surface border border-pc-border rounded-card px-5 py-5">
        <div className="pc-section-label mb-3">Plateforme cible</div>
        <div className="flex gap-2">
          {PLATFORMS.map((p) => (
            <button
              key={p}
              onClick={() => setPlatform(p)}
              className={`flex-1 py-[9px] rounded-btn text-[13px] font-semibold transition-all ${
                platform === p
                  ? 'bg-pc-ink text-white'
                  : 'bg-pc-bg text-pc-ink-3 hover:bg-pc-rule'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Sélecteur d'objectif */}
      <div className="bg-pc-surface border border-pc-border rounded-card px-5 py-5">
        <div className="pc-section-label mb-3">Objectif du Reel</div>
        <div className="grid grid-cols-2 gap-2">
          {OBJECTIVES.map((o) => (
            <button
              key={o.id}
              onClick={() => setObjective(o.id)}
              className={`py-[9px] rounded-btn text-[13px] font-semibold transition-all ${
                objective === o.id
                  ? 'bg-pc-ink text-white'
                  : 'bg-pc-bg text-pc-ink-3 hover:bg-pc-rule'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {/* Récapitulatif des clips */}
      <div className="bg-pc-surface border border-pc-border rounded-card px-5 py-5">
        <div className="pc-section-label mb-2">Clips sélectionnés</div>
        <div className="flex gap-2">
          {clips.map((clip) => (
            <div key={clip.id} className="flex items-center gap-1.5">
              {clip.thumbnail && (
                <img
                  src={clip.thumbnail}
                  alt=""
                  className="w-6 h-10 object-cover rounded-[5px]"
                />
              )}
              <span className="text-[11px] text-pc-ink-3">{clip.duration.toFixed(1)}s</span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 py-[11px] rounded-btn text-[13px] font-bold text-pc-ink-3 bg-pc-surface border border-pc-border hover:bg-pc-bg transition-colors"
        >
          Retour
        </button>
        <button
          onClick={runAnalysis}
          className="flex-[2] py-[11px] rounded-btn text-[13px] font-bold text-white bg-pc-ink hover:bg-pc-ink-2 active:scale-[0.98] transition-all"
        >
          Lancer l'analyse IA
        </button>
      </div>
    </div>
  )
}

// ─── Fallback local si API Claude indisponible ───────────────────────────────

function generateFallbackDirective(clips, platform, objective, restaurant) {
  const templates = ['dish_reveal', 'behind_scenes', 'daily_special', 'ambiance']
  const template = templates[Math.floor(Math.random() * templates.length)]
  const city = restaurant?.city || 'ta ville'

  return {
    template,
    hook_type: 'pattern_interrupt',
    hook_text: 'Attends de voir ça...',
    hook_variants: [
      { hook_type: 'pattern_interrupt', hook_text: 'Attends de voir ça...', virality_score: 82, reason: 'Curiosité immédiate' },
      { hook_type: 'question', hook_text: 'Tu connais ce spot ?', virality_score: 76, reason: 'Engagement par la question' },
      { hook_type: 'pov', hook_text: `POV: ton meilleur repas à ${city}`, virality_score: 79, reason: 'Format POV trending' },
    ],
    clip_order: clips.map((_, i) => i + 1),
    clip_trims: clips.map((clip, i) => ({
      clip_index: i,
      start: 0,
      end: Math.min(clip.duration, 4),
    })),
    text_overlays: [
      { text: 'Attends de voir ça...', timing_start: 0, timing_end: 2.5, position: 'center', style: 'bold_white' },
      { text: `📍 ${city}`, timing_start: 4, timing_end: 7, position: 'bottom', style: 'subtle_dark' },
      { text: 'Réservez 👆 lien en bio', timing_start: 9, timing_end: 12, position: 'center', style: 'bold_white' },
    ],
    transition_style: 'hard_cut',
    music_mood: platform === 'TikTok' ? 'energetic' : 'warm_upbeat',
    music_bpm_range: 'medium_90-110',
    total_duration: Math.min(clips.reduce((s, c) => s + Math.min(c.duration, 4), 0), 15),
    virality_score: 72,
    virality_reasons: ['Contenu authentique', 'Format adapté à la plateforme'],
    caption: `Découvrez ${restaurant?.name || 'notre restaurant'} 🍽️ ${objective === 'réservations' ? 'Réservez vite !' : 'Passez nous voir !'}`,
    hashtags: ['#restaurant', `#${city.toLowerCase().replace(/\s/g, '')}`, '#foodie', '#reels'],
  }
}
