import { useNavigate } from 'react-router-dom'

export default function IdeasCounter({ used, max }) {
  const navigate = useNavigate()
  const isUnlimited = max === Infinity
  if (isUnlimited) return null

  const pct       = Math.min((used / max) * 100, 100)
  const remaining = max - used
  const almostOut = remaining <= 1
  const exhausted = remaining <= 0

  return (
    <div className={`bg-pc-surface border rounded-card px-5 py-4
      ${exhausted ? 'border-[#fca5a5]' : almostOut ? 'border-[#fde68a]' : 'border-pc-border'}`}>

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-baseline gap-2">
          <span className={`text-[28px] font-black tracking-[-0.04em] leading-none pc-num
            ${exhausted ? 'text-[#ef4444]' : almostOut ? 'text-[#d97706]' : 'text-pc-ink'}`}>
            {used}
          </span>
          <span className="text-[13px] text-pc-ink-4 font-medium">/ {max} idées</span>
        </div>
        {!exhausted && (
          <span className="pc-section-label">{remaining} restante{remaining > 1 ? 's' : ''}</span>
        )}
      </div>

      {/* Progress bar */}
      <div className="h-[3px] bg-pc-rule rounded-full overflow-hidden mb-3">
        <div
          className={`h-full rounded-full transition-all duration-500
            ${exhausted ? 'bg-[#ef4444]' : almostOut ? 'bg-[#f59e0b]' : 'bg-pc-green'}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {exhausted ? (
        <div className="flex items-center justify-between">
          <span className="text-[12px] text-[#ef4444] font-medium">Quota épuisé · réinitialisation lundi</span>
          <button onClick={() => navigate('/app/account')}
            className="text-[12px] font-bold text-white bg-pc-ink rounded-btn px-3 py-[5px] hover:bg-pc-ink-2 transition-colors">
            Upgrade
          </button>
        </div>
      ) : almostOut ? (
        <div className="flex items-center justify-between">
          <span className="text-[12px] text-[#d97706] font-medium">Presque épuisé cette semaine</span>
          <button onClick={() => navigate('/app/account')}
            className="text-[12px] font-semibold text-pc-green border-b border-pc-green hover:opacity-70 transition-opacity">
            Voir les plans
          </button>
        </div>
      ) : (
        <p className="text-[12px] text-pc-ink-4">Cette semaine · réinitialisation lundi</p>
      )}
    </div>
  )
}
