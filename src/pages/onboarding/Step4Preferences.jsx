import { useState } from 'react'
import Button from '../../components/ui/Button.jsx'
import ScaleSelector from '../../components/ui/ScaleSelector.jsx'
import useAppStore from '../../store/useAppStore.js'

const PLATEFORMES = [
  {
    id: 'TikTok',
    icon: (
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 3a4 4 0 0 0 4 4V11a8 8 0 0 1-4-1v6a7 7 0 1 1-7-7v4a3 3 0 1 0 3 3V3h4z"/>
      </svg>
    ),
  },
  {
    id: 'Instagram',
    icon: (
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="20" height="20" rx="6"/>
        <circle cx="13" cy="13" r="5"/>
        <circle cx="19.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
      </svg>
    ),
  },
  {
    id: 'Facebook',
    icon: (
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="13" cy="13" r="10"/>
        <path d="M16 8h-2a3 3 0 0 0-3 3v2H9v3h2v6h3v-6h2l1-3h-3v-2a1 1 0 0 1 1-1h2V8z"/>
      </svg>
    ),
  },
]

const FREQUENCES = [
  { value: '1/sem',   label: '1/sem' },
  { value: '2-3/sem', label: '2–3/sem' },
  { value: '4-5/sem', label: '4–5/sem' },
  { value: '6-7/sem', label: '6–7/sem' },
]

const STYLES = [
  {
    id: 'Vidéo courte',
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="9" height="8" rx="1.5"/>
        <path d="M10 5.5l3-2v7l-3-2"/>
      </svg>
    ),
  },
  {
    id: 'Photo plat',
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="7" cy="7" r="3.5"/>
        <ellipse cx="7" cy="12.5" rx="5.5" ry="1" strokeWidth="1.4"/>
      </svg>
    ),
  },
  {
    id: 'Coulisses',
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="7" cy="5" r="2.5"/>
        <path d="M2 13c0-2.76 2.24-5 5-5s5 2.24 5 5"/>
      </svg>
    ),
  },
  {
    id: 'Témoignages',
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2H2a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h2v2l3-2h5a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1z"/>
      </svg>
    ),
  },
  {
    id: 'Tendances',
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 10l4-4 3 3 5-6"/>
        <path d="M9 3h4v4"/>
      </svg>
    ),
  },
]

function SectionLabel({ children }) {
  return <p className="pc-section-label mb-3">{children}</p>
}

export default function Step4Preferences({ onNext }) {
  const updatePreferences = useAppStore((s) => s.updatePreferences)
  const stored = useAppStore((s) => s.onboarding.preferences)

  const [plateformes, setPlateformes] = useState(stored.plateformes)
  const [frequence, setFrequence] = useState(stored.frequence)
  const [styles, setStyles] = useState(stored.styles)

  const togglePlateforme = (p) => {
    setPlateformes((prev) => prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p])
  }
  const toggleStyle = (s) => {
    setStyles((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s])
  }

  const handleNext = () => {
    updatePreferences({ plateformes, frequence, styles })
    onNext()
  }

  return (
    <div className="flex flex-col h-full min-h-screen">
      <div className="flex-1 px-6 pt-7 pb-[100px] space-y-7 overflow-y-auto">

        {/* Step title */}
        <div>
          <h2 className="text-[26px] font-black tracking-[-0.04em] text-pc-ink leading-none mb-1">
            Tes préférences
          </h2>
          <p className="text-[13px] text-pc-ink-4">On adapte les formats à tes habitudes.</p>
        </div>

        {/* Plateformes */}
        <div>
          <SectionLabel>Plateformes</SectionLabel>
          <div className="grid grid-cols-3 gap-2">
            {PLATEFORMES.map((p) => {
              const sel = plateformes.includes(p.id)
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => togglePlateforme(p.id)}
                  className={`rounded-card border-[1.5px] py-4 flex flex-col items-center gap-2 transition-all duration-150
                    ${sel ? 'border-pc-green bg-pc-green-light' : 'border-pc-border bg-pc-surface hover:border-pc-green/40'}`}
                >
                  <span className={`${sel ? 'text-pc-green-dark' : 'text-pc-ink-3'}`}>{p.icon}</span>
                  <span className={`text-[12px] font-bold ${sel ? 'text-pc-green-dark' : 'text-pc-ink'}`}>{p.id}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Fréquence */}
        <div>
          <SectionLabel>Fréquence de publication</SectionLabel>
          <ScaleSelector options={FREQUENCES} value={frequence} onChange={setFrequence} />
        </div>

        {/* Styles */}
        <div>
          <SectionLabel>Style de contenu préféré</SectionLabel>
          <div className="flex flex-wrap gap-2">
            {STYLES.map((s) => {
              const sel = styles.includes(s.id)
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => toggleStyle(s.id)}
                  className={`flex items-center gap-2 px-4 py-[9px] rounded-pill border-[1.5px] text-[13px] font-medium transition-all duration-150
                    ${sel ? 'bg-pc-green text-white border-pc-green' : 'bg-pc-surface text-pc-ink border-pc-border hover:border-pc-green/40'}`}
                >
                  <span className={sel ? 'text-white' : 'text-pc-ink-3'}>{s.icon}</span>
                  {s.id}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 md:absolute px-6 pb-8 pt-4 bg-white border-t border-pc-rule max-w-[360px] md:mx-auto w-full">
        <Button fullWidth onClick={handleNext}>
          Continuer
        </Button>
      </div>
    </div>
  )
}
