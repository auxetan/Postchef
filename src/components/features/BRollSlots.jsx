/**
 * BRollSlots — B-roll vidéo entre les clips
 * Stratégie : Pexels stock video → fallback DALL-E image statique → prompt à copier
 */
import { useState } from 'react'
import useAppStore from '../../store/useAppStore'
import useToastStore from '../../store/useToastStore'
import { searchStockVideo } from '../../utils/pexels'

async function generateDalleImage(prompt) {
  const KEY = import.meta.env.VITE_OPENAI_KEY
  if (!KEY) return null
  const res = await fetch('https://api.openai.com/v1/images/generations', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${KEY}` },
    body:    JSON.stringify({ model: 'dall-e-3', prompt, n: 1, size: '1024x1792', quality: 'standard' }),
  })
  if (!res.ok) return null
  const data = await res.json()
  return data.data[0].url
}

export default function BRollSlots({ slots }) {
  const directive    = useAppStore((s) => s.studio.directive)
  const setDirective = useAppStore((s) => s.setDirective)
  const toast        = useToastStore((s) => s.toast)
  const [loadingIdx, setLoadingIdx] = useState(null)

  if (!slots?.length) return null

  const updateSlots = (updated) => setDirective({ ...directive, b_roll_slots: updated })

  const handleFetch = async (slot, i) => {
    setLoadingIdx(i)
    try {
      // 1. Pexels stock video
      const results = await searchStockVideo(slot.prompt.slice(0, 80), 3)
      if (results.length > 0) {
        const best    = results[0]
        const updated = [...slots]
        updated[i]    = { ...slot, videoUrl: best.url, duration: Math.min(slot.duration || 1.5, best.duration), source: 'pexels', enabled: true }
        updateSlots(updated)
        toast('B-roll vidéo trouvé (Pexels)', 'success')
        setLoadingIdx(null)
        return
      }

      // 2. Fallback DALL-E image
      const imageUrl = await generateDalleImage(slot.prompt)
      if (imageUrl) {
        const updated = [...slots]
        updated[i]    = { ...slot, imageUrl, source: 'dalle', enabled: true }
        updateSlots(updated)
        toast('B-roll image générée (DALL-E)', 'success')
        setLoadingIdx(null)
        return
      }

      // 3. Aucune clé — prompt à copier
      navigator.clipboard?.writeText(slot.prompt)
      toast('Prompt copié — colle dans Midjourney/ChatGPT', 'info')
    } catch (e) {
      console.warn('[broll]', e)
      toast('Génération impossible', 'error')
    }
    setLoadingIdx(null)
  }

  const toggleSlot = (i) => {
    const updated = [...slots]
    updated[i]    = { ...updated[i], enabled: !updated[i].enabled }
    updateSlots(updated)
  }

  const hasMedia = (slot) => slot.videoUrl || slot.imageUrl

  return (
    <div className="bg-pc-surface border border-pc-border rounded-card px-5 py-5">
      <div className="flex items-center justify-between mb-3">
        <div className="pc-section-label">B-roll suggéré</div>
        <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-pc-green">
          Pexels · DALL-E
        </span>
      </div>
      <p className="text-[11px] text-pc-ink-4 mb-3 leading-snug">
        Plans d'ambiance insérés entre tes clips pour booster le rythme.
      </p>
      <div className="space-y-2">
        {slots.map((slot, i) => {
          const loading   = loadingIdx === i
          const mediaReady = hasMedia(slot)

          return (
            <div
              key={i}
              className={`flex items-center gap-3 p-2 rounded-btn border transition-colors ${
                slot.enabled ? 'bg-pc-green/5 border-pc-green' : 'bg-pc-bg border-pc-border'
              }`}
            >
              {/* Thumbnail */}
              <div className="w-10 h-16 rounded-[5px] overflow-hidden bg-pc-border flex items-center justify-center shrink-0">
                {slot.imageUrl
                  ? <img src={slot.imageUrl} alt="" className="w-full h-full object-cover" />
                  : slot.videoUrl
                    ? <video src={slot.videoUrl} muted playsInline className="w-full h-full object-cover" />
                    : <span className="text-[18px]">🎞️</span>
                }
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[12px] font-semibold text-pc-ink truncate">
                    {slot.label || slot.purpose?.replace(/_/g, ' ') || 'B-roll'}
                  </span>
                  {slot.source && (
                    <span className={`text-[9px] font-bold px-1 py-px rounded-[3px] shrink-0 ${
                      slot.source === 'pexels' ? 'bg-[#07a081]/15 text-[#07a081]' : 'bg-pc-green/15 text-pc-green'
                    }`}>
                      {slot.source === 'pexels' ? 'Pexels' : 'AI'}
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-pc-ink-4">
                  Après clip {slot.after_clip + 1} · {(slot.duration || 1.5).toFixed(1)}s
                </div>
                {!mediaReady && (
                  <div className="text-[10px] text-pc-ink-3 truncate italic">{slot.prompt}</div>
                )}
              </div>

              {mediaReady ? (
                <button
                  onClick={() => toggleSlot(i)}
                  className={`text-[10px] font-bold px-2 py-1 rounded-[5px] transition-colors shrink-0 ${
                    slot.enabled ? 'bg-pc-green text-white' : 'bg-pc-border text-pc-ink-3 hover:bg-pc-rule'
                  }`}
                >
                  {slot.enabled ? '✓ Inclus' : 'Activer'}
                </button>
              ) : (
                <button
                  onClick={() => handleFetch(slot, i)}
                  disabled={loading}
                  className="text-[10px] font-bold px-2 py-1 rounded-[5px] bg-pc-ink text-white hover:bg-pc-ink-2 transition-colors shrink-0 disabled:opacity-50"
                >
                  {loading ? '…' : 'Trouver'}
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
