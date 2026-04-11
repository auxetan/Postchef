import useAppStore from '../../store/useAppStore'
import useToastStore from '../../store/useToastStore'

/**
 * Historique des Reels créés — grille 2 colonnes mobile / 3 desktop.
 */
export default function ReelHistory() {
  const reels = useAppStore((s) => s.reels)
  const removeReel = useAppStore((s) => s.removeReel)
  const toast = useToastStore((s) => s.toast)

  const copyCaption = (caption) => {
    navigator.clipboard.writeText(caption)
    toast('Caption copié')
  }

  if (reels.length === 0) {
    return (
      <div className="bg-pc-surface border border-pc-border rounded-card px-5 py-10 text-center">
        <div className="text-[36px] mb-3">🎬</div>
        <p className="text-[15px] font-black tracking-[-0.03em] text-pc-ink mb-1">
          Aucun Reel pour l'instant
        </p>
        <p className="text-[13px] text-pc-ink-3">
          Crée ton premier Reel dans l'onglet Créer !
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {reels.map((reel) => {
        const date = new Date(reel.createdAt)
        const dateLabel = date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
        const score = reel.directive?.virality_score
        const scoreColor =
          score > 80 ? 'text-pc-green' : score >= 60 ? 'text-[#D97706]' : 'text-pc-ink-3'

        return (
          <div
            key={reel.id}
            className="bg-pc-surface border border-pc-border rounded-card overflow-hidden"
          >
            {/* Thumbnail vidéo */}
            {reel.videoUrl ? (
              <video
                src={reel.videoUrl}
                preload="none"
                muted
                playsInline
                className="w-full aspect-[9/16] object-cover bg-pc-bg"
              />
            ) : (
              <div className="w-full aspect-[9/16] bg-pc-bg flex items-center justify-center text-[32px]">
                🎬
              </div>
            )}

            {/* Infos */}
            <div className="p-3 space-y-2">
              {/* Hook + score */}
              <div className="flex items-start justify-between gap-1">
                <p className="text-[12px] font-semibold text-pc-ink leading-tight line-clamp-2 flex-1">
                  {reel.directive?.hook_text || 'Reel'}
                </p>
                {score && (
                  <span className={`text-[13px] font-[800] shrink-0 ${scoreColor}`}>
                    {score}
                  </span>
                )}
              </div>

              {/* Date */}
              <p className="text-[11px] text-pc-ink-4">{dateLabel}</p>

              {/* Actions */}
              <div className="flex gap-1.5">
                {reel.videoUrl && (
                  <a
                    href={reel.videoUrl}
                    download="postchef-reel.mp4"
                    className="flex-1 py-[7px] rounded-btn text-[11px] font-bold text-white bg-pc-green hover:bg-pc-green-dark text-center transition-colors"
                  >
                    DL
                  </a>
                )}
                {reel.directive?.caption && (
                  <button
                    onClick={() => copyCaption(reel.directive.caption)}
                    className="flex-1 py-[7px] rounded-btn text-[11px] font-bold text-pc-ink bg-pc-surface border border-pc-border hover:bg-pc-bg transition-colors"
                  >
                    Caption
                  </button>
                )}
                <button
                  onClick={() => removeReel(reel.id)}
                  className="w-8 py-[7px] rounded-btn text-[11px] text-pc-ink-4 bg-pc-surface border border-pc-border hover:bg-pc-bg transition-colors"
                >
                  {'\u2715'}
                </button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
