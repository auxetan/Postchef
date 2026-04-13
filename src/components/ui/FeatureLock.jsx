import { useNavigate } from 'react-router-dom'
import { PLAN_DISPLAY_NAMES, requiredPlanFor } from '../../utils/plans.js'

const PLAN_COLORS = {
  pro_monthly: { bg: 'bg-[#eff6ff]', border: 'border-[#3b82f6]', badge: 'bg-[#3b82f6]', text: 'text-[#1d4ed8]' },
  pro_annual:  { bg: 'bg-pc-green-light', border: 'border-pc-green', badge: 'bg-pc-green', text: 'text-pc-green-dark' },
  premium:     { bg: 'bg-[#7C3AED]/10', border: 'border-[#7C3AED]', badge: 'bg-[#7C3AED]', text: 'text-[#7C3AED]' },
}

/**
 * FeatureLock — affiche un bloc de verrouillage à la place d'une feature.
 *
 * Props :
 *   feature     : clé de la feature (ex: 'dishPhotoGenerator')
 *   title       : titre personnalisé
 *   description : description personnalisée
 *   compact     : mode compact (juste un badge inline)
 *   children    : contenu flouté en arrière-plan (optionnel)
 */
export default function FeatureLock({ feature, title, description, compact = false, children }) {
  const navigate = useNavigate()
  const required = requiredPlanFor(feature || 'pro_annual')
  const planName = PLAN_DISPLAY_NAMES[required] || 'Pro'
  const colors = PLAN_COLORS[required] || PLAN_COLORS.pro_annual

  if (compact) {
    return (
      <span
        onClick={() => navigate('/app/account')}
        className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-[3px] rounded-pill cursor-pointer ${colors.badge} text-white`}
        title={`Disponible avec le plan ${planName}`}
      >
        <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
          <rect x="1" y="4" width="7" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
          <path d="M2.5 4V3a2 2 0 014 0v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        {planName}
      </span>
    )
  }

  return (
    <div className="relative">
      {/* Blurred preview */}
      {children && (
        <div className="pointer-events-none select-none" style={{ filter: 'blur(3px)', opacity: 0.4 }}>
          {children}
        </div>
      )}

      {/* Lock overlay */}
      <div className={`${children ? 'absolute inset-0' : ''} flex items-center justify-center`}>
        <div className={`rounded-card border-2 ${colors.border} ${colors.bg} px-5 py-5 text-center max-w-[280px] w-full mx-auto`}>
          {/* Lock icon */}
          <div className={`w-12 h-12 rounded-full ${colors.badge} mx-auto mb-3 flex items-center justify-center`}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="3" y="9" width="14" height="10" rx="2" stroke="white" strokeWidth="1.8" />
              <path d="M6 9V6a4 4 0 018 0v3" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
              <circle cx="10" cy="14" r="1.5" fill="white" />
            </svg>
          </div>

          {/* Badge */}
          <div className={`inline-flex items-center gap-1 text-[10px] font-bold px-3 py-[3px] rounded-pill ${colors.badge} text-white mb-2`}>
            {planName}
          </div>

          <div className="text-[14px] font-bold text-pc-ink mb-1">
            {title || 'Fonctionnalité Premium'}
          </div>
          <div className="text-[12px] text-pc-ink-3 leading-[1.5] mb-4">
            {description || `Disponible avec le plan ${planName}.`}
          </div>

          <button
            onClick={() => navigate('/app/account')}
            className={`w-full ${colors.badge} text-white font-bold text-[13px] py-[10px] rounded-pill hover:opacity-90 transition-opacity`}
          >
            Passer au plan {planName}
          </button>
        </div>
      </div>
    </div>
  )
}
