import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import useAppStore from '../../store/useAppStore'
import { useCreatomate } from '../../hooks/useCreatomate'

export default function VideoRenderStatus({ onNewVideo }) {
  const renderStatus = useAppStore((s) => s.studio.renderStatus)
  const renderUrl = useAppStore((s) => s.studio.renderUrl)
  const renderId = useAppStore((s) => s.studio.renderId)
  const directive = useAppStore((s) => s.studio.directive)
  const addPost = useAppStore((s) => s.addPost)
  const { pollRender } = useCreatomate()
  const intervalRef = useRef(null)

  // Polling — pollRender is stable via useCallback
  useEffect(() => {
    if (renderId && renderStatus === 'rendering') {
      intervalRef.current = setInterval(async () => {
        const status = await pollRender(renderId)
        if (status === 'succeeded' || status === 'failed') {
          clearInterval(intervalRef.current)
        }
      }, 3000)
      return () => clearInterval(intervalRef.current)
    }
  }, [renderId, renderStatus, pollRender])

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
  }

  const handleAddToCalendar = () => {
    if (!directive) return
    const today = new Date()
    const FR_DAYS = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
    const FR_SHORT = ['DIM', 'LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM']
    addPost({
      id: crypto.randomUUID(),
      date: today.toISOString().split('T')[0],
      day: FR_DAYS[today.getDay()],
      dayShort: FR_SHORT[today.getDay()],
      title: directive.hook_text,
      caption: directive.caption,
      platform: 'Instagram',
      type: 'reel',
      status: 'brouillon',
      videoUrl: renderUrl,
    })
  }

  // ─── Pending ───
  if (renderStatus === 'pending') {
    return (
      <div className="bg-pc-surface border border-pc-border rounded-card px-5 py-8 text-center">
        <div className="w-10 h-10 mx-auto mb-4 border-2 border-pc-border border-t-pc-green rounded-full animate-spin" />
        <p className="text-[14px] font-bold text-pc-ink">
          Préparation du rendu...
        </p>
      </div>
    )
  }

  // ─── Rendering ───
  if (renderStatus === 'rendering') {
    return (
      <div className="bg-pc-surface border border-pc-border rounded-card px-5 py-8 text-center">
        <div className="text-[36px] mb-3">🎬</div>
        <p className="text-[14px] font-bold text-pc-ink mb-2">
          Assemblage de ton Reel...
        </p>
        <p className="text-[12px] text-pc-ink-3 mb-4">
          Environ 30 secondes
        </p>
        {/* Animated progress bar */}
        <div className="w-full h-1.5 bg-pc-border rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-pc-green rounded-full"
            initial={{ width: '10%' }}
            animate={{ width: '85%' }}
            transition={{ duration: 25, ease: 'linear' }}
          />
        </div>
      </div>
    )
  }

  // ─── Error ───
  if (renderStatus === 'error') {
    return (
      <div className="bg-pc-surface border border-pc-border rounded-card px-5 py-8 text-center">
        <div className="text-[36px] mb-3">⚠️</div>
        <p className="text-[14px] font-bold text-pc-ink mb-2">
          Erreur lors du rendu
        </p>
        <p className="text-[12px] text-pc-ink-3 mb-4">
          Le rendu a échoué. Réessaie ou crée un nouveau Reel.
        </p>
        <button
          onClick={onNewVideo}
          className="px-6 py-[11px] rounded-btn text-[13px] font-bold bg-pc-ink text-white hover:bg-pc-ink-2 transition-colors"
        >
          Réessayer
        </button>
      </div>
    )
  }

  // ─── Done ───
  if (renderStatus === 'done' && renderUrl) {
    return (
      <div className="space-y-3">
        {/* Video player */}
        <div className="bg-pc-surface border border-pc-border rounded-card overflow-hidden">
          <video
            src={renderUrl}
            controls
            loop
            autoPlay
            muted
            playsInline
            className="w-full max-h-[60vh] mx-auto"
            style={{ aspectRatio: '9/16' }}
          />
        </div>

        {/* Score reminder */}
        {directive && (
          <div className="bg-pc-surface border border-pc-border rounded-card px-5 py-4 flex items-center justify-between">
            <span className="text-[12px] font-semibold text-pc-ink-3">
              Score de viralité
            </span>
            <span
              className="text-[20px] font-[800]"
              style={{
                color:
                  directive.virality_score > 80
                    ? '#1D9E75'
                    : directive.virality_score >= 60
                      ? '#D97706'
                      : '#737373',
              }}
            >
              {directive.virality_score}
            </span>
          </div>
        )}

        {/* Action buttons */}
        <div className="space-y-2">
          <a
            href={renderUrl}
            download="postchef-reel.mp4"
            className="block w-full py-[11px] rounded-btn text-[13px] font-bold text-white bg-pc-green hover:bg-pc-green-dark text-center transition-colors"
          >
            Télécharger le Reel
          </a>

          {directive?.caption && (
            <button
              onClick={() => copyToClipboard(directive.caption)}
              className="w-full py-[11px] rounded-btn text-[13px] font-bold text-pc-ink bg-pc-surface border border-pc-border hover:bg-pc-bg transition-colors"
            >
              Copier la caption
            </button>
          )}

          {directive?.hashtags?.length > 0 && (
            <button
              onClick={() => copyToClipboard(directive.hashtags.join(' '))}
              className="w-full py-[11px] rounded-btn text-[13px] font-bold text-pc-ink bg-pc-surface border border-pc-border hover:bg-pc-bg transition-colors"
            >
              Copier les hashtags
            </button>
          )}

          <button
            onClick={handleAddToCalendar}
            className="w-full py-[11px] rounded-btn text-[13px] font-bold text-pc-green bg-pc-green-light hover:bg-pc-green/15 transition-colors"
          >
            Ajouter au calendrier
          </button>

          <button
            onClick={onNewVideo}
            className="w-full py-[11px] rounded-btn text-[13px] font-semibold text-pc-ink-3 hover:text-pc-ink transition-colors"
          >
            Créer un nouveau Reel
          </button>
        </div>
      </div>
    )
  }

  // Fallback
  return null
}
