import { NavLink } from 'react-router-dom'

const TABS = [
  {
    to: '/app', end: true, label: 'Accueil',
    icon: (
      <svg width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 7L8 1l7 6v7a1 1 0 01-1 1H2a1 1 0 01-1-1V7z"/>
        <path d="M5 15V9h6v6"/>
      </svg>
    ),
  },
  {
    to: '/app/calendar', label: 'Calendrier',
    icon: (
      <svg width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
        <rect x="1" y="3" width="14" height="12" rx="2"/>
        <path d="M5 1v3M11 1v3M1 7h14"/>
      </svg>
    ),
  },
  {
    to: '/app/ideas', label: 'Idées',
    icon: (
      <svg width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
        <path d="M8 1a5 5 0 013.5 8.5V11a1 1 0 01-1 1h-5a1 1 0 01-1-1V9.5A5 5 0 018 1z"/>
        <path d="M6 13.5h4M6.5 15h3"/>
      </svg>
    ),
  },
  {
    to: '/app/trends', label: 'Tendances',
    icon: (
      <svg width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 14l3-4 3 2 4-7 4 5"/>
        <path d="M10 5h4v4"/>
      </svg>
    ),
  },
  {
    to: '/app/account', label: 'Compte',
    icon: (
      <svg width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
        <circle cx="8" cy="5" r="3"/>
        <path d="M1 14c0-3.31 3.13-6 7-6s7 2.69 7 6"/>
      </svg>
    ),
  },
]

export default function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-pc-surface border-t border-pc-border flex lg:hidden z-50"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      {TABS.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.end}
          className="flex-1"
        >
          {({ isActive }) => (
            <div className="flex flex-col items-center justify-center pt-3 pb-[10px] gap-[5px]">
              <span className={`transition-colors duration-100 ${isActive ? 'text-pc-green' : 'text-pc-ink-4'}`}>
                {tab.icon}
              </span>
              <span className={`text-[10px] font-semibold transition-colors duration-100 ${isActive ? 'text-pc-green' : 'text-pc-ink-4'}`}>
                {tab.label}
              </span>
            </div>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
