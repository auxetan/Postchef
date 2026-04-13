import { useState } from 'react'
import useToastStore from '../../store/useToastStore.js'
import useAppStore from '../../store/useAppStore.js'
import { getFeature } from '../../utils/plans.js'
import { ShotIllustration } from '../ui/ShotGuide.jsx'
import FilmingMode from './FilmingMode.jsx'
import { requestClaude } from '../../utils/serverApi.js'

// ── Script generation (fallback local) ─────────────────────────────────────
function generateScript(idea) {
  const isVideo = idea.format?.includes('Vidéo') || idea.format?.includes('Reel')
  const isTikTok = idea.plateforme === 'TikTok'

  const steps = []

  steps.push({
    step: 1,
    action: isTikTok ? 'Hook visuel' : "Plan d'ouverture",
    duration: '2-3s',
    description: `Commence par un plan accrocheur. ${isTikTok ? 'Les 2 premières secondes décident si le viewer reste.' : "Capte l'attention avec un plan large ou un détail intrigant."}`,
    tip: isTikTok
      ? 'Texte overlay avec le hook dès la 1ère seconde'
      : 'Lumière naturelle, angle légèrement en plongée',
    camera: '\u{1F4F1} Portrait',
  })

  steps.push({
    step: 2,
    action: 'Plan principal',
    duration: '5-8s',
    description:
      idea.brief || 'Filme le contenu principal de ta vidéo. Garde le cadrage stable.',
    tip: 'Garde ton sujet centré, évite les mouvements brusques',
    camera: isVideo ? '\u{1F4F1} Portrait' : '\u{1F4F7} Paysage',
  })

  steps.push({
    step: 3,
    action: 'Gros plan / détail',
    duration: '2-4s',
    description:
      'Zoom sur un détail qui fait saliver : la sauce qui coule, la vapeur, la texture du plat.',
    tip: "Rapproche-toi à 15cm, le flou d'arrière-plan se fait tout seul",
    camera: '\u{1F4F1} Portrait',
  })

  steps.push({
    step: 4,
    action: 'Résultat / réaction',
    duration: '3-5s',
    description:
      "Montre le plat final servi, ou la réaction d'un client. C'est le climax de ta vidéo.",
    tip: "Une vraie réaction authentique vaut 10\u00D7 plus qu'une mise en scène",
    camera: '\u{1F4F1} Portrait',
  })

  steps.push({
    step: 5,
    action: 'Call to action',
    duration: '2-3s',
    description:
      'Termine par un texte overlay ou une phrase : "Viens goûter", "Réserve en bio", "Dispo ce weekend".',
    tip: "Ajoute toujours un CTA \u2014 les viewers ont besoin qu'on leur dise quoi faire",
    camera: '\u{1F4F1} Portrait',
  })

  return steps
}

function stepsToText(steps) {
  return steps
    .map(
      (s) =>
        `${s.step}. ${s.action} (${s.duration})\n${s.description}\nCamera : ${s.camera}\nTip : ${s.tip}`
    )
    .join('\n\n')
}

