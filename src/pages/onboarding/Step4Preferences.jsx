import { useState } from 'react'
import Button from '../../components/ui/Button.jsx'
import ScaleSelector from '../../components/ui/ScaleSelector.jsx'
import useAppStore from '../../store/useAppStore.js'

const PLATEFORMES = [
  { id: 'TikTok',    emoji: '🎵', color: 'text-pc-ink-2' },
  { id: 'Instagram', emoji: '📸', color: 'text-[#c026d3]' },
  { id: 'Facebook',  emoji: '👥', color: 'text-[#2563eb]' },
]

const FREQUENCES = [
  { value: '1/sem',   label: '1/sem' },
  { value: '2-3/sem', label: '2–3/sem' },
  { value: '4-5/sem', label: '4–5/sem' },
  { value: '6-7/sem', label: '6–7/sem' },
]

const STYLES = [
  { id: 'Vidéo courte', emoji: '🎬' },
  { id: 'Photo plat',   emoji: '🍽️' },
  { id: 'Coulisses',    emoji: '👨‍🍳' },
  { id: 'Témoignages',  emoji: '💬' },
  { id: 'Tendances',    emoji: '🔥' },
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
                  <span className="text-[26px] leading-none">{p.emoji}</span>
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
                  <span className="text-[14px] leading-none">{s.emoji}</span>
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
