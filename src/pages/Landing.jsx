import { useNavigate } from 'react-router-dom'
import usePWAInstall from '../hooks/usePWAInstall.js'

const FEATURES = [
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#1D9E75" strokeWidth="1.8">
        <rect x="2" y="2" width="14" height="14" rx="2" />
        <line x1="6" y1="2" x2="6" y2="16" />
        <line x1="12" y1="2" x2="12" y2="16" />
        <line x1="2" y1="8" x2="16" y2="8" />
      </svg>
    ),
    title: 'Calendrier IA',
    desc: '7 jours de posts planifiés auto',
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#1D9E75" strokeWidth="1.8">
        <path d="M9 2l2 5h5l-4 3 1.5 5L9 12l-4.5 3L6 10 2 7h5z" />
      </svg>
    ),
    title: 'Hooks viraux',
    desc: 'Accroches testées pour TikTok',
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#1D9E75" strokeWidth="1.8">
        <circle cx="9" cy="9" r="7" />
        <line x1="9" y1="4" x2="9" y2="9" />
        <line x1="9" y1="9" x2="12" y2="12" />
      </svg>
    ),
    title: 'Veille locale',
    desc: 'Tendances et événements',
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#1D9E75" strokeWidth="1.8">
        <path d="M2 14l4-4 3 3 5-6 4 7H2z" />
      </svg>
    ),
    title: 'Briefs visuels',
    desc: 'Angle, lumière, mise en scène',
  },
]

const TESTIMONIALS = [
  {
    initials: 'SR',
    name: 'Sophie R.',
    resto: 'Chez Sophie · Aix-en-Provence',
    text: '"En 3 semaines, mes Reels ont doublé ma file d\'attente le vendredi soir."',
    color: 'bg-pc-green',
  },
  {
    initials: 'ML',
    name: 'Marco L.',
    resto: 'La Trattoria · Marseille',
    text: '"J\'aurais jamais trouvé ces idées seul. Le brief visuel m\'a tout changé."',
    color: 'bg-pc-green-mid',
  },
]

