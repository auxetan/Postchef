import { useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import useAppStore from '../../store/useAppStore.js'
import { canAccess } from '../../utils/plans.js'
import { PC_GREEN, PC_INK_4, PC_PREMIUM } from '../../utils/colors.js'

// ── Onglets gauche ────────────────────────────────────────────────────────────
const TABS_LEFT = [
  {
    to: '/app', end: true, label: 'Accueil',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 20 20" fill="none">
        <path
          d="M2.5 8.5L10 2.5L17.5 8.5V17a1 1 0 01-1 1H3.5a1 1 0 01-1-1V8.5z"
          stroke="currentColor" strokeWidth={active ? 2.2 : 1.8}
          strokeLinecap="round" strokeLinejoin="round"
          fill={active ? 'currentColor' : 'none'} fillOpacity={active ? 0.12 : 0}
        />
        <path d="M7.5 18V12h5v6" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    to: '/app/calendar', label: 'Calendrier',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 20 20" fill="none">
        <rect x="2" y="4" width="16" height="14" rx="3" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} fill={active ? 'currentColor' : 'none'} fillOpacity={active ? 0.10 : 0}/>
        <path d="M6.5 2.5V5.5M13.5 2.5V5.5M2 8.5H18" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round"/>
        <circle cx="7" cy="13" r="1.2" fill={active ? 'currentColor' : 'none'} stroke={active ? 'none' : 'currentColor'} strokeWidth="1.4"/>
        <circle cx="13" cy="13" r="1.2" fill={active ? 'currentColor' : 'none'} stroke={active ? 'none' : 'currentColor'} strokeWidth="1.4"/>
      </svg>
    ),
  },
]

// ── Onglets droite ────────────────────────────────────────────────────────────
const TABS_RIGHT = [
  {
    to: '/app/ideas', label: 'Idées',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 20 20" fill="none">
        <path d="M10 2a6 6 0 014 10.47V14.5a1 1 0 01-1 1H7a1 1 0 01-1-1V12.47A6 6 0 0110 2z" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} fill={active ? 'currentColor' : 'none'} fillOpacity={active ? 0.12 : 0} strokeLinejoin="round"/>
        <path d="M7.5 17h5M8 18.5h4" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    to: '/app/studio', label: 'Studio',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 20 20" fill="none">
        <rect x="2" y="4" width="16" height="12" rx="2.5" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} fill={active ? 'currentColor' : 'none'} fillOpacity={active ? 0.10 : 0}/>
        <path d="M8 8l5 2.5L8 13V8z" fill={active ? 'white' : 'currentColor'} stroke="none" opacity={active ? 0.9 : 0.7}/>
      </svg>
    ),
  },
]

// ── Menu Plus : destinations secondaires ──────────────────────────────────────
const PLUS_ITEMS = [
  {
    to: '/app/trends', label: 'Tendances',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="1 16 6 9 11 13 16 5 19 8"/>
        <path d="M15 5h4v4"/>
      </svg>
    ),
  },
  {
    to: '/app/analytics', label: 'Analytics',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="11" width="4" height="8" rx="1"/>
        <rect x="8" y="7" width="4" height="12" rx="1"/>
        <rect x="14" y="3" width="4" height="16" rx="1"/>
      </svg>
    ),
  },
  {
    to: '/app/account', label: 'Mon compte',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="10" cy="6.5" r="3.5"/>
        <path d="M2.5 17.5c0-4.14 3.36-7.5 7.5-7.5s7.5 3.36 7.5 7.5"/>
      </svg>
    ),
  },
]

