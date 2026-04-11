import { useNavigate } from 'react-router-dom'

export default function IdeasCounter({ used, max }) {
  const navigate = useNavigate()
  const isUnlimited = max === Infinity
  if (isUnlimited) return null

  const pct       = Math.min((used / max) * 100, 100)
  const remaining = Math.max(max - used, 0)
  const exhausted = remaining <= 0
  const almostOut = !exhausted && remaining <= 1

  const barColor  = exhausted ? '#EF4444' : almostOut ? '#F59E0B' : '#1D9E75'
  const bgColor   = exhausted ? 'rgba(239,68,68,0.06)' : almostOut ? 'rgba(245,158,11,0.06)' : 'rgba(29,158,117,0.05)'
  const borderColor = exhausted ? 'rgba(239,68,68,0.20)' : almostOut ? 'rgba(245,158,11,0.20)' : 'rgba(0,0,0,0.06)'

  return (
    <div
      className="rounded-[18px] px-5 py-4"
      style={{ background: bgColor, border: `1px solid ${borderColor}` }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-baseline gap-[6px]">
          <span
            className="text-[28px] font-[800] tracking-[-0.04em] leading-none pc-num"
            style={{ color: exhausted ? '#EF4444' : almostOut ? '#D97706' : '#0A0A0A' }}
          >
            {used}
          </span>
          <span className="text-[13px] text-pc-ink-4 font-[500]">/ {max} idées</span>
        </div>
        {!exhausted && (
          <span
            className="text-[11px] font-[700] px-2 py-[4px] rounded-pill"
            style={{ background: `${barColor}18`, color: barColor }}
          >
            {remaining} restante{remaining > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Progress bar */}
      <div className="h-[4px] bg-[rgba(0,0,0,0.06)] rounded-full overflow-hidden mb-3">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: barColor }}
        />
      </div>

      {exhausted ? (
        <div className="flex items-center justify-between">
          <span className="text-[12px] font-[500]" style={{ color: '#EF4444' }}>
            Quota épuisé · réinitialisation lundi
          </span>
          <button
            onClick={() => navigate('/app/account')}
            className="text-[12px] font-[700] text-white px-3 py-[5px] rounded-pill transition-colors"
            style={{ background: '#0A0A0A' }}
          >
            Upgrade
          </button>
        </div>
      ) : almostOut ? (
        <div className="flex items-center justify-between">
          <span className="text-[12px] font-[500] text-[#D97706]">Plus qu&apos;une idée cette semaine</span>
          <button
            onClick={() => navigate('/app/account')}
            className="text-[12px] font-[600] text-pc-green hover:opacity-70 transition-opacity"
          >
            Voir les plans →
          </button>
        </div>
      ) : (
        <p className="text-[12px] text-pc-ink-4 font-[450]">Cette semaine · réinitialisation lundi</p>
      )}
    </div>
  )
}
