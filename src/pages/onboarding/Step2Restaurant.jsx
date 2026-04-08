import { useState } from 'react'
import Button from '../../components/ui/Button.jsx'
import Chip from '../../components/ui/Chip.jsx'
import ChefAvatar from '../../components/ui/ChefAvatar.jsx'
import CuisinePickerOverlay from '../../components/ui/CuisinePickerOverlay.jsx'
import SpecialitePickerOverlay from '../../components/ui/SpecialitePickerOverlay.jsx'
import MenuPhotoUpload from '../../components/ui/MenuPhotoUpload.jsx'
import FeatureLock from '../../components/ui/FeatureLock.jsx'
import useAppStore from '../../store/useAppStore.js'
import useFeatureAccess from '../../hooks/useFeatureAccess.js'
// cuisineOverlay + specialiteOverlay sont libres en onboarding (infos de base du resto)

// Chips rapides — les 8 plus courants
const QUICK_CUISINES = ['Française', 'Italienne', 'Japonaise', 'Méditerranéenne', 'Burger', 'Végétarien', 'Pizza', 'Autre']

export default function Step2Restaurant({ onNext }) {
  const updateRestaurant = useAppStore((s) => s.updateRestaurant)
  const setMenuPhoto = useAppStore((s) => s.setMenuPhoto)
  const stored = useAppStore((s) => s.onboarding.restaurant)
  const storedMenu = useAppStore((s) => s.menuPhoto)
  const { can } = useFeatureAccess()

  const [name, setName] = useState(stored.name)
  const [city, setCity] = useState(stored.city)
  const [cuisines, setCuisines] = useState(stored.cuisineTypes)
  const [specialite, setSpecialite] = useState(stored.specialite)
  const [showCuisineOverlay, setShowCuisineOverlay] = useState(false)
  const [showSpecialiteOverlay, setShowSpecialiteOverlay] = useState(false)

  const toggleQuickCuisine = (c) => {
    setCuisines((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    )
  }

  // Cuisines NOT in the quick list (selected via overlay)
  const extraCuisines = cuisines.filter((c) => !QUICK_CUISINES.includes(c))

  const handleNext = () => {
    updateRestaurant({ name, city, cuisineTypes: cuisines, specialite })
    onNext()
  }

  const inputClass =
    'w-full border border-pc-border rounded-[14px] px-4 py-[13px] text-[14px] text-pc-body placeholder:text-pc-hint focus:outline-none focus:border-pc-green focus:ring-2 focus:ring-pc-green/20 transition-all'

  return (
    <>
      <div className="flex flex-col h-full">
        <div className="flex-1 px-5 pt-3 pb-[90px] space-y-4 overflow-y-auto">

          {/* Nom */}
          <div>
            <div className="flex items-start gap-[10px] mb-3">
              <ChefAvatar size={36} />
              <div className="bg-pc-divider rounded-[20px_20px_20px_4px] px-4 py-[11px] text-[13px] leading-[1.55] text-[#111] flex-1">
                Quel est le nom de ton restaurant ?
              </div>
            </div>
            <input
              className={inputClass}
              placeholder="Ex : La Trattoria"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Ville */}
          <div>
            <div className="flex items-start gap-[10px] mb-3">
              <ChefAvatar size={36} />
              <div className="bg-pc-divider rounded-[20px_20px_20px_4px] px-4 py-[11px] text-[13px] leading-[1.55] text-[#111] flex-1">
                Dans quelle ville es-tu ?
              </div>
            </div>
            <input
              className={inputClass}
              placeholder="Ex : Marseille"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>

          {/* Cuisine */}
          <div>
            <div className="flex items-start gap-[10px] mb-3">
              <ChefAvatar size={36} />
              <div className="bg-pc-divider rounded-[20px_20px_20px_4px] px-4 py-[11px] text-[13px] leading-[1.55] text-[#111] flex-1">
                Quel type de cuisine proposes-tu ?
              </div>
            </div>

            {/* Quick chips */}
            <div className="flex flex-wrap gap-2 mb-2">
              {QUICK_CUISINES.map((c) => (
                <Chip
                  key={c}
                  label={c}
                  selected={cuisines.includes(c)}
                  onClick={() => toggleQuickCuisine(c)}
                />
              ))}
            </div>

            {/* Extra cuisines from overlay */}
            {extraCuisines.length > 0 && (
              <div className="flex flex-wrap gap-[5px] mb-2">
                {extraCuisines.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCuisines((prev) => prev.filter((x) => x !== c))}
                    className="flex items-center gap-1 bg-pc-green text-white text-[12px] font-semibold px-3 py-[5px] rounded-pill"
                  >
                    {c}
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M2 2l6 6M8 2L2 8" />
                    </svg>
                  </button>
                ))}
              </div>
            )}

            {/* Afficher plus — libre en onboarding */}
            <button
              onClick={() => setShowCuisineOverlay(true)}
              className="flex items-center gap-2 text-[13px] font-semibold text-pc-green hover:text-pc-green-dark transition-colors mt-1"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M7 1v12M1 7h12" />
              </svg>
              Afficher plus de cuisines
              <span className="text-[11px] font-normal text-pc-hint">(60+ options)</span>
            </button>
          </div>

          {/* Spécialité */}
          <div>
            <div className="flex items-start gap-[10px] mb-3">
              <ChefAvatar size={36} />
              <div className="bg-pc-divider rounded-[20px_20px_20px_4px] px-4 py-[11px] text-[13px] leading-[1.55] text-[#111] flex-1">
                Une spécialité signature ?
                <span className="text-pc-hint text-[12px]"> (recommandé)</span>
              </div>
            </div>

            {/* Spécialité — libre en onboarding */}
            {specialite ? (
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-pc-green-light border border-pc-green rounded-[14px] px-4 py-[11px] text-[14px] font-semibold text-pc-green-dark">
                  {specialite}
                </div>
                <button
                  onClick={() => setShowSpecialiteOverlay(true)}
                  className="text-[12px] text-pc-green font-semibold hover:text-pc-green-dark"
                >
                  Changer
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowSpecialiteOverlay(true)}
                className="w-full border-2 border-dashed border-pc-border rounded-[14px] px-4 py-[13px] text-[14px] text-pc-hint hover:border-pc-green hover:text-pc-green transition-all flex items-center gap-3"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M8 1v14M1 8h14" />
                </svg>
                Chercher une spécialité...
              </button>
            )}
          </div>

          {/* Import carte — Pro gate */}
          <div>
            <div className="flex items-start gap-[10px] mb-3">
              <ChefAvatar size={36} />
              <div className="bg-pc-divider rounded-[20px_20px_20px_4px] px-4 py-[11px] text-[13px] leading-[1.55] text-[#111] flex-1">
                Tu as une photo de ta carte ?{' '}
                {can('menuPhotoImport') ? (
                  <span>Je l'analyse pour des idées encore plus personnalisées. <span className="text-pc-hint text-[12px]">(optionnel)</span></span>
                ) : (
                  <span className="text-pc-hint text-[13px]">Disponible avec le plan Pro.</span>
                )}
              </div>
            </div>
            {can('menuPhotoImport') ? (
              <MenuPhotoUpload value={storedMenu} onChange={setMenuPhoto} />
            ) : (
              <FeatureLock
                feature="menuPhotoImport"
                title="Import de carte"
                description="Importe une photo de ta carte — Chef détecte tes plats et génère du contenu hyper-personnalisé."
              />
            )}
          </div>

        </div>

        <div className="absolute bottom-0 left-0 right-0 px-5 pb-8 pt-3 bg-white border-t border-pc-rule">
          <Button fullWidth onClick={handleNext}>
            Continuer
          </Button>
        </div>
      </div>

      {/* Overlays */}
      {showCuisineOverlay && (
        <CuisinePickerOverlay
          selected={cuisines}
          onChange={(c) => setCuisines(c)}
          onClose={() => setShowCuisineOverlay(false)}
        />
      )}
      {showSpecialiteOverlay && (
        <SpecialitePickerOverlay
          value={specialite}
          onChange={(s) => setSpecialite(s)}
          onClose={() => setShowSpecialiteOverlay(false)}
        />
      )}
    </>
  )
}