// ── Composant NavTab générique ────────────────────────────────────────────────
function NavTab({ tab }) {
  return (
    <NavLink to={tab.to} end={tab.end} aria-label={tab.label}>
      {({ isActive }) => (
        <motion.div
          className="relative flex flex-col items-center justify-center gap-[3px] px-4 py-2 rounded-[18px] transition-colors duration-150"
          style={{ background: isActive ? 'rgba(29,158,117,0.10)' : 'transparent', minWidth: 52 }}
          whileTap={{ scale: 0.88 }}
        >
          {isActive && (
            <motion.div
              layoutId="nav-indicator"
              className="absolute inset-0 rounded-[18px]"
              style={{ background: 'rgba(29,158,117,0.10)' }}
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            />
          )}
          <span className="relative z-10" style={{ color: isActive ? PC_GREEN : PC_INK_4 }}>
            {tab.icon(isActive)}
          </span>
          <span
            className="relative z-10 text-[9.5px] font-[700] tracking-[0.02em] whitespace-nowrap"
            style={{ color: isActive ? PC_GREEN : PC_INK_4 }}
          >
            {tab.label}
          </span>
        </motion.div>
      )}
    </NavLink>
  )
}

// ── BottomNav ─────────────────────────────────────────────────────────────────
export default function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()
  const plan = useAppStore((s) => s.user.plan)
  const hasChatIA = canAccess(plan, 'aiChat')
  const [showPlus, setShowPlus] = useState(false)

  // Masquer sur la page Chef IA (fullscreen chat)
  if (location.pathname === '/app/chef-ia') return null

  // L'onglet "Plus" est actif si la route courante est une des destinations secondaires
  const plusRoutes = ['/app/trends', '/app/analytics', '/app/account']
  const plusActive = plusRoutes.some((r) => location.pathname.startsWith(r))

  return (
    <>
      {/* ── Backdrop du menu Plus ─────────────────────────────────── */}
      <AnimatePresence>
        {showPlus && (
          <motion.div
            className="fixed inset-0 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowPlus(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Drawer Plus ──────────────────────────────────────────── */}
      <AnimatePresence>
        {showPlus && (
          <motion.div
            className="fixed bottom-[88px] left-1/2 -translate-x-1/2 z-50 w-[220px]"
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            <div
              className="rounded-[20px] overflow-hidden"
              style={{
                background: 'rgba(255,255,255,0.97)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                border: '1px solid rgba(0,0,0,0.08)',
                boxShadow: '0 8px 40px rgba(0,0,0,0.14)',
              }}
            >
              {/* Chef IA row */}
              <button
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#f5f3ff] transition-colors text-left"
                onClick={() => { setShowPlus(false); navigate('/app/chef-ia') }}
                aria-label="Chef IA"
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    background: hasChatIA ? 'rgba(124,58,237,0.88)' : 'rgba(124,58,237,0.10)',
                    border: hasChatIA ? 'none' : '1.5px solid rgba(124,58,237,0.25)',
                  }}
                >
                  <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke={hasChatIA ? 'white' : PC_PREMIUM} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 2C6.13 2 3 5.13 3 9c0 2.39 1.19 4.5 3 5.74V17a1 1 0 001 1h6a1 1 0 001-1v-2.26C15.81 13.5 17 11.39 17 9c0-3.87-3.13-7-7-7z"/>
                  </svg>
                </div>
                <div>
                  <p className="text-[13px] font-bold text-pc-ink leading-none">Chef IA</p>
                  {!hasChatIA && <p className="text-[10px] text-pc-premium mt-[2px]">Premium</p>}
                </div>
              </button>

              <div className="h-px bg-pc-rule mx-4" />

              {/* Secondary routes */}
              {PLUS_ITEMS.map((item) => {
                const isActive = location.pathname.startsWith(item.to)
                return (
                  <button
                    key={item.to}
                    className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-pc-bg transition-colors text-left ${isActive ? 'bg-pc-bg' : ''}`}
                    onClick={() => { setShowPlus(false); navigate(item.to) }}
                    aria-label={item.label}
                  >
                    <span style={{ color: isActive ? PC_GREEN : '#6B7280' }}>{item.icon}</span>
                    <span className={`text-[13px] font-semibold ${isActive ? 'text-pc-green' : 'text-pc-ink'}`}>{item.label}</span>
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Pill nav principale ───────────────────────────────────── */}
      <nav
        className="fixed bottom-0 left-0 right-0 flex justify-center lg:hidden z-50 pointer-events-none"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)' }}
        aria-label="Navigation principale"
      >
        <div
          className="flex items-center gap-1 px-3 py-2 pointer-events-auto"
          style={{
            background: 'rgba(255,255,255,0.78)',
            backdropFilter: 'blur(32px) saturate(200%)',
            WebkitBackdropFilter: 'blur(32px) saturate(200%)',
            borderRadius: '26px',
            border: '1px solid rgba(255,255,255,0.65)',
            boxShadow: '0 4px 28px rgba(0,0,0,0.11), 0 1px 4px rgba(0,0,0,0.07), inset 0 1px 0 rgba(255,255,255,0.95), inset 0 -1px 0 rgba(0,0,0,0.04)',
          }}
        >
          {/* Gauche */}
          {TABS_LEFT.map((tab) => <NavTab key={tab.to} tab={tab} />)}

          {/* Centre : Chef IA pill */}
          <NavLink to="/app/chef-ia" aria-label="Chef IA">
            {({ isActive }) => (
              <motion.div
                className="flex flex-col items-center gap-[3px] px-3 py-1"
                style={{ minWidth: 52 }}
                whileTap={{ scale: 0.88 }}
              >
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center transition-all duration-150"
                  style={{
                    background: isActive ? PC_PREMIUM : hasChatIA ? 'rgba(124,58,237,0.88)' : 'rgba(124,58,237,0.10)',
                    boxShadow: (isActive || hasChatIA) ? '0 4px 16px rgba(124,58,237,0.35)' : 'none',
                    border: (!isActive && !hasChatIA) ? '1.5px solid rgba(124,58,237,0.25)' : 'none',
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke={hasChatIA || isActive ? 'white' : PC_PREMIUM} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 2C6.13 2 3 5.13 3 9c0 2.39 1.19 4.5 3 5.74V17a1 1 0 001 1h6a1 1 0 001-1v-2.26C15.81 13.5 17 11.39 17 9c0-3.87-3.13-7-7-7z"/>
                    <path d="M7.5 17.5h5"/>
                  </svg>
                </div>
                <span
                  className="text-[9.5px] font-[700] tracking-[0.02em] whitespace-nowrap"
                  style={{ color: isActive ? PC_PREMIUM : hasChatIA ? PC_PREMIUM : PC_INK_4 }}
                >
                  Chef IA
                </span>
              </motion.div>
            )}
          </NavLink>

          {/* Droite */}
          {TABS_RIGHT.map((tab) => <NavTab key={tab.to} tab={tab} />)}

          {/* Plus */}
          <motion.button
            className="relative flex flex-col items-center justify-center gap-[3px] px-4 py-2 rounded-[18px] transition-colors duration-150"
            style={{
              background: (showPlus || plusActive) ? 'rgba(29,158,117,0.10)' : 'transparent',
              minWidth: 52,
            }}
            whileTap={{ scale: 0.88 }}
            onClick={() => setShowPlus((v) => !v)}
            aria-label="Plus"
            aria-expanded={showPlus}
          >
            <span style={{ color: (showPlus || plusActive) ? PC_GREEN : PC_INK_4 }}>
              <svg width="22" height="22" viewBox="0 0 20 20" fill="none">
                <circle cx="5" cy="10" r="1.5" fill="currentColor"/>
                <circle cx="10" cy="10" r="1.5" fill="currentColor"/>
                <circle cx="15" cy="10" r="1.5" fill="currentColor"/>
              </svg>
            </span>
            <span
              className="text-[9.5px] font-[700] tracking-[0.02em] whitespace-nowrap"
              style={{ color: (showPlus || plusActive) ? PC_GREEN : PC_INK_4 }}
            >
              Plus
            </span>
          </motion.button>
        </div>
      </nav>
    </>
  )
}
