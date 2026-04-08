import { useState } from 'react'
import Button from '../../components/ui/Button.jsx'
import Chip from '../../components/ui/Chip.jsx'
import ChefAvatar from '../../components/ui/ChefAvatar.jsx'
import ScaleSelector from '../../components/ui/ScaleSelector.jsx'
import useAppStore from '../../store/useAppStore.js'

const PLATEFORMES = ['TikTok', 'Instagram', 'Facebook']

const FREQUENCES = [
  { value: '1/sem', label: '1/sem' },
  { value: '2-3/sem', label: '2–3/sem' },
  { value: '4-5/sem', label: '4–5/sem' },
  { value: '6-7/sem', label: '6–7/sem' },
]

const STYLES = ['Vidéo courte', 'Photo plat', 'Coulisses', 'Témoignages', 'Tendances']

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
    <div className="flex flex-col h-full">
      <div className="flex-1 px-5 pt-4 pb-[110px] space-y-5">
        {/* Plateformes */}
        <div>
          <div className="flex items-start gap-[10px] mb-3">
            <ChefAvatar size={36} />
            <div className="bg-pc-divider rounded-[20px_20px_20px_4px] px-4 py-[14px] text-[14px] leading-[1.6] text-[#111] flex-1">
              Sur quelles plateformes tu postes ?
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {PLATEFORMES.map((p) => (
              <Chip
                key={p}
                label={p}
                selected={plateformes.includes(p)}
                onClick={() => togglePlateforme(p)}
              />
            ))}
          </div>
        </div>

        {/* Fréquence */}
        <div>
          <div className="flex items-start gap-[10px] mb-3">
            <ChefAvatar size={36} />
            <div className="bg-pc-divider rounded-[20px_20px_20px_4px] px-4 py-[14px] text-[14px] leading-[1.6] text-[#111] flex-1">
              À quelle fréquence veux-tu poster ?
            </div>
          </div>
          <ScaleSelector options={FREQUENCES} value={frequence} onChange={setFrequence} />
        </div>

        {/* Style de contenu */}
        <div>
          <div className="flex items-start gap-[10px] mb-3">
            <ChefAvatar size={36} />
            <div className="bg-pc-divider rounded-[20px_20px_20px_4px] px-4 py-[14px] text-[14px] leading-[1.6] text-[#111] flex-1">
              Quel style de contenu te parle le plus ?
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {STYLES.map((s) => (
              <Chip
                key={s}
                label={s}
                selected={styles.includes(s)}
                onClick={() => toggleStyle(s)}
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
