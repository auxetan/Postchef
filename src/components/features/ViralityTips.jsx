/**
 * ViralityTips — Suggestions dynamiques pour booster le score
 * Tips calculés localement à partir des axes (pas d'appel IA supplémentaire).
 */

const TIPS_BY_AXIS = {
  hook: {
    low:  'Hook faible : raccourcis les 2 premières secondes ou teste une variante A/B/C.',
    mid:  'Teste un hook plus fort (pattern interrupt, question directe).',
  },
  flow: {
    low:  'Flow cassé : ajoute 1 clip court (2-4s) ou sélectionne des highlights plus dynamiques.',
    mid:  'Rythme améliorable : vise des cuts toutes les 2-3s sur cette plateforme.',
  },
  value: {
    low:  'Valeur perçue faible : ajoute un B-roll IA (gros plan, plat signature) ou un overlay informatif.',
    mid:  'Renforce la promesse : ajoute une caption qui explique pourquoi ce plat vaut le détour.',
  },
  trend: {
    low:  'Peu aligné sur les tendances : change le template ou active les captions kinetic (TikTok 2025).',
    mid:  'Teste un mood musical plus actuel (energetic pour TikTok, warm_upbeat pour Reels).',
  },
}

export default function ViralityTips({ axes }) {
  if (!axes) return null

  // Extraire les tips pertinents (axes < 80)
  const tips = []
  Object.entries(axes).forEach(([axis, score]) => {
    if (!TIPS_BY_AXIS[axis]) return
    if (score < 60) tips.push({ axis, score, text: TIPS_BY_AXIS[axis].low, severity: 'high' })
    else if (score < 80) tips.push({ axis, score, text: TIPS_BY_AXIS[axis].mid, severity: 'mid' })
  })

  if (tips.length === 0) {
    return (
      <div className="bg-pc-green/5 border border-pc-green rounded-card px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="text-[16px]">🎯</span>
          <span className="text-[13px] font-bold text-pc-green">
            Score optimal — prêt à publier
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-pc-surface border border-pc-border rounded-card px-5 py-5">
      <div className="flex items-center justify-between mb-3">
        <div className="pc-section-label">Boost ton score</div>
        <span className="text-[11px] text-pc-ink-4">{tips.length} suggestion{tips.length > 1 ? 's' : ''}</span>
      </div>
      <ul className="space-y-2">
        {tips.map((tip, i) => (
          <li key={i} className="flex items-start gap-2">
            <span
              className={`mt-0.5 text-[10px] font-black uppercase tracking-[0.08em] shrink-0 ${
                tip.severity === 'high' ? 'text-[#DC2626]' : 'text-[#D97706]'
              }`}
            >
              {tip.axis}
            </span>
            <span className="text-[12px] text-pc-ink-2 leading-snug">{tip.text}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
