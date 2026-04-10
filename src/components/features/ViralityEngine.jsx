import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useAppStore from '../../store/useAppStore'
import { buildViralityPrompt } from '../../utils/viralityPrompt'
import { useCreatomate } from '../../hooks/useCreatomate'

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
  dish_reveal: '🍽️',
  behind_scenes: '👨‍🍳',
  daily_special: '⭐',
  ambiance: '✨',
  asmr_moment: '🎧',
}

const MUSIC_LABELS = {
  warm_upbeat: 'Warm & Upbeat',
  energetic: 'Énergique',
  chill_ambient: 'Chill Ambient',
  asmr_natural: 'Sons naturels',
}

function ScoreBadge({ score }) {
  const color = score > 80 ? '#1D9E75' : score >= 60 ? '#D97706' : '#737373'
  const label =
    score > 80
      ? 'Potentiel viral élevé'
      : score >= 60
        ? 'Bon potentiel'
        : 'Potentiel modéré'

  return (
    <div className="flex items-center gap-3">
      <span className="text-[42px] font-black leading-none tracking-[-0.05em]" style={{ color }}>
        {score}
      </span>
      <div>
        <div className="text-[11px] font-bold uppercase tracking-[0.08em]" style={{ color }}>
          {label}
        </div>
        <div className="text-[11px] text-pc-ink-4">Score de viralité</div>
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
  const { startRender } = useCreatomate()

  const [platform, setPlatform] = useState('TikTok')
  const [objective, setObjective] = useState('notoriété')
  const [status, setStatus] = useState('idle') // idle | analyzing | ready | error
  const [progressIdx, setProgressIdx] = useState(0)
  const [error, setError] = useState(null)

  // Progress message rotation during analysis
  useEffect(() => {
    if (status !== 'analyzing') return
    const interval = setInterval(() => {
      setProgressIdx((i) => (i + 1) % PROGRESS_MESSAGES.length)
    }, 1200)
    return () => clearInterval(interval)
  }, [status])

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
          max_tokens: 1024,
          messages: [{ role: 'user', content: prompt }],
        }),
      })

      if (!res.ok) throw new Error(`API error: ${res.status}`)

      const data = await res.json()
      const text = data.content[0].text
      // Regex fallback — handles Claude prepending text before JSON
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      const json = JSON.parse(jsonMatch ? jsonMatch[0] : text)
      setDirective(json)
      setStatus('ready')
    } catch (e) {
      setError(e.message)
      setStatus('error')
    }
  }

  const handleGenerate = async () => {
    try {
      incrementVideoReelUsed()
      await startRender(directive, clips)
      onRenderStart()
    } catch (e) {
      setError(e.message)
    }
  }

  // ─── Analyzing state ───
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
            className="text-[14px] font-bold text-pc-ink"
          >
            {PROGRESS_MESSAGES[progressIdx]}
          </motion.p>
        </AnimatePresence>
      </div>
    )
  }

  // ─── Ready state (directive received) ───
  if (status === 'ready' && directive) {
    return (
      <div className="space-y-3">
        {/* Score card */}
        <div className="bg-pc-surface border border-pc-border rounded-card px-5 py-5">
          <ScoreBadge score={directive.virality_score} />
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

        {/* Hook + Template */}
        <div className="bg-pc-surface border border-pc-border rounded-card px-5 py-5 space-y-4">
          <div>
            <div className="pc-section-label mb-1">Hook</div>
            <p className="text-[20px] font-[800] text-pc-ink tracking-[-0.02em] leading-tight">
              {directive.hook_text}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="pc-section-label">Template</span>
            <span className="text-[13px] font-semibold text-pc-ink">
              {TEMPLATE_ICONS[directive.template] || '🎬'}{' '}
              {directive.template?.replace(/_/g, ' ')}
            </span>
          </div>
        </div>

        {/* Montage plan */}
        <div className="bg-pc-surface border border-pc-border rounded-card px-5 py-5">
          <div className="pc-section-label mb-3">Plan de montage</div>
          <div className="space-y-2">
            {directive.clip_trims?.map((trim, i) => {
              const clip = clips[trim.clip_index]
              return (
                <div
                  key={i}
                  className="flex items-center gap-3 p-2 bg-pc-bg rounded-btn"
                >
                  {clip?.thumbnail && (
                    <img
                      src={clip.thumbnail}
                      alt=""
                      className="w-8 h-14 object-cover rounded-[5px]"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-semibold text-pc-ink">
                      Clip {trim.clip_index + 1}
                    </div>
                    <div className="text-[11px] text-pc-ink-3">
                      {trim.start.toFixed(1)}s → {trim.end.toFixed(1)}s ({(trim.end - trim.start).toFixed(1)}s)
                    </div>
                  </div>
                  {i < directive.clip_trims.length - 1 && (
                    <span className="text-pc-ink-4 text-[12px]">→</span>
                  )}
                </div>
              )
            })}
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className="pc-section-label">Durée totale</span>
            <span className="text-[13px] font-semibold text-pc-ink">
              {directive.total_duration}s
            </span>
          </div>
        </div>

        {/* Overlays + Music */}
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
          <div className="pt-2 border-t border-pc-rule flex items-center gap-2">
            <span className="pc-section-label">Musique</span>
            <span className="text-[12px] font-medium text-pc-ink bg-pc-bg px-2 py-0.5 rounded-[5px]">
              {MUSIC_LABELS[directive.music_mood] || directive.music_mood}
            </span>
          </div>
        </div>

        {/* Caption + Hashtags */}
        <div className="bg-pc-surface border border-pc-border rounded-card px-5 py-5 space-y-3">
          <div>
            <div className="pc-section-label mb-1">Caption</div>
            <p className="text-[13px] text-pc-ink">{directive.caption}</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {directive.hashtags?.map((h, i) => (
              <span
                key={i}
                className="text-[11px] font-semibold bg-pc-green-light text-pc-green border border-pc-green/20 px-[10px] py-[4px] rounded-[6px]"
              >
                {h}
              </span>
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
            onClick={handleGenerate}
            className="flex-[2] py-[11px] rounded-btn text-[13px] font-bold text-white bg-pc-green hover:bg-pc-green-dark active:scale-[0.98] transition-all"
          >
            Générer mon Reel
          </button>
        </div>
      </div>
    )
  }

  // ─── Idle state (platform + objective selection) ───
  return (
    <div className="space-y-3">
      {/* Platform selector */}
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

      {/* Objective selector */}
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

      {/* Clips summary */}
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
              <span className="text-[11px] text-pc-ink-3">
                {clip.duration.toFixed(1)}s
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Error */}
      {status === 'error' && error && (
        <div className="bg-red-50 border border-red-200 rounded-card p-4 text-[13px] text-red-700">
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
          onClick={runAnalysis}
          className="flex-[2] py-[11px] rounded-btn text-[13px] font-bold text-white bg-pc-ink hover:bg-pc-ink-2 active:scale-[0.98] transition-all"
        >
          Lancer l'analyse IA
        </button>
      </div>
    </div>
  )
}
