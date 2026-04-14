import { Link } from 'react-router-dom'
import { LogoWordmark } from '../ui/LogoMark.jsx'

export default function AuthShell({
  eyebrow = 'PostChef',
  title,
  subtitle,
  children,
  footer,
}) {
  return (
    <div className="min-h-screen bg-white hero-mesh flex items-center justify-center px-5 py-10">
      <div className="w-full max-w-[1040px] grid lg:grid-cols-[1.05fr_0.95fr] gap-6 items-stretch">
        <section className="hidden lg:flex flex-col justify-between rounded-[32px] border border-pc-border bg-pc-ink text-white p-10 overflow-hidden relative">
          <div className="absolute inset-0 opacity-80 pointer-events-none" style={{
            background: 'radial-gradient(circle at top right, rgba(29,158,117,0.35), transparent 35%), radial-gradient(circle at bottom left, rgba(255,255,255,0.08), transparent 28%)',
          }} />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.08em] uppercase text-white/60 border border-white/10 rounded-full px-3 py-2 mb-6">
              <span className="w-2 h-2 rounded-full bg-pc-green" />
              {eyebrow}
            </div>
            <h1 className="text-[42px] leading-[1.02] tracking-[-0.05em] font-black max-w-[12ch]">
              L’espace contenu pensé pour les restaurants ambitieux.
            </h1>
            <p className="text-[15px] leading-[1.8] text-white/70 mt-5 max-w-[44ch]">
              Authentifie-toi, sécurise tes données et retrouve ton calendrier, tes idées IA et ton onboarding sur tous tes appareils.
            </p>
          </div>
          <div className="relative z-10 grid grid-cols-3 gap-3">
            {[
              ['Calendrier', 'posts synchronisés'],
              ['Idées IA', 'bibliothèque persistée'],
              ['Restaurant Brain', 'profil restaurateur sauvegardé'],
            ].map(([label, sub]) => (
              <div key={label} className="rounded-[22px] bg-white/6 border border-white/10 px-4 py-4">
                <div className="text-[12px] font-bold text-white">{label}</div>
                <div className="text-[11px] text-white/55 mt-1 leading-[1.5]">{sub}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-pc-surface border border-pc-border rounded-[28px] shadow-[0_24px_80px_rgba(0,0,0,0.08)] p-6 sm:p-8">
          <div className="flex items-center justify-between mb-8">
            <Link to="/">
              <LogoWordmark iconSize={24} textSize={17} />
            </Link>
            <Link to="/" className="text-[12px] font-semibold text-pc-ink-4 hover:text-pc-ink transition-colors">
              Retour accueil
            </Link>
          </div>

          <div className="mb-6">
            <div className="pc-section-label mb-2">{eyebrow}</div>
            <h2 className="text-[30px] sm:text-[34px] leading-[1.05] tracking-[-0.05em] font-black text-pc-ink">
              {title}
            </h2>
            <p className="text-[13px] sm:text-[14px] text-pc-ink-3 leading-[1.8] mt-3 max-w-[48ch]">
              {subtitle}
            </p>
          </div>

          <div className="space-y-4">{children}</div>
          {footer ? <div className="mt-6">{footer}</div> : null}
        </section>
      </div>
    </div>
  )
}
