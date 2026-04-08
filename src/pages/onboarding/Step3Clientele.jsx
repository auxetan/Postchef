import { useState } from 'react'
import Button from '../../components/ui/Button.jsx'
import ScaleSelector from '../../components/ui/ScaleSelector.jsx'
import useAppStore from '../../store/useAppStore.js'

const COUVERTS = [
  { value: '-20', label: '-20', sub: 'petit' },
  { value: '20-50', label: '20–50', sub: 'moyen' },
  { value: '50-100', label: '50–100', sub: 'grand' },
  { value: '100+', label: '100+', sub: 'très grand' },
]

const PROFILS = [
  {
    id: 'familles', label: 'Familles et locaux',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="6" cy="5" r="2.5"/>
        <circle cx="12" cy="5" r="2.5"/>
        <path d="M1 16c0-3.31 2.24-6 5-6h6c2.76 0 5 2.69 5 6"/>
      </svg>
    ),
  },
  {
    id: 'touristes', label: 'Touristes et visiteurs',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="9" r="7.5"/>
        <path d="M1.5 9h15M9 1.5a11.5 11.5 0 0 1 0 15M9 1.5a11.5 11.5 0 0 0 0 15"/>
      </svg>
    ),
  },
  {
    id: 'pros', label: 'Professionnels midi',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="14" height="9" rx="2"/>
        <path d="M6 7V5a3 3 0 0 1 6 0v2"/>
      </svg>
    ),
  },
  {
    id: 'etudiants', label: 'Étudiants et jeunes',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 2l8 4-8 4-8-4 8-4z"/>
        <path d="M5 8.5v4a4 4 0 0 0 8 0v-4"/>
        <path d="M17 6v4"/>
      </svg>
    ),
  },
]

const MOTIFS = [
  {
    value: 'nouveaux-clients', name: 'Nouveaux clients', desc: 'Attirer des inconnus',
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="#1D9E75" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 2C6.03 2 2 6.03 2 11s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9z"/>
        <path d="M11 7v4l3 2"/>
      </svg>
    ),
  },
  {
    value: 'fideliser', name: 'Fidéliser', desc: 'Garder les habitués',
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="#1D9E75" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 19s-8-5-8-11a5 5 0 0 1 8-4 5 5 0 0 1 8 4c0 6-8 11-8 11z"/>
      </svg>
    ),
  },
  {
    value: 'evenements', name: 'Événements', desc: 'Soirées spéciales',
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="#1D9E75" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="5" width="16" height="15" rx="2"/>
        <path d="M16 3v4M6 3v4M3 9h16"/>
      </svg>
    ),
  },
  {
    value: 'coulisses', name: 'Coulisses', desc: "Montrer l'équipe",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="#1D9E75" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="8" r="3.5"/>
        <path d="M4 20c0-3.87 3.13-7 7-7h0c3.87 0 7 3.13 7 7"/>
      </svg>
    ),
  },
]

function SectionLabel({ children }) {
  return <p className="pc-section-label mb-3">{children}</p>
}

export default function Step3Clientele({ onNext }) {
  const updateRestaurant = useAppStore((s) => s.updateRestaurant)
  const updateClientele = useAppStore((s) => s.updateClientele)
  const stored = useAppStore((s) => s.onboarding)

  const [couverts, setCouverts] = useState(stored.restaurant.couverts)
  const [profils, setProfils] = useState(stored.clientele.profils)
  const [objectif, setObjectif] = useState(stored.clientele.objectif)

  const toggleProfil = (p) => {
    setProfils((prev) => prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p])
  }

  const handleNext = () => {
    updateRestaurant({ couverts })
    updateClientele({ profils, objectif })
    onNext()
  }

  return (
    <div className="flex flex-col h-full min-h-screen">
      <div className="flex-1 px-6 pt-7 pb-[100px] space-y-7 overflow-y-auto">

        {/* Step title */}
        <div>
          <h2 className="text-[26px] font-black tracking-[-0.04em] text-pc-ink leading-none mb-1">
            Ta clientèle
          </h2>
          <p className="text-[13px] text-pc-ink-4">Pour des idées vraiment adaptées à ton public.</p>
        </div>

        {/* Couverts */}
        <div>
          <SectionLabel>Couverts par service</SectionLabel>
          <ScaleSelector options={COUVERTS} value={couverts} onChange={setCouverts} />
        </div>

        {/* Profils */}
        <div>
          <SectionLabel>Qui sont tes clients ?</SectionLabel>
          <div className="space-y-2">
            {PROFILS.map((p) => {
              const sel = profils.includes(p.label)
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => toggleProfil(p.label)}
                  className={`w-full flex items-center gap-3 px-4 py-[13px] rounded-elem border-[1.5px] text-[14px] font-medium transition-all duration-150
                    ${sel
                      ? 'border-pc-green bg-pc-green-light text-pc-green-dark'
                      : 'border-pc-border bg-pc-surface text-pc-ink hover:border-pc-green/40'}`}
                >
                  <span className="flex-shrink-0 text-pc-ink-3">{p.icon}</span>
                  <span className="flex-1 text-left">{p.label}</span>
                  <div className={`w-5 h-5 rounded-full border-[1.5px] flex items-center justify-center flex-shrink-0 transition-all
                    ${sel ? 'bg-pc-green border-pc-green' : 'border-pc-border'}`}>
                    {sel && (
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M2 5l2.5 2.5 3.5-4" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/>
                      </svg>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Objectif */}
        <div>
          <SectionLabel>Objectif sur les réseaux</SectionLabel>
          <div className="grid grid-cols-2 gap-3">
            {MOTIFS.map((m) => {
              const sel = objectif === m.value
              return (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setObjectif(m.value)}
                  className={`rounded-card border-[1.5px] p-4 text-left transition-all duration-150 bg-pc-surface
                    ${sel ? 'border-pc-green bg-pc-green-light' : 'border-pc-border hover:border-pc-green/40'}`}
                >
                  <div className="w-10 h-10 rounded-[10px] bg-pc-green-light flex items-center justify-center mb-2">{m.icon}</div>
                  <div className={`text-[13px] font-bold mb-[2px] ${sel ? 'text-pc-green-dark' : 'text-pc-ink'}`}>{m.name}</div>
                  <div className="text-[11px] text-pc-ink-4">{m.desc}</div>
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
