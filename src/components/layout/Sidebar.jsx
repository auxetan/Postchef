import { NavLink } from 'react-router-dom'
import useAppStore from '../../store/useAppStore.js'
import { PLAN_DISPLAY_NAMES } from '../../utils/plans.js'

const NAV = [
  {
    to: '/app',
    end: true,
    label: 'Dashboard',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 7L8 1l7 6v7a1 1 0 01-1 1H2a1 1 0 01-1-1V7z"/>
        <path d="M5 15V9h6v6"/>
      </svg>
    ),
  },
  {
    to: '/app/calendar',
    label: 'Calendrier',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
        <rect x="1" y="3" width="14" height="12" rx="2"/>
        <path d="M5 1v3M11 1v3M1 7h14"/>
      </svg>
    ),
  },
  {
    to: '/app/ideas',
    label: 'Idées IA',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
        <path d="M8 1a5 5 0 013.5 8.5V11a1 1 0 01-1 1h-5a1 1 0 01-1-1V9.5A5 5 0 018 1z"/>
        <path d="M6 13.5h4M6.5 15h3"/>
      </svg>
    ),
  },
  {
    to: '/app/studio',
    label: 'Studio',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="14" height="10" rx="2"/>
        <path d="M6 6.5l4.5 3-4.5 3V6.5z"/>
      </svg>
    ),
  },
  {
    to: '/app/trends',
    label: 'Tendances',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 14l3-4 3 2 4-7 4 5"/>
        <path d="M10 5h4v4"/>
      </svg>
    ),
  },
  {
    to: '/app/analytics',
    label: 'Analytics',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 13l4-5 3 3 4-6 3 8"/>
      </svg>
    ),
  },
  {
    to: '/app/account',
    label: 'Compte',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
        <circle cx="8" cy="5" r="3"/>
        <path d="M1 14c0-3.31 3.13-6 7-6s7 2.69 7 6"/>
      </svg>
    ),
  },
]

const PLAN_BADGE = {
  starter:     { label: 'Starter',      cls: 'text-pc-ink-3' },
  pro_monthly: { label: 'Pro Mensuel',  cls: 'text-[#2563eb]' },
  pro_annual:  { label: 'Pro Annuel',   cls: 'text-pc-green' },
}

export default function Sidebar() {
  const plan = useAppStore((s) => s.user?.plan || 'starter')
  const badge = PLAN_BADGE[plan] || PLAN_BADGE.starter

  return (
    <aside className="hidden lg:flex flex-col w-[220px] h-screen bg-pc-surface border-r border-pc-border fixed left-0 top-0 z-40">

      {/* Wordmark */}
      <div className="px-6 py-6 border-b border-pc-rule">
        <span className="text-[17px] font-black tracking-[-0.04em] text-pc-ink">
          Post<span className="text-pc-green">Chef</span>
        </span>
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-4 px-2 space-y-px">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `relative flex items-center gap-3 px-4 py-[10px] rounded-[10px] text-[13px] font-medium transition-all duration-100
              ${isActive
                ? 'text-pc-ink bg-pc-bg font-semibold'
                : 'text-pc-ink-3 hover:text-pc-ink-2 hover:bg-pc-bg'}`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 top-[6px] bottom-[6px] w-[3px] bg-pc-green rounded-full" />
                )}
                <span className={isActive ? 'text-pc-green' : 'text-current'}>
                  {item.icon}
                </span>
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Plan indicator */}
      <div className="px-5 py-4 border-t border-pc-rule">
        <div className="text-[10px] font-bold uppercase tracking-caps text-pc-ink-4 mb-[3px]">Plan</div>
        <div className={`text-[13px] font-bold ${badge.cls}`}>
          {PLAN_DISPLAY_NAMES[plan] || 'Starter'}
        </div>
      </div>
    </aside>
  )
}
