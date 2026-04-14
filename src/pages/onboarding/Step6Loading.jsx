import { useState, useEffect } from 'react'
import useAppStore from '../../store/useAppStore.js'
import { PC_GREEN } from '../../utils/colors.js'

export default function Step6Loading({ onNext }) {
  const restaurant = useAppStore((s) => s.onboarding.restaurant)
  const preferences = useAppStore((s) => s.onboarding.preferences)

  const name = restaurant.name || 'ton restaurant'
  const city = restaurant.city || 'ta ville'
  const cuisines = restaurant.cuisineTypes?.slice(0, 2).join(', ') || 'ta cuisine'
  const plateformes = preferences.plateformes?.join(' & ') || 'tes plateformes'

  const CHECKLIST = [
    `Profil "${name}" · ${city} analysé`,
    `Cuisine ${cuisines} — tendances locales détectées`,
    `Audience cible et créneaux optimaux calculés`,
    `Formats ${plateformes} sélectionnés`,
    `Hooks IA personnalisés générés`,
  ]

  const [checked, setChecked] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    const timers = CHECKLIST.map((_, i) =>
      setTimeout(() => {
        setChecked(i + 1)
        if (i === CHECKLIST.length - 1) setTimeout(() => setDone(true), 500)
      }, 600 + i * 700)
    )
    return () => timers.forEach(clearTimeout)
  }, [])

  useEffect(() => {
    if (done) {
      const t = setTimeout(() => onNext(), 350)
      return () => clearTimeout(t)
    }
  }, [done, onNext])

  return (
    <div className="flex flex-col h-full min-h-screen px-6 pt-10 pb-8">

      {/* Spinner */}
      <div className="flex justify-center mb-6">
        <div className="relative w-[72px] h-[72px]">
          <div
            className="absolute inset-0 rounded-full animate-spin"
            style={{ border: '4px solid #E1F5EE', borderTopColor: PC_GREEN }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <circle cx="14" cy="10" r="5" fill={PC_GREEN}/>
              <path d="M4 26c0-5.52 4.48-10 10-10s10 4.48 10 10" stroke={PC_GREEN} strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
        </div>
      </div>

      <h2 className="text-[26px] font-black tracking-[-0.04em] text-pc-ink text-center leading-none mb-2">
        Chef prépare ton plan…
      </h2>
      <p className="text-[13px] text-pc-ink-4 text-center mb-8">
        Personnalisé pour {name} à {city}
      </p>

      {/* Checklist */}
      <div className="space-y-[10px]">
        {CHECKLIST.map((item, i) => {
          const isDone = i < checked
          return (
            <div
              key={i}
              className={`flex items-center gap-3 text-[13px] px-4 py-[12px] bg-pc-surface rounded-elem border transition-all duration-400
                ${isDone ? 'border-pc-green/30' : 'border-pc-border opacity-40'}`}
            >
              <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-300
                ${isDone ? 'bg-pc-green' : 'bg-pc-border'}`}>
                {isDone && (
                  <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                    <path d="M2 5.5l2.5 2.5 4.5-4.5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                )}
              </div>
              <span className={isDone ? 'text-pc-ink font-medium' : 'text-pc-ink-4'}>{item}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
