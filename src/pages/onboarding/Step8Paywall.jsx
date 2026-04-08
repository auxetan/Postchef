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
      'Photo IA DALL-E complète',
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
      'Photo IA (prompt Midjourney)',
      'Analytics standard',
    ],
  },
  {
    id: 'starter',
    name: 'Starter',
    price: 'Gratuit',
    per: ' · 7 jours',
    featured: false,
    features: ['5 idées/sem · 1 plateforme · 3 posts/sem'],
    muted: true,
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
    <div className="flex flex-col h-full">
      <div className="flex-1 px-5 pt-5 pb-[110px]">
        <div className="text-center mb-5">
          <h2 className="text-[22px] font-extrabold text-pc-text tracking-[-0.5px] mb-1">
            Ton plan est prêt.
          </h2>
          <p className="text-[13px] text-pc-muted">Choisis comment débloquer PostChef.</p>
        </div>

        <div className="space-y-[10px]">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              onClick={() => setSelected(plan.id)}
              className={`relative rounded-card border cursor-pointer transition-all duration-150 px-[17px] py-[15px] bg-white
                ${selected === plan.id && plan.featured ? 'border-2 border-pc-green' : selected === plan.id ? 'border-[1.5px] border-pc-green' : 'border-[1.5px] border-pc-border'}`}
            >
              {plan.badge && (
                <div className="absolute -top-[11px] left-1/2 -translate-x-1/2 bg-pc-green text-white text-[11px] font-bold px-3 py-[3px] rounded-pill whitespace-nowrap">
                  {plan.badge}
                </div>
              )}

              <div className="flex justify-between items-start">
                <div>
                  <div className="text-[15px] font-bold text-[#111] mb-[2px]">{plan.name}</div>
                  <div className={`font-extrabold tracking-[-1px] ${plan.muted ? 'text-[20px] text-[#374151]' : plan.featured ? 'text-[28px] text-pc-green' : 'text-[22px] text-pc-green'}`}>
                    {plan.price}
                    <span className="text-[13px] font-normal text-pc-hint">{plan.per}</span>
                  </div>
                  {plan.sub && (
                    <div className="text-[11px] text-pc-hint mt-[2px]">{plan.sub}</div>
                  )}
                </div>
                <div className={`w-[22px] h-[22px] rounded-full flex items-center justify-center flex-shrink-0 mt-1 transition-all
                  ${selected === plan.id ? 'bg-pc-green' : 'border-[1.5px] border-pc-border'}`}>
                  {selected === plan.id && (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  )}
                </div>
              </div>

              {plan.features.length > 0 && (
                <div className="mt-[5px] space-y-[3px]">
                  {plan.features.map((f) => (
                    <div
                      key={f}
                      className={`flex items-center gap-[6px] text-[12px] ${plan.muted ? 'text-pc-hint' : 'text-[#374151]'}`}
                    >
                      <div className={`w-[5px] h-[5px] rounded-full flex-shrink-0 ${plan.muted ? 'bg-[#d1d5db]' : 'bg-pc-green'}`} />
                      {f}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="text-[11px] text-pc-hint text-center mt-2">
          Sans engagement · Annulable à tout moment
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 px-5 pb-7 pt-[14px] bg-white">
        <Button fullWidth onClick={handleConfirm}>
          {selected === 'starter' ? 'Commencer gratuitement' : 'Essayer gratuitement 7 jours'}
        </Button>
      </div>
    </div>
  )
}
