import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'

const TABS = [
  {
    to: '/app', end: true, label: 'Accueil',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 20 20" fill="none">
        <path
          d="M2.5 8.5L10 2.5L17.5 8.5V17a1 1 0 01-1 1H3.5a1 1 0 01-1-1V8.5z"
          stroke="currentColor" strokeWidth={active ? 2.2 : 1.8}
          strokeLinecap="round" strokeLinejoin="round"
          fill={active ? 'currentColor' : 'none'}
          fillOpacity={active ? 0.12 : 0}
        />
        <path d="M7.5 18V12h5v6" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    to: '/app/calendar', label: 'Calendrier',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 20 20" fill="none">
        <rect
          x="2" y="4" width="16" height="14" rx="3"
          stroke="currentColor" strokeWidth={active ? 2.2 : 1.8}
          fill={active ? 'currentColor' : 'none'} fillOpacity={active ? 0.10 : 0}
        />
        <path d="M6.5 2.5V5.5M13.5 2.5V5.5M2 8.5H18" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round"/>
        <circle cx="7" cy="13" r="1.2" fill={active ? 'currentColor' : 'none'} stroke={active ? 'none' : 'currentColor'} strokeWidth="1.4"/>
        <circle cx="13" cy="13" r="1.2" fill={active ? 'currentColor' : 'none'} stroke={active ? 'none' : 'currentColor'} strokeWidth="1.4"/>
      </svg>
    ),
  },
  {
    to: '/app/studio', label: 'Studio',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 20 20" fill="none">
        <rect
          x="1.5" y="4" width="17" height="12" rx="3"
          stroke="currentColor" strokeWidth={active ? 2.2 : 1.8}
          fill={active ? 'currentColor' : 'none'} fillOpacity={active ? 0.10 : 0}
        />
        <path
          d="M8 7.5L13.5 10L8 12.5V7.5Z"
          fill="currentColor" stroke="currentColor"
          strokeWidth={active ? 0 : 1.6} strokeLinejoin="round"
          fillOpacity={active ? 1 : 0.6}
        />
      </svg>
    ),
  },
  {
    to: '/app/ideas', label: 'Idées',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 20 20" fill="none">
        <path
          d="M10 2a6 6 0 014 10.47V14.5a1 1 0 01-1 1H7a1 1 0 01-1-1V12.47A6 6 0 0110 2z"
          stroke="currentColor" strokeWidth={active ? 2.2 : 1.8}
          fill={active ? 'currentColor' : 'none'} fillOpacity={active ? 0.12 : 0}
          strokeLinejoin="round"
        />
        <path d="M7.5 17h5M8 18.5h4" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    to: '/app/account', label: 'Compte',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 20 20" fill="none">
        <circle
          cx="10" cy="6.5" r="3.5"
          stroke="currentColor" strokeWidth={active ? 2.2 : 1.8}
          fill={active ? 'currentColor' : 'none'} fillOpacity={active ? 0.12 : 0}
        />
        <path
          d="M2.5 17.5c0-4.14 3.36-7.5 7.5-7.5s7.5 3.36 7.5 7.5"
          stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round"
        />
      </svg>
    ),
  },
]

export default function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 flex justify-center lg:hidden z-50 pointer-events-none"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)' }}
    >
      {/* Liquid Glass pill */}
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
        {TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
          >
            {({ isActive }) => (
              <motion.div
                className="relative flex flex-col items-center justify-center gap-[3px] px-4 py-2 rounded-[18px] transition-colors duration-150 press-scale"
                style={{
                  background: isActive ? 'rgba(29,158,117,0.10)' : 'transparent',
                  minWidth: 52,
                }}
                whileTap={{ scale: 0.88 }}
              >
                {/* Active indicator dot */}
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute inset-0 rounded-[18px]"
                    style={{ background: 'rgba(29,158,117,0.10)' }}
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}

                <span
                  className="relative z-10 transition-all duration-150"
                  style={{ color: isActive ? '#1D9E75' : '#A3A3A3' }}
                >
                  {tab.icon(isActive)}
                </span>
                <span
                  className="relative z-10 text-[9.5px] font-[700] tracking-[0.02em] transition-colors duration-150 whitespace-nowrap"
                  style={{ color: isActive ? '#1D9E75' : '#A3A3A3' }}
                >
                  {tab.label}
                </span>
              </motion.div>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