// ── Component ───────────────────────────────────────────────────────────────
export default function VideoScriptGenerator({ idea }) {
  const [state, setState] = useState('idle') // idle | loading | generated
  const [script, setScript] = useState([])
  const [filmingMode, setFilmingMode] = useState(false)
  const toast = useToastStore((s) => s.toast)

  const plan                  = useAppStore((s) => s.user.plan)
  const scriptUsed            = useAppStore((s) => s.usage.videoScriptUsedThisMonth ?? 0)
  const incrementVideoScriptUsed = useAppStore((s) => s.incrementVideoScriptUsed)

  const monthlyMax   = getFeature(plan, 'videoScriptPerMonth')
  const quotaReached = monthlyMax !== Infinity && scriptUsed >= monthlyMax

  const handleGenerate = async () => {
    if (quotaReached) return
    setState('loading')

    const prompt = `Tu es un expert en vidéo courte pour restaurants sur ${idea.plateforme}.

Idée : "${idea.hook}"
Format : ${idea.format}
Plateforme : ${idea.plateforme}
${idea.brief ? `Brief visuel : ${idea.brief}` : ''}

Crée un script vidéo structuré en 5 étapes concrètes. Réponds UNIQUEMENT en JSON valide :
[
  {
    "step": 1,
    "action": "nom court de l'étape (3-4 mots)",
    "duration": "X-Ys",
    "description": "ce qu'on filme exactement en 1-2 phrases",
    "tip": "conseil pratique court et actionable",
    "camera": "📱 Portrait"
  }
]

Format durée : "2-3s", "5-8s", etc. Camera : "📱 Portrait" ou "📷 Paysage".`

    try {
      const data = await requestClaude({
        prompt,
        maxTokens: 900,
      })
      const match  = data.text.match(/\[[\s\S]*\]/)
      const parsed = JSON.parse(match ? match[0] : data.text)
      setScript(parsed)
    } catch {
      setScript(generateScript(idea))
    }

    incrementVideoScriptUsed()
    setState('generated')
  }

  const handleCopy = () => {
    const text = stepsToText(script)
    navigator.clipboard?.writeText(text)
    toast('Script copié \u2713')
  }

  const handleReset = () => {
    setState('idle')
    setScript([])
  }

  // ── Idle ──────────────────────────────────────────────────────────────────
  if (state === 'idle') {
    if (quotaReached) {
      return (
        <div className="bg-pc-bg border border-pc-border rounded-btn px-4 py-3 text-center">
          <p className="text-[12px] font-semibold text-pc-ink-3">
            Quota atteint — {monthlyMax} scripts ce mois
          </p>
          <p className="text-[11px] text-pc-ink-4 mt-[2px]">Reset le 1er du mois</p>
        </div>
      )
    }
    return (
      <div className="space-y-[6px]">
        <button
          onClick={handleGenerate}
          className="w-full flex items-center justify-center gap-2 bg-pc-ink text-white font-bold text-[13px] py-[11px] rounded-btn hover:bg-pc-ink-2 transition-colors"
        >
          <span className="text-[16px] leading-none">{'\u{1F3AC}'}</span>
          Générer le script vidéo
        </button>
        {monthlyMax !== Infinity && (
          <p className="text-[11px] text-pc-ink-4 text-center">
            {Math.max(0, monthlyMax - scriptUsed)} script{Math.max(0, monthlyMax - scriptUsed) > 1 ? 's' : ''} restant{Math.max(0, monthlyMax - scriptUsed) > 1 ? 's' : ''} ce mois
          </p>
        )}
      </div>
    )
  }

  // ── Loading ───────────────────────────────────────────────────────────────
  if (state === 'loading') {
    return (
      <div className="bg-pc-surface border border-pc-border rounded-card px-5 py-8 text-center">
        <div
          className="w-10 h-10 rounded-full mx-auto mb-4 animate-spin"
          style={{ border: '2px solid #E8E8E6', borderTopColor: '#1D9E75' }}
        />
        <div className="text-[14px] font-bold text-pc-ink">
          Création du script...
        </div>
        <div className="text-[12px] text-pc-ink-4 mt-1">
          Analyse du format et de la plateforme
        </div>
      </div>
    )
  }

  // ── Generated ─────────────────────────────────────────────────────────────
  const totalMin = script.reduce((sum, s) => {
    const match = s.duration.match(/(\d+)-(\d+)/)
    return match ? sum + parseInt(match[1], 10) : sum
  }, 0)
  const totalMax = script.reduce((sum, s) => {
    const match = s.duration.match(/(\d+)-(\d+)/)
    return match ? sum + parseInt(match[2], 10) : sum
  }, 0)

  return (
    <div className="bg-pc-surface border border-pc-border rounded-card overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b border-pc-rule">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[16px] leading-none">{'\u{1F3AC}'}</span>
            <span className="text-[15px] font-black tracking-[-0.03em] text-pc-ink">
              Script vidéo
            </span>
          </div>
          <span className="text-[11px] font-semibold bg-pc-green-light text-pc-green border border-pc-green/20 px-[10px] py-[4px] rounded-[6px]">
            {totalMin}-{totalMax}s
          </span>
        </div>
      </div>

      {/* Timeline */}
      <div className="px-5 py-5">
        <div className="relative">
          {/* Vertical green line — centre du cercle = 14px */}
          <div
            className="absolute left-[14px] top-[28px] w-[2px] bg-pc-green/30"
            style={{ height: `calc(100% - 56px)` }}
          />

          <div className="space-y-5">
            {script.map((s) => (
              <div key={s.step} className="flex gap-3 relative">
                {/* Step circle */}
                <div className="flex-shrink-0 w-[28px] h-[28px] rounded-full bg-pc-green text-white text-[12px] font-bold flex items-center justify-center z-10">
                  {s.step}
                </div>

                {/* Shot illustration — plan de caméra visuel */}
                <div className="flex-shrink-0 pt-[1px]">
                  <ShotIllustration step={s.step} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pb-1">
                  <div className="flex items-center gap-2 mb-[6px]">
                    <span className="text-[13px] font-bold text-pc-ink">
                      {s.action}
                    </span>
                    <span className="text-[10px] font-semibold bg-pc-bg border border-pc-border text-pc-ink-3 px-[7px] py-[2px] rounded-[5px]">
                      {s.duration}
                    </span>
                  </div>

                  <p className="text-[12px] text-pc-ink-2 leading-[1.6] mb-2">
                    {s.description}
                  </p>

                  <div className="flex items-center gap-[6px] mb-2">
                    <span className="text-[10px] font-semibold text-pc-ink-4 bg-pc-bg border border-pc-border rounded-[5px] px-[7px] py-[2px]">
                      {s.camera}
                    </span>
                  </div>

                  {/* Tip box */}
                  <div className="bg-pc-bg border border-pc-border rounded-elem px-3 py-2">
                    <span className="text-[11px] text-pc-ink-3 leading-[1.5]">
                      {'\u{1F4A1}'} {s.tip}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer actions */}
      <div className="px-5 pb-5 space-y-2">
        {/* Mode Tournage — feature principale */}
        <button
          onClick={() => setFilmingMode(true)}
          className="w-full flex items-center justify-center gap-2 bg-pc-green text-white font-bold text-[13px] py-[11px] rounded-btn hover:bg-pc-green-dark transition-colors"
        >
          <span className="text-[15px] leading-none">🎬</span>
          Mode Tournage
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-2 bg-pc-ink text-white font-bold text-[12px] py-[9px] rounded-btn hover:bg-pc-ink-2 transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="4" width="7" height="7" rx="1"/>
              <path d="M8 4V2a1 1 0 00-1-1H2a1 1 0 00-1 1v5a1 1 0 001 1h2"/>
            </svg>
            Copier le script
          </button>
          <button
            onClick={handleReset}
            className="text-[12px] font-semibold text-pc-ink-3 hover:text-pc-ink transition-colors"
          >
            Réinitialiser
          </button>
        </div>
      </div>

      {/* Mode Tournage overlay */}
      {filmingMode && (
        <FilmingMode script={script} onClose={() => setFilmingMode(false)} />
      )}
    </div>
  )
}
