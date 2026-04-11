/**
 * ViralityAxesScore — Score multi-axes façon Opus Clip
 * 4 dimensions : Hook / Flow / Value / Trend (0–99)
 */

const AXES = [
  {
    key: 'hook',
    label: 'Hook',
    description: "Force d'accroche des 2 premières secondes",
    icon: '⚡',
  },
  {
    key: 'flow',
    label: 'Flow',
    description: 'Rythme et fluidité du montage',
    icon: '🌊',
  },
  {
    key: 'value',
    label: 'Value',
    description: 'Valeur perçue du contenu',
    icon: '💎',
  },
  {
    key: 'trend',
    label: 'Trend',
    description: 'Alignement sur les tendances actuelles',
    icon: '📈',
  },
]

function axisColor(score) {
  if (score >= 80) return { bar: 'bg-pc-green', text: 'text-pc-green' }
  if (score >= 60) return { bar: 'bg-[#D97706]', text: 'text-[#D97706]' }
  return { bar: 'bg-pc-ink-3', text: 'text-pc-ink-3' }
}

export default function ViralityAxesScore({ axes }) {
  if (!axes) return null

  return (
    <div className="bg-pc-surface border border-pc-border rounded-card px-5 py-5">
      <div className="pc-section-label mb-4">Analyse multi-axes</div>
      <div className="space-y-3">
        {AXES.map(({ key, label, description, icon }) => {
          const score = axes[key] ?? 0
          const { bar, text } = axisColor(score)
          return (
            <div key={key}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[13px]">{icon}</span>
                  <span className="text-[12px] font-bold text-pc-ink">{label}</span>
                  <span className="text-[11px] text-pc-ink-4 hidden sm:inline">
                    — {description}
                  </span>
                </div>
                <span className={`text-[13px] font-black ${text}`}>{score}</span>
              </div>
              <div className="h-[5px] bg-pc-bg rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${bar}`}
                  style={{ width: `${score}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
