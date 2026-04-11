import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import usePWAInstall from '../hooks/usePWAInstall.js'

/* ── Mock phone UI data ───────────────────────────────────────────── */
const MOCK_POSTS = [
  { day: 'LUN', title: 'Coulisses cuisine', platform: 'TikTok', status: 'publie' },
  { day: 'MER', title: 'Plat du jour 🍝', platform: 'Insta', status: 'a-tourner' },
  { day: 'VEN', title: 'Accord vins maison', platform: 'TikTok', status: 'idee' },
]

/* ── Floating stat pill ───────────────────────────────────────────── */
function FloatingPill({ children, className = '', delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: 'easeOut' }}
      className={`absolute glass rounded-[16px] px-4 py-3 ${className}`}
    >
      {children}
    </motion.div>
  )
}

/* ── Phone mockup component ──────────────────────────────────────── */
function PhoneMockup() {
  return (
    <div className="relative mx-auto" style={{ width: 260, height: 520 }}>
      {/* Glow behind phone */}
      <div
        className="absolute inset-0 rounded-[44px] opacity-30"
        style={{
          background: 'radial-gradient(ellipse 80% 80% at 50% 60%, #1D9E75, transparent)',
          filter: 'blur(32px)',
          transform: 'scale(1.2)',
        }}
      />

      {/* Phone body */}
      <div
        className="relative w-full h-full rounded-[44px] overflow-hidden"
        style={{
          background: '#0A0A0A',
          boxShadow: '0 32px 80px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.08), inset 0 1px 0 rgba(255,255,255,0.12)',
        }}
      >
        {/* Dynamic Island */}
        <div
          className="absolute top-[14px] left-1/2 z-20"
          style={{
            transform: 'translateX(-50%)',
            width: 90,
            height: 28,
            background: '#000',
            borderRadius: 100,
          }}
        />

        {/* Screen */}
        <div className="absolute inset-[3px] rounded-[42px] overflow-hidden bg-[#F7F7F5]">
          {/* App header */}
          <div className="bg-[#F7F7F5] pt-[56px] px-4 pb-3">
            <div className="text-[8px] font-[700] uppercase tracking-[0.08em] text-[#A3A3A3] mb-1">Samedi 11 Avril</div>
            <div className="text-[16px] font-[800] text-[#0A0A0A] leading-tight tracking-[-0.03em]">La Trattoria</div>
            <div className="flex items-center gap-1 mt-1">
              <div className="w-[5px] h-[5px] rounded-full bg-[#F59E0B]" />
              <span className="text-[8px] text-[#737373] font-[600]">2 posts en attente</span>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-[#E8E8E6] mx-4" />

          {/* Posts list */}
          <div className="px-4 py-3">
            <div className="text-[7px] font-[700] uppercase tracking-[0.08em] text-[#A3A3A3] mb-2">Cette semaine</div>
            <div className="space-y-[6px]">
              {MOCK_POSTS.map((p, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 bg-white rounded-[10px] px-[10px] py-[8px]"
                  style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
                >
                  <div
                    className="w-[5px] h-[5px] rounded-full flex-shrink-0"
                    style={{ backgroundColor: p.status === 'publie' ? '#1D9E75' : p.status === 'a-tourner' ? '#F59E0B' : '#D4D4D4' }}
                  />
                  <span className="text-[7px] font-[700] text-[#A3A3A3] w-[18px]">{p.day}</span>
                  <span className="text-[8px] font-[600] text-[#0A0A0A] flex-1 truncate">{p.title}</span>
                  <span className="text-[7px] font-[700] text-[#1D9E75]">{p.platform}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Ideas section */}
          <div className="px-4">
            <div className="text-[7px] font-[700] uppercase tracking-[0.08em] text-[#A3A3A3] mb-2">Idée du moment</div>
            <div className="bg-[#0A0A0A] rounded-[12px] p-3">
              <div className="text-[7px] text-white/40 font-[600] mb-1">VIDÉO · TIKTOK</div>
              <div className="text-[9px] text-white font-[700] leading-[1.4]">"Touristes vs locaux — ce qu'ils commandent"</div>
              <div className="mt-2 flex items-center gap-1">
                <div className="w-[4px] h-[4px] rounded-full bg-[#1D9E75]" />
                <span className="text-[7px] text-[#1D9E75] font-[700]">Fort potentiel</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating stat pill — top left */}
      <FloatingPill
        delay={0.6}
        className="-left-14 top-24"
        style={{ minWidth: 130 }}
      >
        <div className="text-[9px] text-pc-ink-3 font-[600] mb-[2px]">Vues cette semaine</div>
        <div className="flex items-baseline gap-1">
          <span className="text-[18px] font-[800] text-pc-ink tracking-tight">+847</span>
          <span className="text-[10px] font-[700] text-pc-green">↑ 32%</span>
        </div>
      </FloatingPill>

      {/* Floating idea pill — bottom right */}
      <FloatingPill
        delay={0.9}
        className="-right-10 bottom-28"
        style={{ maxWidth: 140 }}
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-[8px] bg-pc-green-light flex items-center justify-center flex-shrink-0">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#1D9E75" strokeWidth="2" strokeLinecap="round">
              <path d="M7 1a4 4 0 012.8 6.8V9a.8.8 0 01-.8.8H5a.8.8 0 01-.8-.8V7.8A4 4 0 017 1z"/>
            </svg>
          </div>
          <div>
            <div className="text-[9px] font-[700] text-pc-ink">Idée virale</div>
            <div className="text-[8px] text-pc-ink-4">générée en 3s</div>
          </div>
        </div>
      </FloatingPill>

      {/* Floating resto pill — left middle */}
      <FloatingPill
        delay={1.2}
        className="-left-8 bottom-44"
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-pc-green" />
          <span className="text-[9px] font-[700] text-pc-ink">850+ restos</span>
        </div>
      </FloatingPill>
    </div>
  )
}

/* ── Feature item ─────────────────────────────────────────────────── */
const FEATURES = [
  {
    emoji: '📅',
    title: 'Calendrier IA',
    desc: '7 jours planifiés automatiquement',
  },
  {
    emoji: '⚡',
    title: 'Hooks viraux',
    desc: 'Accroches testées pour TikTok',
  },
  {
    emoji: '🔍',
    title: 'Veille locale',
    desc: 'Tendances et événements',
  },
  {
    emoji: '🎬',
    title: 'Studio Reels',
    desc: 'Clips montés par IA en 60s',
  },
]

const TESTIMONIALS = [
  {
    initials: 'SR',
    name: 'Sophie R.',
    resto: 'Chez Sophie · Aix',
    text: '"En 3 semaines, mes Reels ont doublé ma file d\'attente le vendredi soir."',
    color: '#1D9E75',
  },
  {
    initials: 'ML',
    name: 'Marco L.',
    resto: 'La Trattoria · Marseille',
    text: '"J\'aurais jamais trouvé ces idées seul. Le brief visuel m\'a tout changé."',
    color: '#0F6E56',
  },
]

export default function Landing() {
  const navigate = useNavigate()
  const { canInstall, install } = usePWAInstall()

  return (
    <div className="min-h-screen bg-white font-sans overflow-x-hidden">

      {/* PWA install banner */}
      {canInstall && (
        <div className="bg-pc-green text-white px-5 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round"><rect x="2" y="2" width="12" height="12" rx="2" /><path d="M8 5v6M5 8l3 3 3-3" /></svg>
            <span className="text-[13px] font-[600]">Installer PostChef sur ton téléphone</span>
          </div>
          <button onClick={install} className="text-[12px] font-[700] bg-white text-pc-green px-3 py-[5px] rounded-pill flex-shrink-0">
            Installer
          </button>
        </div>
      )}

      {/* ── Navbar ────────────────────────────────────────────────── */}
      <nav
        className="flex justify-between items-center px-5 py-4 sticky top-0 z-50"
        style={{
          background: 'rgba(255,255,255,0.80)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
        }}
      >
        <span className="text-[18px] font-[800] text-pc-ink tracking-[-0.03em]">
          Post<span className="text-pc-green">Chef</span>
        </span>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => navigate('/onboarding')}
          className="bg-pc-green text-white text-[13px] font-[700] px-5 py-[9px] rounded-pill"
          style={{ boxShadow: '0 4px 16px rgba(29,158,117,0.30)' }}
        >
          Essayer gratuitement
        </motion.button>
      </nav>

      {/* ── Hero section ──────────────────────────────────────────── */}
      <section className="relative overflow-hidden hero-mesh">
        <div className="max-w-[520px] mx-auto px-5 pt-10 pb-0">

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 bg-pc-green-light border border-pc-green/20 px-3 py-[6px] rounded-pill mb-5"
          >
            <div className="w-[6px] h-[6px] rounded-full bg-pc-green" />
            <span className="text-[11px] font-[700] text-pc-green tracking-[0.04em]">850+ restaurants actifs</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="text-[46px] font-[800] text-pc-ink leading-[0.97] tracking-[-0.04em] mb-5"
          >
            Ton resto<br />mérite d&apos;être{' '}
            <em className="not-italic text-gradient">vu.</em>
          </motion.h1>

          {/* Subline */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="text-[15px] text-pc-ink-3 leading-[1.65] mb-7 font-[450]"
          >
            PostChef génère ton calendrier TikTok & Instagram en 3 minutes.
            Adapté à ta cuisine, ta clientèle, ton rythme.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="flex items-center gap-3 flex-wrap"
          >
            <motion.button
              whileHover={{ scale: 1.03, boxShadow: '0 8px 28px rgba(29,158,117,0.40)' }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/onboarding')}
              className="bg-pc-green text-white text-[15px] font-[700] px-7 py-[14px] rounded-pill"
              style={{ boxShadow: '0 4px 20px rgba(29,158,117,0.30)' }}
            >
              Commencer gratuitement
            </motion.button>
            <button
              onClick={() => navigate('/onboarding')}
              className="text-[14px] font-[600] text-pc-ink-3 flex items-center gap-1 hover:text-pc-ink transition-colors"
            >
              Voir démo
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M2.5 7H11.5M7.5 4L11.5 7L7.5 10"/></svg>
            </button>
          </motion.div>

          {/* Trust pills */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="flex flex-wrap gap-2 mt-5 pb-6"
          >
            {['Sans CB', '7 jours offerts', 'Annulez à tout moment'].map((b) => (
              <span key={b} className="text-[11px] font-[600] text-pc-ink-4 flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#1D9E75" strokeWidth="2" strokeLinecap="round"><path d="M2 6L5 9L10 3"/></svg>
                {b}
              </span>
            ))}
          </motion.div>
        </div>

        {/* Phone mockup — positioned to partially overflow on right */}
        <motion.div
          initial={{ opacity: 0, x: 40, y: 20 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ delay: 0.35, duration: 0.7, ease: 'easeOut' }}
          className="max-w-[520px] mx-auto px-5 pb-8"
          style={{ display: 'flex', justifyContent: 'center' }}
        >
          <PhoneMockup />
        </motion.div>
      </section>

      {/* ── Features ──────────────────────────────────────────────── */}
      <section className="px-5 py-10 bg-pc-bg">
        <div className="max-w-[520px] mx-auto">
          <div className="text-[10px] font-[700] tracking-[0.10em] uppercase text-pc-green mb-3">
            Fonctionnalités
          </div>
          <h2 className="text-[26px] font-[800] text-pc-ink tracking-[-0.03em] leading-tight mb-6">
            Tout ce qu&apos;il te faut,<br />rien de plus.
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.3 }}
                className="bg-white rounded-[20px] p-5"
                style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
              >
                <div className="text-[24px] mb-3">{f.emoji}</div>
                <div className="text-[13px] font-[700] text-pc-ink mb-1">{f.title}</div>
                <div className="text-[11px] text-pc-ink-4 leading-[1.5]">{f.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ──────────────────────────────────────────── */}
      <section className="px-5 py-10 bg-white">
        <div className="max-w-[520px] mx-auto">
          <h3 className="text-[22px] font-[800] text-pc-ink tracking-[-0.03em] mb-5">
            Ils en parlent mieux que nous.
          </h3>
          <div className="space-y-3">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                className="rounded-[20px] border border-pc-rule p-5"
                style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-9 h-9 rounded-full text-white text-[13px] font-[800] flex items-center justify-center flex-shrink-0"
                    style={{ background: t.color }}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <div className="text-[13px] font-[700] text-pc-ink">{t.name}</div>
                    <div className="text-[11px] text-pc-ink-4">{t.resto}</div>
                  </div>
                  <div className="ml-auto text-[#F59E0B] text-[11px] tracking-[1px]">★★★★★</div>
                </div>
                <div className="text-[13px] text-pc-ink-2 leading-[1.6]">{t.text}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ───────────────────────────────────────────────── */}
      <section className="px-5 py-10 bg-pc-bg">
        <div className="max-w-[520px] mx-auto">
          <h3 className="text-[22px] font-[800] text-pc-ink tracking-[-0.03em] mb-5 text-center">
            Simple et transparent.
          </h3>
          <div className="space-y-3">
            {[
              {
                name: 'Pro Annuel', price: '19€', per: '/mois', sub: '228€/an · économise 35%',
                badge: 'Recommandé',
                features: ['Idées IA illimitées · toutes plateformes', 'Studio Reels + Brand Kit', 'RestaurantBrain complet + photo IA', 'Analytics avancé + support prioritaire'],
                highlight: true,
              },
              {
                name: 'Pro Mensuel', price: '29€', per: '/mois',
                features: ['20 idées/sem · 2 plateformes', 'Brief visuel + import menu', 'RestaurantBrain basique'],
                highlight: false,
              },
              {
                name: 'Starter', price: 'Gratuit', per: ' · 7 jours',
                features: ['5 idées/sem · 1 plateforme', '3 posts / semaine'],
                highlight: false,
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className="rounded-[20px] p-5 relative"
                style={{
                  background: plan.highlight ? 'white' : 'white',
                  boxShadow: plan.highlight
                    ? '0 4px 24px rgba(29,158,117,0.15), 0 0 0 2px #1D9E75'
                    : '0 2px 12px rgba(0,0,0,0.05), 0 0 0 1px rgba(0,0,0,0.06)',
                }}
              >
                {plan.badge && (
                  <span className="absolute -top-[12px] left-1/2 -translate-x-1/2 bg-pc-green text-white text-[10px] font-[700] px-3 py-[4px] rounded-pill tracking-[0.04em]">
                    {plan.badge}
                  </span>
                )}
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="text-[14px] font-[700] text-pc-ink">{plan.name}</div>
                    <div className={`font-[800] tracking-[-0.03em] ${plan.highlight ? 'text-[28px] text-pc-green' : 'text-[22px] text-pc-ink'}`}>
                      {plan.price}
                      <span className="text-[12px] font-[400] text-pc-ink-4">{plan.per}</span>
                    </div>
                    {plan.sub && <div className="text-[11px] text-pc-ink-4 mt-[2px]">{plan.sub}</div>}
                  </div>
                </div>
                <div className="space-y-[6px]">
                  {plan.features.map((f) => (
                    <div key={f} className="flex items-start gap-2 text-[12px] text-pc-ink-2">
                      <svg className="flex-shrink-0 mt-[2px]" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#1D9E75" strokeWidth="2" strokeLinecap="round"><path d="M2.5 7L5.5 10L11.5 4"/></svg>
                      {f}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────────── */}
      <section
        className="px-5 py-12 text-center"
        style={{ background: 'linear-gradient(160deg, #0A0A0A 0%, #1a1a1a 100%)' }}
      >
        <div className="max-w-[520px] mx-auto">
          <div
            className="inline-flex items-center gap-2 mb-5 px-3 py-[6px] rounded-pill"
            style={{ background: 'rgba(29,158,117,0.15)', border: '1px solid rgba(29,158,117,0.30)' }}
          >
            <div className="w-[6px] h-[6px] rounded-full bg-pc-green" />
            <span className="text-[11px] font-[700] text-pc-green tracking-[0.04em]">850+ restos · Marseille à Paris</span>
          </div>
          <h3 className="text-[28px] font-[800] text-white tracking-[-0.04em] leading-tight mb-3">
            Prêt à remplir ta salle ?
          </h3>
          <p className="text-[14px] text-white/50 mb-7 font-[450]">
            Rejoins les restaurateurs qui postent avec PostChef.
          </p>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/onboarding')}
            className="bg-white text-pc-ink text-[15px] font-[700] px-8 py-[14px] rounded-pill"
            style={{ boxShadow: '0 8px 28px rgba(0,0,0,0.25)' }}
          >
            Commencer — c&apos;est gratuit
          </motion.button>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-5 py-6 bg-[#0A0A0A] border-t border-white/5 text-center">
        <div className="text-[16px] font-[800] text-white tracking-[-0.03em] mb-2">
          Post<span className="text-pc-green">Chef</span>
        </div>
        <div className="text-[12px] text-white/30">© 2026 PostChef · Marseille, France</div>
      </footer>
    </div>
  )
}
