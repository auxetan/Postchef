import { useState } from 'react'
import useAppStore from '../../store/useAppStore.js'
import useToastStore from '../../store/useToastStore.js'
import OptimalTimeSuggest from '../features/OptimalTimeSuggest.jsx'
import { supabase } from '../../lib/supabaseClient.js'

const PLATFORM_ICONS = {
  Instagram: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
    </svg>
  ),
  TikTok: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 000 12.68 6.34 6.34 0 006.33-6.34V8.69a8.26 8.26 0 004.84 1.55V6.79a4.85 4.85 0 01-1.07-.1z"/>
    </svg>
  ),
  Facebook: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  ),
}

/**
 * Modale de publication / programmation d'un post PostChef via Ayrshare.
 *
 * Props:
 *   post      – objet post PostChef
 *   onClose   – fermer la modale
 *   onSuccess – callback après publication/programmation réussie
 */
export default function PublishModal({ post, onClose, onSuccess }) {
  const socialConnections = useAppStore((s) => s.socialConnections)
  const updatePostStatus  = useAppStore((s) => s.updatePostStatus)
  const updatePost        = useAppStore((s) => s.updatePost)
  const onboarding        = useAppStore((s) => s.onboarding)
  const toast             = useToastStore((s) => s.toast)

  const profileKey    = socialConnections?.profileKey
  const connectedList = socialConnections?.connected || []

  // Plateformes du post (filtrer aux connectées seulement)
  const postPlatforms = post.plateformes || []
  const [selectedPlatforms, setSelectedPlatforms] = useState(
    postPlatforms.filter((p) => connectedList.includes(p))
  )

  const [mode, setMode]         = useState('now')        // 'now' | 'later'
  const [scheduleDate, setScheduleDate] = useState('')   // YYYY-MM-DD
  const [scheduleTime, setScheduleTime] = useState('')   // HH:MM
  const [selectedSlot, setSelectedSlot] = useState(null) // isoDateTime string
  const [loading, setLoading]   = useState(false)

  // Déterminer la plateforme principale pour les suggestions
  const mainPlatform = selectedPlatforms[0] || postPlatforms[0] || 'Instagram'
  const cuisineType  = onboarding?.restaurant?.cuisineTypes?.[0] || ''

  const hasNoConnected = connectedList.length === 0

  function togglePlatform(p) {
    setSelectedPlatforms((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    )
  }

  function handleSlotSelect(isoDateTime) {
    setSelectedSlot(isoDateTime)
    const d = new Date(isoDateTime)
    setScheduleDate(d.toISOString().split('T')[0])
    setScheduleTime(`${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`)
  }

  async function getAuthToken() {
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token || null
  }

  async function handlePublish() {
    if (!profileKey) {
      toast('Connecte d\'abord tes réseaux sociaux dans Compte → Plateformes')
      return
    }
    if (!selectedPlatforms.length) {
      toast('Sélectionne au moins une plateforme')
      return
    }

    setLoading(true)
    try {
      const token = await getAuthToken()
      if (!token) throw new Error('Non authentifié')

      const postPayload = { ...post, plateformes: selectedPlatforms }

      const res = await fetch('/api/ayrshare-publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ post: postPayload, profileKey }),
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data?.error?.message || 'Erreur de publication')
      }

      updatePostStatus(post.id, 'publie')
      toast(`Publié sur ${selectedPlatforms.join(', ')} ✓`)
      onSuccess?.()
      onClose()
    } catch (err) {
      toast(`Erreur : ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  async function handleSchedule() {
    if (!profileKey) {
      toast('Connecte d\'abord tes réseaux sociaux dans Compte → Plateformes')
      return
    }
    if (!selectedPlatforms.length) {
      toast('Sélectionne au moins une plateforme')
      return
    }
    if (!scheduleDate || !scheduleTime) {
      toast('Choisis une date et une heure')
      return
    }

    const isoDateTime = new Date(`${scheduleDate}T${scheduleTime}:00`).toISOString()
    if (new Date(isoDateTime) <= new Date()) {
      toast('La date de programmation doit être dans le futur')
      return
    }

    setLoading(true)
    try {
      const token = await getAuthToken()
      if (!token) throw new Error('Non authentifié')

      const postPayload = { ...post, plateformes: selectedPlatforms }

      const res = await fetch('/api/ayrshare-schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ post: postPayload, profileKey, scheduleDate: isoDateTime }),
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data?.error?.message || 'Erreur de programmation')
      }

      updatePostStatus(post.id, 'programme')
      const formattedDate = new Date(isoDateTime).toLocaleDateString('fr-FR', {
        weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
      })
      toast(`Programmé le ${formattedDate} ✓`)
      onSuccess?.()
      onClose()
    } catch (err) {
      toast(`Erreur : ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 px-4 pb-4 sm:pb-0">
      <div className="bg-pc-surface rounded-card w-full max-w-sm border border-pc-border max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-pc-rule">
          <h3 className="text-[16px] font-black tracking-[-0.03em] text-pc-ink">Publier ce post</h3>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full border border-pc-border flex items-center justify-center text-pc-ink-3 hover:bg-pc-bg transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M1 1l10 10M11 1L1 11" />
            </svg>
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">

          {/* Post preview */}
          <div className="bg-pc-bg rounded-elem px-4 py-3 border border-pc-rule">
            <p className="text-[12px] font-semibold text-pc-ink mb-1">{post.type}</p>
            <p className="text-[11px] text-pc-ink-3 line-clamp-2">{post.description}</p>
          </div>

          {/* Avertissement si pas de compte connecté */}
          {hasNoConnected && (
            <div className="bg-[#fef3c7] border border-[#fde68a] rounded-elem px-4 py-3">
              <p className="text-[12px] font-semibold text-[#92400e] mb-1">Aucun réseau connecté</p>
              <p className="text-[11px] text-[#92400e]/80 leading-relaxed">
                Va dans <strong>Compte → Plateformes</strong> pour connecter Instagram, TikTok ou Facebook.
              </p>
            </div>
          )}

          {/* Sélection des plateformes */}
          <div>
            <p className="text-[10px] font-semibold text-pc-ink-4 uppercase tracking-caps mb-[8px]">
              Publier sur
            </p>
            <div className="flex gap-2 flex-wrap">
              {postPlatforms.map((p) => {
                const isConnected = connectedList.includes(p)
                const isSelected  = selectedPlatforms.includes(p)
                return (
                  <button
                    key={p}
                    type="button"
                    disabled={!isConnected}
                    onClick={() => isConnected && togglePlatform(p)}
                    className={`flex items-center gap-[6px] text-[12px] font-semibold px-3 py-[7px] rounded-pill border transition-all
                      ${isSelected && isConnected
                        ? 'bg-pc-green text-white border-pc-green'
                        : isConnected
                        ? 'bg-pc-bg border-pc-border text-pc-ink-2 hover:border-pc-green hover:text-pc-green'
                        : 'bg-pc-bg border-pc-border text-pc-ink-4 opacity-50 cursor-not-allowed'
                      }`}
                    title={!isConnected ? `${p} non connecté` : ''}
                  >
                    {PLATFORM_ICONS[p]}
                    {p}
                    {!isConnected && (
                      <span className="text-[9px] opacity-70">— non connecté</span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Mode tabs : Maintenant / Programmer */}
          <div className="flex bg-pc-bg border border-pc-border rounded-[10px] p-[3px] gap-[3px]">
            {[
              { key: 'now',   label: 'Maintenant' },
              { key: 'later', label: 'Programmer' },
            ].map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setMode(key)}
                className={`flex-1 py-[8px] rounded-[8px] text-[12px] font-bold transition-all
                  ${mode === key
                    ? 'bg-pc-surface shadow-sm text-pc-ink border border-pc-border'
                    : 'text-pc-ink-4 hover:text-pc-ink-2'
                  }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Mode: Programmer */}
          {mode === 'later' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-semibold text-pc-ink-4 uppercase tracking-caps block mb-[6px]">Date</label>
                  <input
                    type="date"
                    value={scheduleDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => { setScheduleDate(e.target.value); setSelectedSlot(null) }}
                    className="w-full bg-pc-bg border border-pc-border rounded-btn px-3 py-[10px] text-[13px] text-pc-ink focus:outline-none focus:border-pc-ink transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-pc-ink-4 uppercase tracking-caps block mb-[6px]">Heure</label>
                  <input
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => { setScheduleTime(e.target.value); setSelectedSlot(null) }}
                    className="w-full bg-pc-bg border border-pc-border rounded-btn px-3 py-[10px] text-[13px] text-pc-ink focus:outline-none focus:border-pc-ink transition-all"
                  />
                </div>
              </div>

              <OptimalTimeSuggest
                platform={mainPlatform}
                cuisineType={cuisineType}
                selected={selectedSlot}
                onSelect={handleSlotSelect}
              />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-5 pb-5 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-[11px] rounded-btn border border-pc-border text-[13px] font-semibold text-pc-ink-2 hover:bg-pc-bg transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={mode === 'now' ? handlePublish : handleSchedule}
            disabled={loading || !selectedPlatforms.length || hasNoConnected}
            className="flex-1 py-[11px] rounded-btn bg-pc-green text-white text-[13px] font-bold hover:bg-pc-green-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round"/>
                </svg>
                {mode === 'now' ? 'Publication…' : 'Programmation…'}
              </>
            ) : mode === 'now' ? (
              'Publier maintenant'
            ) : (
              'Programmer'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
