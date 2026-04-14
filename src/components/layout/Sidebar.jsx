import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import useAppStore from '../../store/useAppStore.js'
import { PLAN_DISPLAY_NAMES } from '../../utils/plans.js'
import { LogoWordmark } from '../ui/LogoMark.jsx'

const NAV = [
  {
    to: '/app',
    end: true,
    label: 'Dashboard',
    icon: (active) => (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M1 7L8 1l7 6v7a1 1 0 01-1 1H2a1 1 0 01-1-1V7z"
          stroke="currentColor" strokeWidth={active ? 2 : 1.75} strokeLinecap="round" strokeLinejoin="round"
          fill={active ? 'currentColor' : 'none'} fillOpacity={active ? 0.12 : 0}
        />
        <path d="M5 15V9h6v6" stroke="currentColor" strokeWidth={active ? 2 : 1.75} strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    to: '/app/calendar',
    label: 'Calendrier',
    icon: (active) => (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="3" width="14" height="12" rx="2.5"
          stroke="currentColor" strokeWidth={active ? 2 : 1.75}
          fill={active ? 'currentColor' : 'none'} fillOpacity={active ? 0.10 : 0}
        />
        <path d="M5 1v3M11 1v3M1 7h14" stroke="currentColor" strokeWidth={active ? 2 : 1.75} strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    to: '/app/ideas',
    label: 'Idées IA',
    icon: (active) => (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M8 1a5 5 0 013.5 8.5V11a1 1 0 01-1 1h-5a1 1 0 01-1-1V9.5A5 5 0 018 1z"
          stroke="currentColor" strokeWidth={active ? 2 : 1.75} strokeLinecap="round"
          fill={active ? 'currentColor' : 'none'} fillOpacity={active ? 0.12 : 0}
        />
        <path d="M6 13.5h4M6.5 15h3" stroke="currentColor" strokeWidth={active ? 2 : 1.75} strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    to: '/app/studio',
    label: 'Studio',
    icon: (active) => (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="3" width="14" height="10" rx="2.5"
          stroke="currentColor" strokeWidth={active ? 2 : 1.75} strokeLinecap="round"
          fill={active ? 'currentColor' : 'none'} fillOpacity={active ? 0.10 : 0}
        />
        <path d="M6 6.5l4.5 3-4.5 3V6.5z"
          fill="currentColor" stroke="currentColor"
          strokeWidth={active ? 0 : 1.6} strokeLinejoin="round"
          fillOpacity={active ? 1 : 0.7}
        />
      </svg>
    ),
  },
  {
    to: '/app/trends',
    label: 'Tendances',
    icon: (active) => (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M1 14l3-4 3 2 4-7 4 5" stroke="currentColor" strokeWidth={active ? 2 : 1.75} strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M10 5h4v4" stroke="currentColor" strokeWidth={active ? 2 : 1.75} strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    to: '/app/analytics',
    label: 'Analytics',
    icon: (active) => (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M1 13l4-5 3 3 4-6 3 8" stroke="currentColor" strokeWidth={active ? 2 : 1.75} strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    to: '/app/account',
    label: 'Compte',
    icon: (active) => (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="5" r="3"
          stroke="currentColor" strokeWidth={active ? 2 : 1.75}
          fill={active ? 'currentColor' : 'none'} fillOpacity={active ? 0.12 : 0}
        />
        <path d="M1 14c0-3.31 3.13-6 7-6s7 2.69 7 6" stroke="currentColor" strokeWidth={active ? 2 : 1.75} strokeLinecap="round"/>
      </svg>
    ),
  },
]

const PLAN_CONFIG = {
  starter:     { label: 'Starter',     bg: 'rgba(0,0,0,0.05)',        color: '#737373' },
  pro_monthly: { label: 'Pro Mensuel', bg: 'rgba(37,99,235,0.08)',    color: '#2563eb' },
  pro_annual:  { label: 'Pro Annuel',  bg: 'rgba(29,158,117,0.10)',   color: '#1D9E75' },
  pro:         { label: 'Pro',         bg: 'rgba(29,158,117,0.10)',   color: '#1D9E75' },
}

export default function Sidebar() {
  const plan = useAppStore((s) => s.user?.plan || 'starter')
  const restaurantName = useAppStore((s) => s.onboarding?.restaurant?.name || 'Mon Restaurant')
  const cfg = PLAN_CONFIG[plan] || PLAN_CONFIG.starter
  const initials = restaurantName.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase()).join('')

  return (
    <aside
      className="hidden lg:flex flex-col w-[220px] h-screen fixed left-0 top-0 z-40"
      style={{ background: '#FFFFFF', borderRight: '1px solid rgba(0,0,0,0.06)' }}
    >
      {/* Logo */}
      <div className="px-5 pt-6 pb-5">
        <LogoWordmark iconSize={26} textSize={17} />
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 space-y-[2px] overflow-y-auto" aria-label="Navigation principale">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            aria-label={item.label}
          >
            {({ isActive }) => (
              <div className="relative">
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-[12px]"
                    style={{ background: 'rgba(29,158,117,0.08)' }}
                    transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                  />
                )}
                <div
                  className={`relative flex items-center gap-[10px] px-3 py-[9px] rounded-[12px] text-[13px] font-[${isActive ? '700' : '500'}] transition-all duration-100 ${
                    isActive
                      ? 'text-pc-green'
                      : 'text-pc-ink-3 hover:text-pc-ink hover:bg-[rgba(0,0,0,0.03)]'
                  }`}
                >
                  <span style={{ color: isActive ? '#1D9E75' : 'inherit' }}>
                    {item.icon(isActive)}
                  </span>
                  <span className={isActive ? 'font-[700]' : 'font-[500]'}>
                    {item.label}
                  </span>
                </div>
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Restaurant + Plan footer */}
      <div
        className="mx-3 mb-5 p-3 rounded-[14px]"
        style={{ background: 'rgba(0,0,0,0.03)' }}
      >
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-[800] text-white flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #1D9E75 0%, #0F6E56 100%)' }}
          >
            {initials || '🍽️'}
          </div>
          <div className="min-w-0">
            <div className="text-[12px] font-[700] text-pc-ink truncate leading-tight">
              {restaurantName}
            </div>
            <div
              className="inline-flex items-center px-[6px] py-[2px] rounded-[5px] text-[10px] font-[700] mt-[3px]"
              style={{ background: cfg.bg, color: cfg.color }}
            >
              {cfg.label}
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
