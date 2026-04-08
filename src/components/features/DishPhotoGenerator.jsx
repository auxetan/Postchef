/**
 * DishPhotoGenerator — génère des photos de plats via IA.
 *
 * API d'image : brancher VITE_OPENAI_KEY pour DALL-E 3
 * ou VITE_STABILITY_KEY pour Stable Diffusion.
 * Sans clé → génère un prompt professionnel à copier-coller dans Midjourney/ChatGPT.
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAppStore from '../../store/useAppStore.js'
import useToastStore from '../../store/useToastStore.js'
import { getFeature } from '../../utils/plans.js'

const STYLES = [
  { id: 'overhead', label: 'Vue du dessus', desc: 'Flat lay, fond bois' },
  { id: 'side', label: 'Vue de côté', desc: 'Angle 45°, profondeur' },
  { id: 'close', label: 'Gros plan', desc: 'Détail textures, bokeh' },
  { id: 'scene', label: 'En situation', desc: 'Table dressée, ambiance' },
]

const MOODS = ['Lumière naturelle', 'Studio', 'Sombre & Intense', 'Été / Terrasse']

function buildPrompt(dish, style, mood, restaurantName) {
  return `Professional food photography of ${dish}, ${style === 'overhead' ? 'overhead flat lay' : style === 'side' ? '45-degree angle shot' : style === 'close' ? 'extreme close-up macro' : 'restaurant table setting scene'}, ${mood === 'Lumière naturelle' ? 'natural window light, soft shadows' : mood === 'Studio' ? 'clean studio lighting, white background' : mood === 'Sombre & Intense' ? 'dark moody lighting, dramatic shadows' : 'golden hour outdoor light, summer terrace'}, restaurant quality, appetizing, award-winning food photography, 8K, hyperrealistic${restaurantName ? `, for ${restaurantName}` : ''}`
}

export default function DishPhotoGenerator({ restaurantName, menuDishes = [] }) {
  const [dish, setDish] = useState('')
  const [style, setStyle] = useState('overhead')
  const [mood, setMood] = useState('Lumière naturelle')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null) // { type: 'image'|'prompt', value: string }
  const [showPrompt, setShowPrompt] = useState(false)

  const navigate = useNavigate()
  const toast    = useToastStore((s) => s.toast)
  const plan                    = useAppStore((s) => s.user.plan)
  const dishPhotoUsed           = useAppStore((s) => s.usage.dishPhotoUsedThisMonth ?? 0)
  const incrementDishPhotoUsed  = useAppStore((s) => s.incrementDishPhotoUsed)

  const OPENAI_KEY  = import.meta.env.VITE_OPENAI_KEY
  const monthlyMax  = getFeature(plan, 'dishPhotoPerMonth') // 0 | 30 | Infinity
  const isRealDalle = !!OPENAI_KEY && monthlyMax > 0
  // Quota atteint uniquement si c'est un vrai appel DALL-E (pas les prompts texte)
  const dalleQuotaReached = isRealDalle && monthlyMax !== Infinity && dishPhotoUsed >= monthlyMax

  const generate = async () => {
    if (!dish.trim()) return
    if (dalleQuotaReached) return
    setLoading(true)
    setResult(null)

    const prompt = buildPrompt(dish, style, mood, restaurantName)

    if (OPENAI_KEY && monthlyMax > 0) {
      try {
        const res = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${OPENAI_KEY}` },
          body: JSON.stringify({ model: 'dall-e-3', prompt, n: 1, size: '1024x1024', quality: 'standard' }),
        })
        const data = await res.json()
        incrementDishPhotoUsed()
        setResult({ type: 'image', value: data.data[0].url })
      } catch {
        setResult({ type: 'prompt', value: prompt })
      }
    } else {
      await new Promise((r) => setTimeout(r, 1000))
      setResult({ type: 'prompt', value: prompt })
    }
    setLoading(false)
  }

  return (
    <div className="bg-pc-surface rounded-card border border-pc-border overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-pc-border flex items-center gap-3">
        <div className="w-8 h-8 rounded-[10px] bg-pc-green-light flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#1D9E75" strokeWidth="1.8" strokeLinecap="round">
            <rect x="1" y="3" width="14" height="11" rx="2" />
            <circle cx="5.5" cy="7.5" r="1.5" />
            <path d="M15 10l-3-3-4 4-2-2-3 3" />
          </svg>
        </div>
        <div>
          <div className="text-[13px] font-bold text-pc-ink">Générer une photo de plat</div>
          <div className="text-[11px] text-pc-ink-4">IA · Qualité professionnelle</div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Dish input */}
        <div>
          <label className="text-[11px] font-semibold text-pc-ink-4 uppercase tracking-caps mb-2 block">Nom du plat</label>
          <input
            value={dish}
            onChange={(e) => setDish(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && generate()}
            placeholder="Ex : Pasta carbonara maison"
            className="w-full border border-pc-border rounded-elem px-4 py-[10px] text-[14px] text-pc-ink placeholder:text-pc-ink-4 focus:outline-none focus:border-pc-green focus:ring-2 focus:ring-pc-green/20 transition-all"
          />
          {menuDishes.length > 0 && (
            <div className="flex flex-wrap gap-[5px] mt-2">
              {menuDishes.map((d) => (
                <button
                  key={d}
                  onClick={() => setDish(d)}
                  className={`text-[11px] px-2 py-[3px] rounded-pill border transition-all ${dish === d ? 'bg-pc-green text-white border-pc-green' : 'bg-pc-bg text-pc-ink-3 border-pc-border hover:border-pc-green-mid'}`}
                >
                  {d}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Style */}
        <div>
          <label className="text-[11px] font-semibold text-pc-ink-4 uppercase tracking-caps mb-2 block">Style de prise de vue</label>
          <div className="grid grid-cols-2 gap-2">
            {STYLES.map((s) => (
              <button
                key={s.id}
                onClick={() => setStyle(s.id)}
                className={`rounded-elem border-[1.5px] px-3 py-[10px] text-left transition-all
                  ${style === s.id ? 'border-pc-green bg-pc-green-light' : 'border-pc-border bg-pc-bg hover:border-pc-green-mid'}`}
              >
                <div className={`text-[12px] font-semibold ${style === s.id ? 'text-pc-green-dark' : 'text-pc-ink'}`}>{s.label}</div>
                <div className="text-[10px] text-pc-ink-4 mt-[1px]">{s.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Mood */}
        <div>
          <label className="text-[11px] font-semibold text-pc-ink-4 uppercase tracking-caps mb-2 block">Ambiance lumineuse</label>
          <div className="flex flex-wrap gap-2">
            {MOODS.map((m) => (
              <button
                key={m}
                onClick={() => setMood(m)}
                className={`px-3 py-[7px] rounded-pill border-[1.5px] text-[12px] font-medium transition-all
                  ${mood === m ? 'bg-pc-green text-white border-pc-green' : 'bg-pc-bg text-pc-ink-2 border-pc-border hover:border-pc-green-mid'}`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Quota restant (Pro Annual avec DALL-E) */}
        {isRealDalle && monthlyMax !== Infinity && (
          <div className={`flex items-center justify-between text-[11px] font-medium px-1
            ${dalleQuotaReached ? 'text-[#ef4444]' : 'text-pc-ink-4'}`}>
            <span>{dishPhotoUsed}/{monthlyMax} photos ce mois</span>
            {dalleQuotaReached && (
              <button onClick={() => navigate('/app/account')} className="font-bold text-pc-green underline">
                Voir le plan
              </button>
            )}
          </div>
        )}

        {/* Generate button */}
        <button
          onClick={generate}
          disabled={!dish.trim() || loading || dalleQuotaReached}
          className="w-full bg-pc-green text-white font-bold text-[14px] py-[12px] rounded-btn hover:bg-pc-green-dark transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <span
                className="w-4 h-4 rounded-full animate-spin"
                style={{ border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff' }}
              />
              Génération en cours...
            </>
          ) : (
            <>
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M7.5 1L9.5 5.5H14L10.5 8.5 12 13.5 7.5 10.5 3 13.5 4.5 8.5 1 5.5H5.5Z" />
              </svg>
              Générer la photo
            </>
          )}
        </button>

        {!import.meta.env.VITE_OPENAI_KEY && (
          <div className="text-[11px] text-pc-ink-4 text-center">
            Sans clé OpenAI → génère un prompt Midjourney/ChatGPT
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="border border-pc-border rounded-elem overflow-hidden">
            {result.type === 'image' ? (
              <div>
                <img src={result.value} alt={dish} className="w-full aspect-square object-cover" />
                <div className="px-3 py-2 flex gap-2">
                  <a
                    href={result.value}
                    download={`${dish.replace(/\s+/g, '_')}.png`}
                    className="flex-1 text-center text-[12px] font-bold text-pc-green border border-pc-green rounded-btn py-[7px] hover:bg-pc-green hover:text-white transition-colors"
                  >
                    Télécharger
                  </a>
                  <button
                    onClick={() => generate()}
                    className="flex-1 text-[12px] font-bold text-white bg-pc-green rounded-btn py-[7px] hover:bg-pc-green-dark transition-colors"
                  >
                    Regénérer
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-[12px] font-bold text-pc-ink">Prompt prêt à copier</div>
                  <button
                    onClick={() => setShowPrompt(!showPrompt)}
                    className="text-[11px] text-pc-green font-semibold"
                  >
                    {showPrompt ? 'Masquer' : 'Voir'}
                  </button>
                </div>
                <div className="text-[11px] text-pc-ink-3 mb-3 leading-[1.5]">
                  Colle ce prompt dans <strong>ChatGPT (DALL-E)</strong>, <strong>Midjourney</strong> ou <strong>Adobe Firefly</strong> pour obtenir ta photo.
                </div>
                {showPrompt && (
                  <div className="bg-pc-bg rounded-[10px] px-3 py-2 text-[11px] text-pc-ink font-mono leading-[1.6] mb-2">
                    {result.value}
                  </div>
                )}
                <button
                  onClick={() => { navigator.clipboard?.writeText(result.value); toast('Prompt copié ✓') }}
                  className="w-full text-[12px] font-bold text-white bg-pc-green rounded-btn py-[9px] hover:bg-pc-green-dark transition-colors flex items-center justify-center gap-2"
                >
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <rect x="4" y="4" width="8" height="8" rx="1.5" />
                    <path d="M9 4V2.5A1.5 1.5 0 007.5 1H2.5A1.5 1.5 0 001 2.5v5A1.5 1.5 0 002.5 9H4" />
                  </svg>
                  Copier le prompt
                </button>
                <div className="mt-2 text-center">
                  <a
                    href="https://chat.openai.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-pc-green font-semibold hover:underline"
                  >
                    Ouvrir ChatGPT →
                  </a>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
