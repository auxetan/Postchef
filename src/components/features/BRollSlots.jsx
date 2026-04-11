/**
 * BRollSlots — B-roll IA insérés entre les clips
 * Chaque slot correspond à une recommandation Claude : un plan manquant,
 * un gros plan, une ambiance. L'utilisateur peut générer l'image IA
 * (DALL-E 3 si clé, sinon prompt à copier).
 */
import { useState } from 'react'
import useAppStore from '../../store/useAppStore'
import useToastStore from '../../store/useToastStore'

async function generateDalleImage(prompt) {
  const OPENAI_KEY = import.meta.env.VITE_OPENAI_KEY
  if (!OPENAI_KEY) return null
  const res = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_KEY}`,
    },
    body: JSON.stringify({
      model: 'dall-e-3',
      prompt,
      n: 1,
      size: '1024x1792', // format portrait 9:16
      quality: 'standard',
    }),
  })
  if (!res.ok) throw new Error('DALL-E error')
  const data = await res.json()
  return data.data[0].url
}

export default function BRollSlots({ slots, onUpdateSlot }) {
  const directive = useAppStore((s) => s.studio.directive)
  const setDirective = useAppStore((s) => s.setDirective)
  const toast = useToastStore((s) => s.toast)
  const [loadingIdx, setLoadingIdx] = useState(null)

  if (!slots?.length) return null

  const handleGenerate = async (slot, i) => {
    setLoadingIdx(i)
    try {
      const imageUrl = await generateDalleImage(slot.prompt)
      if (imageUrl) {
        const updated = [...slots]
        updated[i] = { ...slot, imageUrl, enabled: true }
        setDirective({ ...directive, b_roll_slots: updated })
        onUpdateSlot?.(updated)
        toast('B-roll généré ✓', 'success')
      } else {
        // Pas de clé : copier le prompt
        navigator.clipboard?.writeText(slot.prompt)
        toast('Prompt copié — colle-le dans Midjourney/ChatGPT', 'info')
      }
    } catch {
      toast('Génération impossible', 'error')
    }
    setLoadingIdx(null)
  }

  const toggleSlot = (i) => {
    const updated = [...slots]
    updated[i] = { ...updated[i], enabled: !updated[i].enabled }
    setDirective({ ...directive, b_roll_slots: updated })
    onUpdateSlot?.(updated)
  }

  return (
    <div className="bg-pc-surface border border-pc-border rounded-card px-5 py-5">
      <div className="flex items-center justify-between mb-3">
        <div className="pc-section-label">B-roll IA suggéré</div>
        <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-pc-green">
          AI Generated
        </span>
      </div>
      <p className="text-[11px] text-pc-ink-4 mb-3 leading-snug">
        Plans d'ambiance générés par IA pour booster le rythme entre tes clips.
      </p>
      <div className="space-y-2">
        {slots.map((slot, i) => {
          const loading = loadingIdx === i
          return (
            <div
              key={i}
              className={`flex items-center gap-3 p-2 rounded-btn border transition-colors ${
                slot.enabled
                  ? 'bg-pc-green/5 border-pc-green'
                  : 'bg-pc-bg border-pc-border'
              }`}
            >
              {/* Thumbnail / placeholder */}
              <div className="w-10 h-16 rounded-[5px] overflow-hidden bg-pc-border flex items-center justify-center shrink-0">
                {slot.imageUrl ? (
                  <img src={slot.imageUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[18px]">🎞️</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-semibold text-pc-ink truncate">
                  {slot.label || slot.purpose?.replace(/_/g, ' ') || 'B-roll'}
                </div>
                <div className="text-[10px] text-pc-ink-4">
                  Après clip {slot.after_clip + 1} · {slot.duration?.toFixed(1)}s
                </div>
                <div className="text-[10px] text-pc-ink-3 truncate italic">
                  {slot.prompt}
                </div>
              </div>
              {slot.imageUrl ? (
                <button
                  onClick={() => toggleSlot(i)}
                  className={`text-[10px] font-bold px-2 py-1 rounded-[5px] transition-colors shrink-0 ${
                    slot.enabled
                      ? 'bg-pc-green text-white'
                      : 'bg-pc-border text-pc-ink-3'
                  }`}
                >
                  {slot.enabled ? '✓ Inclus' : 'Activer'}
                </button>
              ) : (
                <button
                  onClick={() => handleGenerate(slot, i)}
                  disabled={loading}
                  className="text-[10px] font-bold px-2 py-1 rounded-[5px] bg-pc-ink text-white hover:bg-pc-ink-2 transition-colors shrink-0 disabled:opacity-50"
                >
                  {loading ? '…' : 'Générer'}
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
