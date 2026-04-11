import { useState } from 'react'
import Button from '../../components/ui/Button.jsx'
import useAppStore from '../../store/useAppStore.js'

const PRO_FEATURES = [
  'Idées IA illimitées · toutes plateformes',
  'Brief visuel + import carte menu',
  'RestaurantBrain complet (avis Google)',
  'Photo IA DALL-E · 30/mois',
  'Analytics avancé + heatmap créneaux',
  '20 Reels Studio / mois',
]

const PREMIUM_FEATURES = [
  'Tout illimité sans exception',
  'Photos DALL-E illimitées',
  'Reels Studio illimités',
  'Chef IA — assistant conversationnel 24/7',
  'Onboarding personnalisé',
  'Support dédié 7j/7',
]

export default function Step8Paywall({ onNext }) {
  const [billing, setBilling] = useState('annual') // 'monthly' | 'annual'
  const [selected, setSelected] = useState('pro')  // 'starter' | 'pro' | 'premium'
  const setPlan = useAppStore((s) => s.setPlan)

  const handleConfirm = () => {
    if (selected === 'starter') {
      setPlan('starter')
    } else if (selected === 'pro') {
      setPlan(billing === 'annual' ? 'pro_annual' : 'pro_monthly')
    } else {
      setPlan('premium')
    }
    onNext()
  }

  return (
    <div className="flex flex-col h-full min-h-screen">
      <div className="flex-1 px-6 pt-7 pb-[100px] overflow-y-auto">

        <div className="mb-6">
          <h2 className="text-[26px] font-black tracking-[-0.04em] text-pc-ink leading-none mb-1">
            Ton plan est prêt.
          </h2>
          <p className="text-[13px] text-pc-ink-4">Choisis comment débloquer PostChef.</p>
        </div>

        {/* Billing toggle */}
        <div className="flex items-center justify-center mb-6">
          <div className="flex bg-pc-bg border border-pc-border rounded-[12px] p-1 gap-1">
            <button
              onClick={() => setBilling('monthly')}
              className={`px-5 py-[8px] rounded-[9px] text-[12px] font-bold transition-all ${
                billing === 'monthly'
                  ? 'bg-pc-surface shadow-sm text-pc-ink border border-pc-border'
                  : 'text-pc-ink-4'
              }`}
            >
              Mensuel
            </button>
            <button
              onClick={() => setBilling('annual')}
              className={`px-5 py-[8px] rounded-[9px] text-[12px] font-bold transition-all flex items-center gap-2 ${
                billing === 'annual'
                  ? 'bg-pc-ink shadow-sm text-white'
                  : 'text-pc-ink-4'
              }`}
            >
              Annuel
              <span className={`text-[9px] font-bold px-[6px] py-[2px] rounded-full ${
                billing === 'annual' ? 'bg-white/20 text-white' : 'bg-pc-green/15 text-pc-green'
              }`}>
                −35%
              </span>
            </button>
          </div>
        </div>

        <div className="space-y-3">

          {/* Pro */}
          <div
            onClick={() => setSelected('pro')}
            className={`relative rounded-card border-[1.5px] cursor-pointer transition-all duration-150 px-5 py-5 bg-pc-surface ${
              selected === 'pro'
                ? 'border-pc-green ring-2 ring-pc-green/15'
                : 'border-pc-border hover:border-pc-green/40'
            }`}
          >
            {billing === 'annual' && (
              <div className="absolute -top-[11px] left-1/2 -translate-x-1/2 bg-pc-green text-white text-[11px] font-bold px-3 py-[3px] rounded-pill whitespace-nowrap">
                Recommandé · -35%
              </div>
            )}
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="text-[13px] font-semibold text-pc-ink-3 mb-[2px]">Pro</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-[30px] font-black tracking-[-0.04em] leading-none text-pc-green">
                    {billing === 'annual' ? '19€' : '29€'}
                  </span>
                  <span className="text-[13px] font-normal text-pc-ink-4">/mois</span>
                </div>
                {billing === 'annual' && (
                  <div className="text-[11px] text-pc-ink-4 mt-1">228€/an · facturé annuellement</div>
                )}
              </div>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1 transition-all border-[1.5px] ${
                selected === 'pro' ? 'bg-pc-green border-pc-green' : 'border-pc-border'
              }`}>
                {selected === 'pro' && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                )}
              </div>
            </div>
            <div className="space-y-[6px]">
              {PRO_FEATURES.map((f) => (
                <div key={f} className="flex items-center gap-2 text-[12px]">
                  <div className="w-[5px] h-[5px] rounded-full bg-pc-green flex-shrink-0" />
                  <span className="text-pc-ink-2">{f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Premium */}
          <div
            onClick={() => setSelected('premium')}
            className={`relative rounded-card border-[1.5px] cursor-pointer transition-all duration-150 px-5 py-5 overflow-hidden ${
              selected === 'premium'
                ? 'border-[#7C3AED] ring-2 ring-[#7C3AED]/15 bg-[#7C3AED]/[0.03]'
                : 'border-pc-border hover:border-[#7C3AED]/40 bg-pc-surface'
            }`}
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="flex items-center gap-2 mb-[2px]">
                  <div className="text-[13px] font-semibold text-pc-ink-3">Premium</div>
                  <span className="text-[9px] font-bold text-[#7C3AED] bg-[#7C3AED]/10 px-2 py-[2px] rounded-full">Chef IA inclus</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-[30px] font-black tracking-[-0.04em] leading-none text-[#7C3AED]">99€</span>
                  <span className="text-[13px] font-normal text-pc-ink-4">/mois</span>
                </div>
              </div>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1 transition-all border-[1.5px] ${
                selected === 'premium' ? 'bg-[#7C3AED] border-[#7C3AED]' : 'border-pc-border'
              }`}>
                {selected === 'premium' && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                )}
              </div>
            </div>
            <div className="space-y-[6px]">
              {PREMIUM_FEATURES.map((f) => (
                <div key={f} className="flex items-center gap-2 text-[12px]">
                  <div className="w-[5px] h-[5px] rounded-full bg-[#7C3AED] flex-shrink-0" />
                  <span className="text-pc-ink-2">{f}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        <p className="text-[11px] text-pc-ink-4 text-center mt-4">
          Sans engagement · Annulable à tout moment
        </p>

        {/* Starter link */}
        <button
          onClick={() => setSelected('starter')}
          className={`w-full text-center mt-3 py-2 text-[12px] font-semibold transition-colors ${
            selected === 'starter' ? 'text-pc-green' : 'text-pc-ink-4 hover:text-pc-ink'
          }`}
        >
          {selected === 'starter' ? '✓ Sélectionné · ' : ''}Continuer gratuitement — 7 jours d'essai
        </button>
      </div>

      <div className="fixed bottom-0 left-0 right-0 md:absolute px-6 pb-8 pt-4 bg-white border-t border-pc-rule max-w-[360px] md:mx-auto w-full">
        <Button fullWidth onClick={handleConfirm}>
          {selected === 'starter' ? 'Commencer gratuitement' : 'Essayer gratuitement 7 jours'}
        </Button>
      </div>
    </div>
  )
}
