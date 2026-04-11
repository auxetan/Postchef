import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import useAppStore from '../../store/useAppStore'
import useToastStore from '../../store/useToastStore'

export default function VideoRenderStatus({ onNewVideo }) {
  const renderStatus = useAppStore((s) => s.studio.renderStatus)
  const renderUrl    = useAppStore((s) => s.studio.renderUrl)
  const directive    = useAppStore((s) => s.studio.directive)
  const addPost      = useAppStore((s) => s.addPost)
  const addReel      = useAppStore((s) => s.addReel)
  const toast        = useToastStore((s) => s.toast)
  const reelSavedRef = useRef(false)
  // Polling géré dans useShotstack — rien à faire ici.

  // Sauvegarde automatique dans l'historique quand le render est terminé
  useEffect(() => {
    if (renderStatus === 'done' && renderUrl && directive && !reelSavedRef.current) {
      reelSavedRef.current = true
      addReel({
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        videoUrl: renderUrl,
        directive: {
          hook_text: directive.hook_text,
          template: directive.template,
          virality_score: directive.virality_score,
          caption: directive.caption,
          hashtags: directive.hashtags,
        },
        platform: 'Instagram',
        status: 'ready',
      })
    }
  }, [renderStatus, renderUrl, directive, addReel])

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
    toast('Ajouté au calendrier')
  }

  const handleShare = async () => {
    if (navigator.share && navigator.canShare) {
      try {
        const response = await fetch(renderUrl)
        const blob = await response.blob()
        const file = new File([blob], 'postchef-reel.mp4', { type: 'video/mp4' })

        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: directive?.hook_text || 'Mon Reel PostChef',
            files: [file],
          })
          toast('Partagé !')
          return
        }
      } catch (e) {
        if (e.name === 'AbortError') return
      }
    }
    // Fallback : copier l'URL
    navigator.clipboard.writeText(renderUrl)
    toast('Lien copié')
  }

  // ─── En attente ───
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

  // ─── Rendu en cours ───
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
        {/* Barre de progression animée */}
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

  // ─── Erreur ───
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

  // ─── Terminé ───
  if (renderStatus === 'done' && renderUrl) {
    return (
      <div className="space-y-3">
        {/* Lecteur vidéo */}
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

        {/* Score de viralité */}
        {directive && (
          <div className="bg-pc-surface border border-pc-border rounded-card px-5 py-4 flex items-center justify-between">
            <span className="text-[12px] font-semibold text-pc-ink-3">
              Score de viralité
            </span>
            <span
              className={`text-[20px] font-[800] ${
                directive.virality_score > 80
                  ? 'text-pc-green'
                  : directive.virality_score >= 60
                    ? 'text-[#D97706]'
                    : 'text-pc-ink-3'
              }`}
            >
              {directive.virality_score}
            </span>
          </div>
        )}

        {/* Boutons d'action */}
        <div className="space-y-2">
          <a
            href={renderUrl}
            download="postchef-reel.mp4"
            className="block w-full py-[11px] rounded-btn text-[13px] font-bold text-white bg-pc-green hover:bg-pc-green-dark text-center transition-colors"
          >
            Télécharger le Reel
          </a>

          <button
            onClick={handleShare}
            className="w-full py-[11px] rounded-btn text-[13px] font-bold text-white bg-pc-ink hover:bg-pc-ink-2 transition-colors"
          >
            Partager
          </button>

          {directive?.caption && (
            <button
              onClick={() => {
                navigator.clipboard.writeText(directive.caption)
                toast('Caption copié')
              }}
              className="w-full py-[11px] rounded-btn text-[13px] font-bold text-pc-ink bg-pc-surface border border-pc-border hover:bg-pc-bg transition-colors"
            >
              Copier la caption
            </button>
          )}

          {directive?.hashtags?.length > 0 && (
            <button
              onClick={() => {
                navigator.clipboard.writeText(directive.hashtags.join(' '))
                toast('Hashtags copiés')
              }}
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

  return null
}
