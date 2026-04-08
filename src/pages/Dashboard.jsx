import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
const STATUS_TEXT = {
  'idee':      'text-pc-ink-3',
  'a-tourner': 'text-[#92400e]',
  'publie':    'text-pc-green',
}
const PLATFORM_COLOR = {
  Instagram: 'text-pc-green',
  TikTok:    'text-pc-ink-2',
  Facebook:  'text-[#2563eb]',
}

// Section divider avec label uppercase
function Rule({ children }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="pc-section-label">{children}</span>
      <div className="flex-1 h-px bg-pc-rule" />
    </div>
  )
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

  return (
    <div className="min-h-screen bg-pc-bg">

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="bg-pc-surface border-b border-pc-border px-6 pt-7 pb-5 sticky top-0 z-30">
        <div className="max-w-2xl mx-auto">
          <p className="pc-section-label mb-2">{dateStr}</p>
          <h1 className="text-[26px] font-black tracking-[-0.04em] text-pc-ink leading-none">
            {restaurantName}
          </h1>
          {postsATourner > 0 && (
            <p className="text-[13px] text-pc-ink-3 mt-[6px] font-medium">
              <span
                className="inline-block w-[6px] h-[6px] rounded-full bg-[#F59E0B] mr-[6px] align-middle"
                style={{ verticalAlign: '2px' }}
              />
              {postsATourner} post{postsATourner > 1 ? 's' : ''} en attente
            </p>
          )}
        </div>
      </div>

      <div className="px-6 py-7 max-w-2xl mx-auto space-y-8">

        {/* ── Metrics ─────────────────────────────────────────── */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="pc-section-label">Cette semaine</span>
            <div className="flex-1 h-px bg-pc-rule" />
            <button
              onClick={() => navigate('/app/analytics')}
              className="text-[11px] font-semibold text-pc-green hover:opacity-70 transition-opacity flex-shrink-0"
            >
              Analytics →
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">

            <div className="bg-pc-surface border border-pc-border rounded-card px-5 py-5">
              <div className="pc-stat pc-num">{postsATourner}</div>
              <div className="text-[12px] font-medium text-pc-ink-3 mt-3 leading-tight">
                Posts à tourner
              </div>
              <div className="text-[11px] text-pc-green font-semibold mt-1">
                {postsPublies} publié{postsPublies !== 1 ? 's' : ''} ce mois
              </div>
            </div>

            <div className="bg-pc-surface border border-pc-border rounded-card px-5 py-5">
              <div className="pc-stat pc-num">{ideasUsed}</div>
              <div className="text-[12px] font-medium text-pc-ink-3 mt-3 leading-tight">
                Idées générées
              </div>
              <div className="text-[11px] text-pc-ink-4 font-semibold mt-1">
                cette semaine
              </div>
            </div>
          </div>
        </div>

        {/* ── Posts à venir ────────────────────────────────────── */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="pc-section-label">Prochains posts</span>
            <div className="flex-1 h-px bg-pc-rule" />
            <button
              onClick={() => navigate('/app/calendar')}
              className="text-[11px] font-semibold text-pc-green hover:opacity-70 transition-opacity flex-shrink-0"
            >
              Tout voir →
            </button>
          </div>

          <div className="space-y-[1px] bg-pc-border rounded-card overflow-hidden border border-pc-border">
            {mockPosts.slice(0, 3).map((post, i) => (
              <div
                key={post.id}
                className="bg-pc-surface flex items-center gap-4 px-5 py-[14px] cursor-pointer hover:bg-pc-bg transition-colors group"
                onClick={() => navigate('/app/calendar')}
              >
                {/* Status dot */}
                <div
                  className="w-[7px] h-[7px] rounded-full flex-shrink-0"
                  style={{ backgroundColor: STATUS_DOT[post.status] || '#D4D4D4' }}
                />

                {/* Day */}
                <div className="text-[11px] font-bold text-pc-ink-4 w-7 flex-shrink-0 pc-section-label" style={{ letterSpacing: '0.04em' }}>
                  {post.dayShort}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold text-pc-ink truncate leading-tight">
                    {post.type}
                  </div>
                  <div className="flex items-center gap-[6px] mt-[3px]">
                    {post.plateformes?.map((p) => (
                      <span key={p} className={`text-[11px] font-semibold ${PLATFORM_COLOR[p] || 'text-pc-ink-3'}`}>
                        #{p}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Status */}
                <div className={`text-[11px] font-semibold flex-shrink-0 ${STATUS_TEXT[post.status] || 'text-pc-ink-3'}`}>
                  {STATUS_LABEL[post.status]}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Idées IA ─────────────────────────────────────────── */}
        <div>
          <Rule>Idées du moment</Rule>
          <div className="space-y-2">

            {/* Hero idea — green accent */}
            <div
              className="bg-pc-ink rounded-card px-5 py-5 cursor-pointer hover:bg-pc-ink-2 transition-colors"
              onClick={() => navigate('/app/ideas')}
            >
              <div className="pc-section-label text-pc-ink-4 mb-3" style={{ color: 'rgba(255,255,255,0.45)' }}>
                {mockIdeas[0].format} · {mockIdeas[0].plateforme}
              </div>
              <div className="text-[15px] font-bold text-white leading-[1.45]">
                "{mockIdeas[0].hook}"
              </div>
              <div className="mt-3 flex items-center gap-[6px]">
                <div className="w-[6px] h-[6px] rounded-full bg-pc-green" />
                <span className="text-[11px] text-pc-green font-semibold">Fort potentiel</span>
              </div>
            </div>

            {/* Secondary idea */}
            <div
              className="bg-pc-surface border border-pc-border rounded-card px-5 py-4 cursor-pointer hover:border-pc-ink transition-colors"
              onClick={() => navigate('/app/ideas')}
            >
              <div className="pc-section-label text-pc-ink-4 mb-2">
                {mockIdeas[1].format} · {mockIdeas[1].plateforme}
              </div>
              <div className="text-[14px] font-semibold text-pc-ink leading-[1.4]">
                "{mockIdeas[1].hook}"
              </div>
            </div>

            <button
              onClick={() => navigate('/app/ideas')}
              className="w-full text-center text-[12px] font-semibold text-pc-green py-1 hover:opacity-70 transition-opacity"
            >
              Générer de nouvelles idées →
            </button>
          </div>
        </div>

        {/* ── Tendances ────────────────────────────────────────── */}
        <div>
          <Rule>Veille tendances</Rule>
          <div className="flex flex-wrap gap-2">
            {mockTrends.map((t) => (
              <span
                key={t}
                className="bg-pc-surface border border-pc-border text-pc-ink-2 text-[12px] font-medium px-3 py-[7px] rounded-btn cursor-pointer hover:border-pc-ink hover:text-pc-ink transition-colors"
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* ── Restaurant Brain ─────────────────────────────────── */}
        <div>
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
        </div>

      </div>

      {/* ── FABs ─────────────────────────────────────────────────── */}
      {/* Quick Capture FAB */}
      <button
        onClick={() => setShowQuickCapture(true)}
        className="fixed bottom-20 right-[76px] lg:bottom-6 lg:right-[76px] w-12 h-12 rounded-full bg-pc-ink text-white flex items-center justify-center active:scale-95 transition-transform z-40"
        style={{ boxShadow: '0 4px 20px rgba(10,10,10,0.3)' }}
        title="Capture rapide"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6.5 2L5 4H3a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2l-1.5-2h-5z"/>
          <circle cx="9" cy="9.5" r="3"/>
        </svg>
      </button>

      {/* Ideas FAB */}
      <button
        onClick={() => navigate('/app/ideas')}
        className="fixed bottom-20 right-5 lg:bottom-6 lg:right-6 w-14 h-14 rounded-full bg-pc-green text-white flex items-center justify-center active:scale-95 transition-transform z-40"
        style={{ boxShadow: '0 4px 20px rgba(29,158,117,0.4)' }}
        title="Générer des idées"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M10 4v12M4 10h12" />
        </svg>
      </button>

      {/* Quick Capture Modal */}
      <QuickCapture
        isOpen={showQuickCapture}
        onClose={() => setShowQuickCapture(false)}
        restaurantName={restaurantName}
      />
    </div>
  )
}
