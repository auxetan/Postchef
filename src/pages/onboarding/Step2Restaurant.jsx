import { useState } from 'react'
import Button from '../../components/ui/Button.jsx'
import Chip from '../../components/ui/Chip.jsx'
import CuisinePickerOverlay from '../../components/ui/CuisinePickerOverlay.jsx'
import SpecialitePickerOverlay from '../../components/ui/SpecialitePickerOverlay.jsx'
import MenuPhotoUpload from '../../components/ui/MenuPhotoUpload.jsx'
import FeatureLock from '../../components/ui/FeatureLock.jsx'
import useAppStore from '../../store/useAppStore.js'
import useFeatureAccess from '../../hooks/useFeatureAccess.js'

const QUICK_CUISINES = ['Française', 'Italienne', 'Japonaise', 'Méditerranéenne', 'Burger', 'Végétarien', 'Pizza', 'Autre']

const inputClass = 'w-full bg-pc-bg border border-pc-border rounded-elem px-4 py-[13px] text-[14px] text-pc-ink placeholder:text-pc-ink-4 focus:outline-none focus:border-pc-green focus:bg-pc-surface transition-all'

function SectionLabel({ children }) {
  return <p className="pc-section-label mb-3">{children}</p>
}

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
    setCuisines((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c])
  }

  const extraCuisines = cuisines.filter((c) => !QUICK_CUISINES.includes(c))

  const [errors, setErrors] = useState({})

  const handleNext = () => {
    const newErrors = {}
    if (!name.trim()) newErrors.name = 'Le nom du restaurant est requis'
    if (!city.trim()) newErrors.city = 'La ville est requise'
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    setErrors({})
    updateRestaurant({ name, city, cuisineTypes: cuisines, specialite })
    onNext()
  }

  return (
    <>
      <div className="flex flex-col h-full min-h-screen">
        <div className="flex-1 px-6 pt-7 pb-[100px] space-y-7 overflow-y-auto">

          {/* Step title */}
          <div>
            <h2 className="text-[26px] font-black tracking-[-0.04em] text-pc-ink leading-none mb-1">
              Ton restaurant
            </h2>
            <p className="text-[13px] text-pc-ink-4">On personnalise tout à partir de ces infos.</p>
          </div>

          {/* Nom */}
          <div>
            <SectionLabel>Nom du restaurant <span className="text-pc-danger normal-case font-normal">*</span></SectionLabel>
            <input
              className={`${inputClass} ${errors.name ? 'border-pc-danger focus:border-pc-danger' : ''}`}
              placeholder="Ex : La Trattoria"
              value={name}
              onChange={(e) => { setName(e.target.value); if (errors.name) setErrors((p) => ({ ...p, name: undefined })) }}
            />
            {errors.name && <p className="text-[12px] text-pc-danger mt-[6px] font-medium">{errors.name}</p>}
          </div>

          {/* Ville */}
          <div>
            <SectionLabel>Ville <span className="text-pc-danger normal-case font-normal">*</span></SectionLabel>
            <input
              className={`${inputClass} ${errors.city ? 'border-pc-danger focus:border-pc-danger' : ''}`}
              placeholder="Ex : Marseille"
              value={city}
              onChange={(e) => { setCity(e.target.value); if (errors.city) setErrors((p) => ({ ...p, city: undefined })) }}
            />
            {errors.city && <p className="text-[12px] text-pc-danger mt-[6px] font-medium">{errors.city}</p>}
          </div>

          {/* Cuisine */}
          <div>
            <SectionLabel>Type de cuisine</SectionLabel>
            <div className="flex flex-wrap gap-2 mb-3">
              {QUICK_CUISINES.map((c) => (
                <Chip key={c} label={c} selected={cuisines.includes(c)} onClick={() => toggleQuickCuisine(c)} />
              ))}
            </div>

            {extraCuisines.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
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

            <button
              onClick={() => setShowCuisineOverlay(true)}
              className="flex items-center gap-2 text-[13px] font-semibold text-pc-green hover:text-pc-green-dark transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M7 1v12M1 7h12" />
              </svg>
              Voir plus de cuisines
              <span className="text-[11px] font-normal text-pc-ink-4">(60+ options)</span>
            </button>
          </div>

          {/* Spécialité */}
          <div>
            <SectionLabel>Spécialité signature <span className="font-normal text-pc-ink-4 normal-case">(recommandé)</span></SectionLabel>
            {specialite ? (
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-pc-green-light border border-pc-green/30 rounded-elem px-4 py-[12px] text-[14px] font-semibold text-pc-green-dark">
                  {specialite}
                </div>
                <button onClick={() => setShowSpecialiteOverlay(true)} className="text-[12px] text-pc-green font-semibold hover:text-pc-green-dark">
                  Changer
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowSpecialiteOverlay(true)}
                className="w-full border-2 border-dashed border-pc-border rounded-elem px-4 py-[13px] text-[14px] text-pc-ink-4 hover:border-pc-green hover:text-pc-green transition-all flex items-center gap-3"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M8 1v14M1 8h14" />
                </svg>
                Chercher une spécialité...
              </button>
            )}
          </div>

          {/* Import carte */}
          <div>
            <SectionLabel>
              Photo de ta carte{' '}
              <span className="font-normal text-pc-ink-4 normal-case">
                {can('menuPhotoImport') ? '— optionnel' : '— Pro'}
              </span>
            </SectionLabel>
            {can('menuPhotoImport') ? (
              <MenuPhotoUpload value={storedMenu} onChange={setMenuPhoto} />
            ) : (
              <FeatureLock
                feature="menuPhotoImport"
                title="Import de carte"
                description="Chef détecte tes plats et génère du contenu hyper-personnalisé."
              />
            )}
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 md:absolute px-6 pb-8 pt-4 bg-white border-t border-pc-rule max-w-[360px] md:mx-auto w-full">
          <Button fullWidth onClick={handleNext}>
            Continuer
          </Button>
        </div>
      </div>

      {showCuisineOverlay && (
        <CuisinePickerOverlay selected={cuisines} onChange={setCuisines} onClose={() => setShowCuisineOverlay(false)} />
      )}
      {showSpecialiteOverlay && (
        <SpecialitePickerOverlay value={specialite} onChange={setSpecialite} onClose={() => setShowSpecialiteOverlay(false)} />
      )}
    </>
  )
}
