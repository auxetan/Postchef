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
  { id: 'familles', label: 'Familles et locaux', emoji: '👨‍👩‍👧' },
  { id: 'touristes', label: 'Touristes et visiteurs', emoji: '🌍' },
  { id: 'pros', label: 'Professionnels midi', emoji: '💼' },
  { id: 'etudiants', label: 'Étudiants et jeunes', emoji: '🎓' },
]

const MOTIFS = [
  { value: 'nouveaux-clients', name: 'Nouveaux clients', desc: 'Attirer des inconnus', emoji: '🏠' },
  { value: 'fideliser',        name: 'Fidéliser',        desc: 'Garder les habitués',  emoji: '❤️' },
  { value: 'evenements',       name: 'Événements',       desc: 'Soirées spéciales',    emoji: '✅' },
  { value: 'coulisses',        name: 'Coulisses',        desc: "Montrer l'équipe",     emoji: '👤' },
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
                  <span className="text-[18px] leading-none flex-shrink-0">{p.emoji}</span>
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
                  <div className="text-[24px] leading-none mb-2">{m.emoji}</div>
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
