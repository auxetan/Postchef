import { useState } from 'react'
import Button from '../../components/ui/Button.jsx'
import ChefAvatar from '../../components/ui/ChefAvatar.jsx'
import ScaleSelector from '../../components/ui/ScaleSelector.jsx'
import MotifCard from '../../components/ui/MotifCard.jsx'
import useAppStore from '../../store/useAppStore.js'

const COUVERTS = [
  { value: '-20', label: '-20', sub: 'petit' },
  { value: '20-50', label: '20–50', sub: 'moyen' },
  { value: '50-100', label: '50–100', sub: 'grand' },
  { value: '100+', label: '100+', sub: 'très grand' },
]

const PROFILS = [
  'Familles et locaux',
  'Touristes et visiteurs',
  'Professionnels midi',
  'Étudiants et jeunes',
]

const MOTIFS = [
  {
    value: 'nouveaux-clients',
    name: 'Nouveaux clients',
    desc: 'Attirer des inconnus',
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M11 2L3 8v12h6v-6h4v6h6V8L11 2z" stroke="#1D9E75" strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    value: 'fideliser',
    name: 'Fidéliser',
    desc: 'Garder les habitués',
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z" stroke="#1D9E75" strokeWidth="1.8" />
      </svg>
    ),
  },
  {
    value: 'evenements',
    name: 'Événements',
    desc: 'Soirées, menus spéciaux',
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M8 12l3 3 7-7" stroke="#1D9E75" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="11" cy="11" r="9" stroke="#1D9E75" strokeWidth="1.8" />
      </svg>
    ),
  },
  {
    value: 'coulisses',
    name: 'Coulisses',
    desc: "Montrer l'équipe",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="8" r="4" stroke="#1D9E75" strokeWidth="1.8" />
        <path d="M5 20c0-3.31 2.69-6 6-6s6 2.69 6 6" stroke="#1D9E75" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
]

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
    <div className="flex flex-col h-full">
      <div className="flex-1 px-5 pt-4 pb-[110px] space-y-5">
        {/* Couverts */}
        <div>
          <div className="flex items-start gap-[10px] mb-3">
            <ChefAvatar size={36} />
            <div className="bg-pc-divider rounded-[20px_20px_20px_4px] px-4 py-[14px] text-[14px] leading-[1.6] text-[#111] flex-1">
              Combien de couverts par service ?
            </div>
          </div>
          <ScaleSelector options={COUVERTS} value={couverts} onChange={setCouverts} />
        </div>

        {/* Profils clients */}
        <div>
          <div className="flex items-start gap-[10px] mb-3">
            <ChefAvatar size={36} />
            <div className="bg-pc-divider rounded-[20px_20px_20px_4px] px-4 py-[14px] text-[14px] leading-[1.6] text-[#111] flex-1">
              Qui sont tes clients ?
            </div>
          </div>
          <div className="space-y-2">
            {PROFILS.map((p) => {
              const sel = profils.includes(p)
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => toggleProfil(p)}
                  className={`w-full flex items-center justify-between px-4 py-[14px] rounded-elem border-[1.5px] text-[14px] font-medium transition-all duration-150 cursor-pointer
                    ${sel ? 'border-pc-green bg-pc-green-light text-pc-green-dark' : 'border-pc-border bg-white text-[#111]'}`}
                >
                  {p}
                  <div className={`w-[22px] h-[22px] rounded-full border-[1.5px] flex items-center justify-center flex-shrink-0 ${sel ? 'bg-pc-green border-pc-green' : 'border-[#d1d5db]'}`}>
                    {sel && (
                      <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                        <path d="M2 5.5l2.5 2.5 4.5-4.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
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
          <div className="flex items-start gap-[10px] mb-3">
            <ChefAvatar size={36} />
            <div className="bg-pc-divider rounded-[20px_20px_20px_4px] px-4 py-[14px] text-[14px] leading-[1.6] text-[#111] flex-1">
              Ton objectif sur les réseaux ?
            </div>
          </div>
          <div className="grid grid-cols-2 gap-[10px]">
            {MOTIFS.map((m) => (
              <MotifCard
                key={m.value}
                icon={m.icon}
                name={m.name}
                desc={m.desc}
                selected={objectif === m.value}
                onClick={() => setObjectif(m.value)}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 px-5 pb-7 pt-[14px] bg-white">
        <Button fullWidth onClick={handleNext}>
          Continuer
        </Button>
      </div>
    </div>
  )
}
