import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import useToastStore from '../../store/useToastStore.js'
import useAppStore from '../../store/useAppStore.js'
import { getFeature } from '../../utils/plans.js'

const ANTHROPIC_KEY = import.meta.env.VITE_ANTHROPIC_KEY

// ── Caption generation ──────────────────────────────────────────────────────
function generateCaption(restaurantName) {
  const hour = new Date().getHours()
  const timeOfDay = hour < 12 ? 'matin' : hour < 18 ? 'midi' : 'soir'
  const captions = {
    matin: `Préparation du ${timeOfDay} en cuisine \u{1F468}\u200D\u{1F373} Chaque matin, on repart de zéro pour vous offrir le meilleur. Passez nous voir aujourd'hui !`,
    midi: `Service du ${timeOfDay} lancé ! \u{1F37D}\uFE0F Notre équipe est prête à vous régaler. Réservez votre table dès maintenant.`,
    soir: `Ambiance du ${timeOfDay} chez ${restaurantName} \u2728 La magie opère en cuisine. On vous attend ce soir !`,
  }
  return captions[timeOfDay]
}

const HASHTAGS = [
  '#restaurant',
  '#food',
  '#foodie',
  '#instafood',
  '#chef',
  '#platdujour',
  '#cuisinemaison',
]

// ── Component ───────────────────────────────────────────────────────────────
export default function QuickCapture({ isOpen, onClose, restaurantName }) {
  const navigate = useNavigate()
  const toast = useToastStore((s) => s.toast)

  const plan               = useAppStore((s) => s.user.plan)
  const captionUsed        = useAppStore((s) => s.usage.captionUsedThisMonth ?? 0)
  const incrementCaptionUsed = useAppStore((s) => s.incrementCaptionUsed)

  const monthlyMax   = getFeature(plan, 'captionPerMonth')
  const quotaReached = monthlyMax !== Infinity && captionUsed >= monthlyMax
  const remaining    = monthlyMax === Infinity ? null : Math.max(0, monthlyMax - captionUsed)

  const [step, setStep] = useState(1)
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [caption, setCaption] = useState('')
  const [hashtags, setHashtags] = useState([])

  const cameraInputRef = useRef(null)
  const galleryInputRef = useRef(null)

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImage(file)
    const reader = new FileReader()
    reader.onload = (ev) => {
      setImagePreview(ev.target.result)
      setStep(2)
    }
    reader.readAsDataURL(file)
  }

  const handleGenerate = async () => {
    if (quotaReached) return
    setLoading(true)

    if (ANTHROPIC_KEY && imagePreview) {
      const base64    = imagePreview.split(',')[1]
      const mediaType = imagePreview.split(';')[0].split(':')[1] || 'image/jpeg'

      const prompt = `Tu es Chef, expert en marketing pour restaurants.

Restaurant : ${restaurantName || 'ce restaurant'}

Regarde cette photo et génère une légende authentique + hashtags viraux pour Instagram/TikTok.

Réponds UNIQUEMENT en JSON valide :
{
  "caption": "légende avec emojis, 2-3 phrases max, ton chaleureux et authentique",
  "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5", "#tag6", "#tag7", "#tag8", "#tag9", "#tag10"]
}

Mix hashtags : 50% populaires food/resto + 50% de niche (cuisine spécifique, ville, moment).`

      try {
        const res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': ANTHROPIC_KEY,
            'anthropic-version': '2023-06-01',
            'anthropic-dangerous-direct-browser-access': 'true',
          },
          body: JSON.stringify({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 500,
            messages: [{
              role: 'user',
              content: [
                { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64 } },
                { type: 'text', text: prompt },
              ],
            }],
          }),
        })
        const data   = await res.json()
        const text   = data.content?.[0]?.text || ''
        const match  = text.match(/\{[\s\S]*\}/)
        const parsed = JSON.parse(match ? match[0] : text)
        setCaption(parsed.caption)
        setHashtags(parsed.hashtags)
      } catch {
        setCaption(generateCaption(restaurantName))
        setHashtags(HASHTAGS)
      }
    } else {
      await new Promise((r) => setTimeout(r, 2000))
      setCaption(generateCaption(restaurantName))
      setHashtags(HASHTAGS)
    }

    incrementCaptionUsed()
    setLoading(false)
    setStep(3)
  }

  const handleCopyAll = () => {
    const text = `${caption}\n\n${hashtags.join(' ')}`
    navigator.clipboard?.writeText(text)
    toast('Légende et hashtags copiés \u2713')
  }

  const handleSchedule = () => {
    onClose()
    navigate('/app/calendar')
  }

  const handleClose = () => {
    setStep(1)
    setImage(null)
    setImagePreview(null)
    setCaption('')
    setHashtags([])
    setLoading(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop (desktop) */}
      <div
        className="hidden md:block fixed inset-0 bg-black/40"
        onClick={handleClose}
      />

      {/* Panel */}
      <div className="fixed inset-0 md:relative md:inset-auto md:max-w-md md:w-full bg-white md:rounded-card md:shadow-xl md:border md:border-pc-border md:max-h-[90vh] md:overflow-y-auto flex flex-col z-50">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <h2 className="text-[17px] font-black tracking-[-0.03em] text-pc-ink">
            Capture rapide
          </h2>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-pc-bg transition-colors"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="#999"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M4 4l8 8M12 4l-8 8" />
            </svg>
          </button>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center justify-center gap-2 pb-4">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`w-2 h-2 rounded-full transition-all ${
                s === step
                  ? 'bg-pc-green w-5'
                  : s < step
                    ? 'bg-pc-green'
                    : 'bg-pc-border'
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 px-5 pb-5 overflow-y-auto">
          {/* ── Step 1: Photo ─────────────────────────────────────── */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="bg-pc-bg border-2 border-dashed border-pc-border rounded-card flex flex-col items-center justify-center py-16">
                <div className="text-[48px] mb-4">{'\u{1F4F7}'}</div>
                <div className="text-[15px] font-bold text-pc-ink mb-1">
                  Ajoute une photo
                </div>
                <div className="text-[12px] text-pc-ink-4">
                  Photo de ton plat, ta cuisine, ton équipe
                </div>
              </div>

              <button
                onClick={() => cameraInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 bg-pc-green text-white font-bold text-[13px] py-[11px] rounded-btn hover:bg-pc-green-dark transition-colors"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4.5 2L3.5 3.5H1.5a1 1 0 00-1 1v7a1 1 0 001 1h11a1 1 0 001-1v-7a1 1 0 00-1-1h-2L9.5 2h-5z" />
                  <circle cx="7" cy="7.5" r="2.5" />
                </svg>
                Prendre une photo
              </button>
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleImageSelect}
              />

              <button
                onClick={() => galleryInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 bg-pc-bg border border-pc-border text-pc-ink font-bold text-[13px] py-[11px] rounded-btn hover:bg-pc-surface transition-colors"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="1" y="2" width="12" height="10" rx="1" />
                  <circle cx="4.5" cy="5.5" r="1" />
                  <path d="M13 9l-3.5-3.5L4 11" />
                </svg>
                Choisir depuis la galerie
              </button>
              <input
                ref={galleryInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageSelect}
              />
            </div>
          )}

          {/* ── Step 2: Generate ──────────────────────────────────── */}
          {step === 2 && (
            <div className="space-y-4">
              {imagePreview && (
                <div className="rounded-card overflow-hidden border border-pc-border">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-56 object-cover"
                  />
                </div>
              )}

              {!loading ? (
                <div className="space-y-[6px]">
                  <button
                    onClick={handleGenerate}
                    disabled={quotaReached}
                    className={`w-full flex items-center justify-center gap-2 font-bold text-[13px] py-[11px] rounded-btn transition-colors
                      ${quotaReached
                        ? 'bg-pc-bg border border-pc-border text-pc-ink-3 cursor-not-allowed'
                        : 'bg-pc-green text-white hover:bg-pc-green-dark'}`}
                  >
                    {quotaReached ? 'Quota atteint' : (
                      <>
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                          <path d="M6 1v10M1 6h10" />
                        </svg>
                        Générer la légende
                      </>
                    )}
                  </button>
                  {quotaReached ? (
                    <p className="text-[11px] text-pc-ink-4 text-center">
                      {monthlyMax} légendes ce mois — reset le 1er
                    </p>
                  ) : remaining !== null && (
                    <p className="text-[11px] text-pc-ink-4 text-center">
                      {remaining} légende{remaining > 1 ? 's' : ''} restante{remaining > 1 ? 's' : ''} ce mois
                    </p>
                  )}
                </div>
              ) : (
                <div className="bg-pc-surface border border-pc-border rounded-card px-5 py-8 text-center">
                  <div
                    className="w-10 h-10 rounded-full mx-auto mb-4 animate-spin"
                    style={{ border: '2px solid #E8E8E6', borderTopColor: '#1D9E75' }}
                  />
                  <div className="text-[14px] font-bold text-pc-ink">
                    Création de la légende...
                  </div>
                  <div className="text-[12px] text-pc-ink-4 mt-1">
                    Analyse de la photo en cours
                  </div>
                </div>
              )}

              <button
                onClick={() => {
                  setStep(1)
                  setImage(null)
                  setImagePreview(null)
                }}
                className="w-full text-center text-[12px] font-semibold text-pc-ink-3 hover:text-pc-ink transition-colors"
              >
                Changer de photo
              </button>
            </div>
          )}

          {/* ── Step 3: Result ────────────────────────────────────── */}
          {step === 3 && (
            <div className="space-y-4">
              {/* Small photo preview */}
              {imagePreview && (
                <div className="rounded-elem overflow-hidden border border-pc-border w-24 h-24">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Caption */}
              <div>
                <p className="pc-section-label mb-2">Légende</p>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  rows={4}
                  className="w-full bg-pc-bg border border-pc-border rounded-elem px-4 py-3 text-[13px] text-pc-ink leading-[1.65] resize-none focus:outline-none focus:border-pc-green transition-colors"
                />
              </div>

              {/* Hashtags */}
              <div>
                <p className="pc-section-label mb-2">Hashtags</p>
                <div className="flex flex-wrap gap-[6px]">
                  {hashtags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[11px] font-semibold bg-pc-green-light text-pc-green border border-pc-green/20 px-[10px] py-[4px] rounded-[6px]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={handleCopyAll}
                  className="w-full flex items-center justify-center gap-2 bg-pc-ink text-white font-bold text-[13px] py-[11px] rounded-btn hover:bg-pc-ink-2 transition-colors"
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="4" y="4" width="7" height="7" rx="1" />
                    <path d="M8 4V2a1 1 0 00-1-1H2a1 1 0 00-1 1v5a1 1 0 001 1h2" />
                  </svg>
                  Copier tout
                </button>
                <button
                  onClick={handleSchedule}
                  className="w-full flex items-center justify-center gap-2 bg-pc-green text-white font-bold text-[13px] py-[11px] rounded-btn hover:bg-pc-green-dark transition-colors"
                >
                  <svg
                    width="11"
                    height="11"
                    viewBox="0 0 11 11"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  >
                    <rect x="1" y="2" width="9" height="8" rx="1" />
                    <path d="M3.5 1v2M7.5 1v2M1 5h9" />
                  </svg>
                  Planifier
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
