import { useState } from 'react'
import Button from '../../components/ui/Button.jsx'
import useAppStore from '../../store/useAppStore.js'

const PLANS = [
  {
    id: 'pro_annual',
    name: 'Pro Annuel',
    price: '19€',
    per: '/mois',
    sub: '228€/an · facturé annuellement',
    badge: 'Recommandé · -35%',
    featured: true,
    features: [
      'Idées IA illimitées · toutes plateformes',
      'Brief visuel + import carte menu',
      'RestaurantBrain complet (avis Google)',
      'Photo IA DALL-E · 30/mois',
      'Analytics avancé + heatmap créneaux',
    ],
  },
  {
    id: 'pro_monthly',
    name: 'Pro Mensuel',
    price: '29€',
    per: '/mois',
    featured: false,
    features: [
      '20 idées / semaine · 2 plateformes',
      'Brief visuel + import carte menu',
      'RestaurantBrain basique',
      'Analytics standard',
    ],
  },
  {
    id: 'starter',
    name: 'Starter',
    price: 'Gratuit',
    per: ' · 7 jours',
    featured: false,
    muted: true,
    features: ['5 idées/sem · 1 plateforme · 3 posts/sem'],
  },
]

export default function Step8Paywall({ onNext }) {
  const [selected, setSelected] = useState('pro_annual')
  const setPlan = useAppStore((s) => s.setPlan)

  const handleConfirm = () => {
    setPlan(selected)
    onNext()
  }

  return (
    <div className="flex flex-col h-full min-h-screen">
      <div className="flex-1 px-6 pt-7 pb-[100px] overflow-y-auto">

        {/* Step title */}
        <div className="mb-6">
          <h2 className="text-[26px] font-black tracking-[-0.04em] text-pc-ink leading-none mb-1">
            Ton plan est prêt.
          </h2>
          <p className="text-[13px] text-pc-ink-4">Choisis comment débloquer PostChef.</p>
        </div>

        <div className="space-y-3">
          {PLANS.map((plan) => {
            const sel = selected === plan.id
            return (
              <div
                key={plan.id}
                onClick={() => setSelected(plan.id)}
                className={`relative rounded-card border-[1.5px] cursor-pointer transition-all duration-150 px-5 py-5 bg-pc-surface
                  ${sel
                    ? plan.featured ? 'border-pc-green ring-2 ring-pc-green/20' : 'border-pc-green'
                    : 'border-pc-border hover:border-pc-green/40'}`}
              >
                {plan.badge && (
                  <div className="absolute -top-[11px] left-1/2 -translate-x-1/2 bg-pc-green text-white text-[11px] font-bold px-3 py-[3px] rounded-pill whitespace-nowrap">
                    {plan.badge}
                  </div>
                )}

                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="text-[13px] font-semibold text-pc-ink-3 mb-[2px]">{plan.name}</div>
                    <div className={`font-black tracking-[-0.04em] leading-none ${
                      plan.muted ? 'text-[22px] text-pc-ink-2' :
                      plan.featured ? 'text-[30px] text-pc-green' : 'text-[24px] text-pc-green'
                    }`}>
                      {plan.price}
                      <span className="text-[13px] font-normal text-pc-ink-4 tracking-normal">{plan.per}</span>
                    </div>
                    {plan.sub && <div className="text-[11px] text-pc-ink-4 mt-1">{plan.sub}</div>}
                  </div>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1 transition-all border-[1.5px]
                    ${sel ? 'bg-pc-green border-pc-green' : 'border-pc-border'}`}>
                    {sel && (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    )}
                  </div>
                </div>

                <div className="space-y-[6px]">
                  {plan.features.map((f) => (
                    <div key={f} className="flex items-center gap-2 text-[12px]">
                      <div className={`w-[5px] h-[5px] rounded-full flex-shrink-0 ${plan.muted ? 'bg-pc-border' : 'bg-pc-green'}`} />
                      <span className={plan.muted ? 'text-pc-ink-4' : 'text-pc-ink-2'}>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        <p className="text-[11px] text-pc-ink-4 text-center mt-4">
          Sans engagement · Annulable à tout moment
        </p>
      </div>

      <div className="fixed bottom-0 left-0 right-0 md:absolute px-6 pb-8 pt-4 bg-white border-t border-pc-rule max-w-[360px] md:mx-auto w-full">
        <Button fullWidth onClick={handleConfirm}>
          {selected === 'starter' ? 'Commencer gratuitement' : 'Essayer gratuitement 7 jours'}
        </Button>
      </div>
    </div>
  )
}
