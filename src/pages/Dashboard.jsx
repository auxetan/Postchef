import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { mockPosts, mockIdeas, mockTrends } from '../utils/mockData.js'
import RestaurantBrainPanel from '../components/features/RestaurantBrainPanel.jsx'
import QuickCapture from '../components/features/QuickCapture.jsx'
import FeatureLock from '../components/ui/FeatureLock.jsx'
import useAppStore from '../store/useAppStore.js'
import useFeatureAccess from '../hooks/useFeatureAccess.js'

const STATUS_DOT = {
  'idee':      '#D4D4D4',
  'a-tourner': '#F59E0B',
  'publie':    '#1D9E75',
}
const STATUS_LABEL = {
  'idee':      'Idée',
  'a-tourner': 'À tourner',
  'publie':    'Publié',
}
const STATUS_BG = {
  'idee':      'bg-[#F5F5F5] text-pc-ink-4',
  'a-tourner': 'bg-[#FEF3C7] text-[#92400E]',
  'publie':    'bg-[#DCFCE7] text-[#14532D]',
}
const PLATFORM_COLOR = {
  Instagram: 'text-pc-green',
  TikTok:    'text-pc-ink-2',
  Facebook:  'text-[#2563eb]',
}

const containerVariants = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.07 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.28, ease: 'easeOut' } },
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [showQuickCapture, setShowQuickCapture] = useState(false)
  const onboarding = useAppStore((s) => s.onboarding)
  const user = useAppStore((s) => s.user)
  const storePosts = useAppStore((s) => s.posts)
  const usage = useAppStore((s) => s.usage)
  const { can, feature } = useFeatureAccess()

  const restaurantName = onboarding.restaurant.name || 'La Trattoria'
  const city = onboarding.restaurant.city || 'Marseille'
  const allPosts = [...mockPosts, ...storePosts]
  const postsATourner = allPosts.filter((p) => p.status !== 'publie').length
  const postsPublies  = allPosts.filter((p) => p.status === 'publie').length
  const ideasUsed = usage.ideasUsedThisWeek

  const dateStr = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long'
  })

  const initials = restaurantName.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase()).join('')

  return (
    <div className="min-h-screen bg-pc-bg pb-32">

      {/* ── Header ────────────────────────────────────────────────── */}
      <div
        className="px-5 pt-8 pb-6 sticky top-0 z-30"
        style={{
          background: 'rgba(247,247,245,0.85)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          borderBottom: '1px solid rgba(0,0,0,0.05)',
        }}
      >
        <div className="max-w-xl mx-auto">
          <p className="pc-section-label mb-[10px]">{dateStr}</p>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-[28px] font-[800] text-pc-ink leading-[1.05] tracking-[-0.03em]">
                {restaurantName}
              </h1>
              {postsATourner > 0 && (
                <div className="flex items-center gap-[6px] mt-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: '#F59E0B', boxShadow: '0 0 0 2px rgba(245,158,11,0.2)' }}
                  />
                  <span className="text-[12px] text-pc-ink-3 font-[600]">
                    {postsATourner} post{postsATourner > 1 ? 's' : ''} en attente
                  </span>
                </div>
              )}
            </div>
            {/* Avatar */}
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-[14px] font-[800] text-white flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #1D9E75 0%, #0F6E56 100%)' }}
            >
              {initials || '🍽️'}
            </div>
          </div>
        </div>
      </div>

      <motion.div
        className="px-5 py-6 max-w-xl mx-auto space-y-7"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >

        {/* ── Stat Cards ────────────────────────────────────────────── */}
        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between mb-4">
            <span className="pc-section-label">Cette semaine</span>
            <button
              onClick={() => navigate('/app/analytics')}
              className="text-[11px] font-[700] text-pc-green hover:opacity-70 transition-opacity flex items-center gap-1"
            >
              Analytics
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M2.5 6H9.5M6.5 3L9.5 6L6.5 9"/></svg>
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {/* Posts card */}
            <motion.div
              whileHover={{ y: -2 }}
              transition={{ duration: 0.18 }}
              className="bg-pc-surface rounded-[20px] p-5 cursor-pointer press-scale shine"
              style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.05)' }}
              onClick={() => navigate('/app/calendar')}
            >
              {/* Mini icon */}
              <div className="w-8 h-8 rounded-[10px] bg-pc-green-light flex items-center justify-center mb-4">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#1D9E75" strokeWidth="2" strokeLinecap="round">
                  <rect x="1" y="3" width="14" height="12" rx="2.5"/>
                  <path d="M5 1v3M11 1v3M1 7h14"/>
                </svg>
              </div>
              <div className="text-[40px] font-[800] text-pc-ink leading-none tracking-[-0.04em] pc-num">
                {postsATourner}
              </div>
              <div className="text-[12px] font-[500] text-pc-ink-3 mt-2 leading-tight">
                Posts à tourner
              </div>
              <div className="text-[11px] text-pc-green font-[700] mt-1">
                {postsPublies} publié{postsPublies !== 1 ? 's' : ''} ce mois
              </div>
            </motion.div>

            {/* Ideas card */}
            <motion.div
              whileHover={{ y: -2 }}
              transition={{ duration: 0.18 }}
              className="bg-pc-ink rounded-[20px] p-5 cursor-pointer press-scale"
              style={{ boxShadow: '0 2px 16px rgba(10,10,10,0.15)' }}
              onClick={() => navigate('/app/ideas')}
            >
              <div className="w-8 h-8 rounded-[10px] bg-white/10 flex items-center justify-center mb-4">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round">
                  <path d="M8 1a5 5 0 013.5 8.5V11a1 1 0 01-1 1h-5a1 1 0 01-1-1V9.5A5 5 0 018 1z"/>
                  <path d="M6 13.5h4"/>
                </svg>
              </div>
              <div className="text-[40px] font-[800] text-white leading-none tracking-[-0.04em] pc-num">
                {ideasUsed}
              </div>
              <div className="text-[12px] font-[500] text-white/50 mt-2 leading-tight">
                Idées générées
              </div>
              <div className="text-[11px] text-white/40 font-[600] mt-1">
                cette semaine
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* ── Prochains Posts ───────────────────────────────────────── */}
        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between mb-4">
            <span className="pc-section-label">Prochains posts</span>
            <button
              onClick={() => navigate('/app/calendar')}
              className="text-[11px] font-[700] text-pc-green hover:opacity-70 transition-opacity flex items-center gap-1"
            >
              Tout voir
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M2.5 6H9.5M6.5 3L9.5 6L6.5 9"/></svg>
            </button>
          </div>

          <div
            className="bg-pc-surface rounded-[20px] overflow-hidden"
            style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.05)' }}
          >
            {mockPosts.slice(0, 3).map((post, i) => (
              <div key={post.id}>
                {i > 0 && <div className="h-px bg-pc-rule mx-5" />}
                <div
                  className="flex items-center gap-4 px-5 py-[15px] cursor-pointer hover:bg-pc-bg transition-colors"
                  onClick={() => navigate('/app/calendar')}
                >
                  {/* Day pill */}
                  <div className="flex-shrink-0 text-center w-9">
                    <div className="text-[10px] font-[700] text-pc-ink-4 tracking-[0.05em] uppercase">
                      {post.dayShort}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-[700] text-pc-ink truncate leading-tight">
                      {post.type}
                    </div>
                    <div className="flex items-center gap-[6px] mt-[3px]">
                      {post.plateformes?.map((p) => (
                        <span key={p} className={`text-[10px] font-[600] ${PLATFORM_COLOR[p] || 'text-pc-ink-3'}`}>
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Status badge */}
                  <span className={`text-[10px] font-[700] px-2 py-[4px] rounded-[7px] flex-shrink-0 ${STATUS_BG[post.status] || 'bg-pc-rule text-pc-ink-3'}`}>
                    {STATUS_LABEL[post.status]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Idées IA ──────────────────────────────────────────────── */}
        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between mb-4">
            <span className="pc-section-label">Idées du moment</span>
            <button
              onClick={() => navigate('/app/ideas')}
              className="text-[11px] font-[700] text-pc-green hover:opacity-70 transition-opacity flex items-center gap-1"
            >
              Voir tout
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M2.5 6H9.5M6.5 3L9.5 6L6.5 9"/></svg>
            </button>
          </div>
          <div className="space-y-[10px]">
            {/* Hero idea — ink dark */}
            <motion.div
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.18 }}
              className="rounded-[20px] px-5 py-5 cursor-pointer relative overflow-hidden"
              style={{ background: 'linear-gradient(145deg, #0A0A0A 0%, #1a1a1a 100%)', boxShadow: '0 4px 20px rgba(10,10,10,0.2)' }}
              onClick={() => navigate('/app/ideas')}
            >
              {/* Subtle green glow in corner */}
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-20 pointer-events-none" style={{ background: 'radial-gradient(circle, #1D9E75 0%, transparent 70%)', transform: 'translate(30%,-30%)' }} />
              <div className="relative">
                <div className="text-[9px] font-[700] tracking-[0.10em] uppercase mb-3" style={{ color: 'rgba(255,255,255,0.40)' }}>
                  {mockIdeas[0].format} · {mockIdeas[0].plateforme}
                </div>
                <div className="text-[16px] font-[700] text-white leading-[1.45]">
                  "{mockIdeas[0].hook}"
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <div
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-[8px]"
                    style={{ background: 'rgba(29,158,117,0.18)', border: '1px solid rgba(29,158,117,0.30)' }}
                  >
                    <div className="w-[5px] h-[5px] rounded-full bg-pc-green" />
                    <span className="text-[11px] text-pc-green font-[700]">Fort potentiel</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Secondary idea */}
            <motion.div
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.18 }}
              className="bg-pc-surface rounded-[20px] px-5 py-4 cursor-pointer"
              style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05), 0 0 0 1px rgba(0,0,0,0.05)' }}
              onClick={() => navigate('/app/ideas')}
            >
              <div className="text-[9px] font-[700] tracking-[0.10em] uppercase text-pc-ink-4 mb-2">
                {mockIdeas[1].format} · {mockIdeas[1].plateforme}
              </div>
              <div className="text-[14px] font-[600] text-pc-ink leading-[1.45]">
                "{mockIdeas[1].hook}"
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* ── Tendances ────────────────────────────────────────────── */}
        <motion.div variants={itemVariants}>
          <div className="pc-section-label mb-3">Tendances</div>
          <div className="flex flex-wrap gap-2">
            {mockTrends.map((t) => (
              <span
                key={t}
                className="bg-pc-surface text-pc-ink-2 text-[12px] font-[600] px-[14px] py-[7px] rounded-pill cursor-pointer hover:bg-pc-green-light hover:text-pc-green transition-all duration-150"
                style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.06)' }}
              >
                {t}
              </span>
            ))}
          </div>
        </motion.div>

        {/* ── Restaurant Brain ─────────────────────────────────────── */}
        <motion.div variants={itemVariants}>
          <div className="flex items-center gap-3 mb-4">
            <span className="pc-section-label">Analyse intelligente</span>
            <div className="flex-1 h-px bg-pc-rule" />
            {!can('restaurantBrain') && <FeatureLock feature="restaurantBrain" compact />}
          </div>
          {can('restaurantBrain') || feature('restaurantBrain') === 'basic' ? (
            <RestaurantBrainPanel
              restaurantName={restaurantName}
              city={city}
              basicOnly={feature('restaurantBrain') === 'basic'}
            />
          ) : (
            <FeatureLock
              feature="restaurantBrain"
              title="Analyse de ton restaurant"
              description="Chef trouve ton resto sur Google, lit tes avis clients et génère des idées de contenu basées sur ta réputation réelle."
            />
          )}
        </motion.div>

      </motion.div>

      {/* ── FABs ───────────────────────────────────────────────────── */}
      <button
        onClick={() => setShowQuickCapture(true)}
        className="fixed z-40 press-scale"
        style={{
          bottom: 'calc(env(safe-area-inset-bottom, 0px) + 88px)',
          right: 80,
          width: 46,
          height: 46,
          borderRadius: '50%',
          background: 'rgba(10,10,10,0.90)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.10)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6.5 2L5 4H3a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2l-1.5-2h-5z"/>
          <circle cx="9" cy="9.5" r="3"/>
        </svg>
      </button>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => navigate('/app/ideas')}
        className="fixed z-40"
        style={{
          bottom: 'calc(env(safe-area-inset-bottom, 0px) + 84px)',
          right: 20,
          width: 54,
          height: 54,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #1D9E75 0%, #0F6E56 100%)',
          boxShadow: '0 6px 24px rgba(29,158,117,0.45)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M10 4v12M4 10h12" />
        </svg>
      </motion.button>

      <QuickCapture
        isOpen={showQuickCapture}
        onClose={() => setShowQuickCapture(false)}
        restaurantName={restaurantName}
      />
    </div>
  )
}