export default function Landing() {
  const navigate = useNavigate()
  const { canInstall, install } = usePWAInstall()

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* PWA install banner */}
      {canInstall && (
        <div className="bg-pc-green text-white px-5 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round"><rect x="2" y="2" width="12" height="12" rx="2" /><path d="M8 5v6M5 8l3 3 3-3" /></svg>
            <span className="text-[13px] font-semibold">Installer PostChef sur ton téléphone</span>
          </div>
          <button
            onClick={install}
            className="text-[12px] font-bold bg-white text-pc-green px-3 py-[5px] rounded-pill flex-shrink-0 hover:bg-pc-green-light transition-colors"
          >
            Installer
          </button>
        </div>
      )}

      {/* Navbar */}
      <nav className="flex justify-between items-center px-5 py-4 border-b border-pc-divider sticky top-0 bg-white z-50">
        <span className="text-[17px] font-extrabold text-pc-text tracking-[-0.3px]">
          Post<span className="text-pc-green">Chef</span>
        </span>
        <button
          onClick={() => navigate('/onboarding')}
          className="bg-pc-green text-white text-[13px] font-bold px-[18px] py-[9px] rounded-pill hover:bg-pc-green-dark transition-colors"
        >
          Essayer gratuitement
        </button>
      </nav>

      {/* Hero */}
      <section className="px-5 py-10 text-center max-w-lg mx-auto">
        <h1 className="text-[32px] font-black text-pc-text leading-[1.15] tracking-[-1.2px] mb-[14px]">
          Ton resto mérite<br />d'être{' '}
          <em className="text-pc-green not-italic">vu.</em>
        </h1>
        <p className="text-[14px] text-pc-muted leading-[1.7] mb-6">
          PostChef génère ton calendrier TikTok & Instagram en 3 minutes. Adapté à ta cuisine, ta clientèle, ton rythme.
        </p>
        <button
          onClick={() => navigate('/onboarding')}
          className="bg-pc-green text-white text-[15px] font-bold px-7 py-[14px] rounded-pill hover:bg-pc-green-dark transition-colors active:scale-[0.98]"
        >
          Commencer gratuitement
        </button>
        <div className="flex gap-[7px] justify-center flex-wrap mt-5">
          {['Sans CB', '7 jours offerts', '850+ restos'].map((b) => (
            <span key={b} className="text-[11px] font-medium text-pc-green-dark bg-pc-green-light px-3 py-[5px] rounded-pill">
              {b}
            </span>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="px-5 pb-8 max-w-lg mx-auto">
        <div className="mb-4">
          <div className="text-[11px] font-semibold text-pc-green uppercase tracking-[0.1em] mb-[6px]">
            Fonctionnalités
          </div>
          <h2 className="text-[22px] font-black text-pc-text tracking-[-0.8px] leading-[1.2]">
            Tout ce qu'il te faut,<br />rien de plus.
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-[10px]">
          {FEATURES.map((f) => (
            <div key={f.title} className="bg-pc-bg rounded-[18px] p-4">
              <div className="w-[34px] h-[34px] rounded-[10px] bg-pc-green-light flex items-center justify-center mb-[9px]">
                {f.icon}
              </div>
              <div className="text-[13px] font-bold text-[#111] mb-[3px]">{f.title}</div>
              <div className="text-[11px] text-pc-hint leading-[1.5]">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-5 py-6 bg-pc-bg">
        <div className="max-w-lg mx-auto">
          <h3 className="text-[20px] font-black text-pc-text tracking-[-0.8px] mb-4">
            Ils en parlent mieux que nous.
          </h3>
          <div className="space-y-3">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="bg-white rounded-[18px] border border-pc-divider p-[15px]">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-[34px] h-[34px] rounded-full ${t.color} text-white text-[13px] font-bold flex items-center justify-center`}>
                    {t.initials}
                  </div>
                  <div>
                    <div className="text-[13px] font-bold text-[#111]">{t.name}</div>
                    <div className="text-[11px] text-pc-hint">{t.resto}</div>
                  </div>
                </div>
                <div className="text-[#f59e0b] text-[11px] tracking-[1px] mb-1">★★★★★</div>
                <div className="text-[12px] text-[#374151] leading-[1.6]">{t.text}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="px-5 py-8 max-w-lg mx-auto">
        <h3 className="text-[20px] font-black text-pc-text tracking-[-0.8px] mb-4 text-center">
          Simple et transparent.
        </h3>
        <div className="space-y-3">
          {[
            {
              name: 'Pro Annuel', price: '19€', per: '/mois', sub: '228€/an · -35%', badge: 'Recommandé',
              features: ['Idées IA illimitées · toutes plateformes', 'RestaurantBrain complet + photo IA DALL-E', 'Analytics avancé + heatmap créneaux', 'Support prioritaire'],
            },
            {
              name: 'Pro Mensuel', price: '29€', per: '/mois',
              features: ['20 idées / sem · 2 plateformes', 'Brief visuel + import carte menu', 'RestaurantBrain basique · analytics standard'],
            },
            {
              name: 'Starter', price: 'Gratuit', per: ' · 7 jours',
              features: ['5 idées / sem · 1 plateforme', '3 posts calendrier / semaine'],
            },
          ].map((plan, i) => (
            <div
              key={plan.name}
              className={`rounded-card border p-4 relative ${i === 0 ? 'border-2 border-pc-green' : 'border-pc-divider'}`}
            >
              {plan.badge && (
                <span className="absolute -top-[11px] left-1/2 -translate-x-1/2 bg-pc-green text-white text-[11px] font-bold px-3 py-[3px] rounded-pill">
                  {plan.badge}
                </span>
              )}
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="text-[15px] font-bold text-[#111]">{plan.name}</div>
                  <div className={`font-extrabold tracking-[-1px] ${i === 0 ? 'text-[26px] text-pc-green' : 'text-[20px] text-[#374151]'}`}>
                    {plan.price}
                    <span className="text-[12px] font-normal text-pc-hint">{plan.per}</span>
                  </div>
                  {plan.sub && <div className="text-[11px] text-pc-hint">{plan.sub}</div>}
                </div>
              </div>
              {plan.features.map((f) => (
                <div key={f} className="flex items-center gap-[6px] text-[12px] text-[#374151] mt-1">
                  <div className="w-[5px] h-[5px] rounded-full bg-pc-green flex-shrink-0" />
                  {f}
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-5 py-8 bg-pc-green text-center">
        <h3 className="text-[22px] font-black text-white tracking-[-0.8px] mb-3">
          Prêt à remplir ta salle ?
        </h3>
        <p className="text-[14px] text-white opacity-80 mb-5">
          Rejoins 850+ restos qui postent avec PostChef.
        </p>
        <button
          onClick={() => navigate('/onboarding')}
          className="bg-white text-pc-green text-[15px] font-bold px-7 py-[14px] rounded-pill hover:bg-pc-green-light transition-colors active:scale-[0.98]"
        >
          Commencer — c'est gratuit
        </button>
      </section>

      {/* Footer */}
      <footer className="px-5 py-6 border-t border-pc-divider text-center">
        <div className="text-[17px] font-extrabold text-pc-text tracking-[-0.3px] mb-2">
          Post<span className="text-pc-green">Chef</span>
        </div>
        <div className="text-[12px] text-pc-hint">© 2026 PostChef · Marseille, France</div>
      </footer>
    </div>
  )
}
