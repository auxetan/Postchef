import { useMemo } from 'react'

const MUSIC_LABELS = {
  warm_upbeat:   'Warm & Upbeat',
  energetic:     'Énergique',
  chill_ambient: 'Chill Ambient',
  asmr_natural:  'Sons naturels',
}

/**
 * Affiche une timeline visuelle du montage avant le render.
 * Chaque clip est un bloc proportionnel à sa durée.
 * Les overlays texte sont positionnés comme des badges au-dessus.
 */
export default function TimelinePreview({ directive, clips, clipOrder }) {
  const totalDuration = directive?.total_duration || 1

  // Blocs de clips ordonnés selon clip_order
  const orderedClips = useMemo(() => {
    return (clipOrder || directive?.clip_order || clips.map((_, i) => i + 1))
      .map((n) => clips[n - 1])
      .filter(Boolean)
      .map((clip, i) => {
        const trim = directive?.clip_trims?.find(
          (t) => t.clip_index === clips.indexOf(clip)
        )
        return {
          clip,
          index: i,
          start: trim?.start ?? 0,
          end: trim?.end ?? clip.duration,
          duration: (trim?.end ?? clip.duration) - (trim?.start ?? 0),
        }
      })
  }, [directive, clips, clipOrder])

  if (!directive) return null

  return (
    <div className="bg-pc-surface border border-pc-border rounded-card px-5 py-5">
      <div className="flex items-center justify-between mb-4">
        <span className="pc-section-label">Preview du montage</span>
        <span className="text-[12px] font-semibold text-pc-ink">{totalDuration}s total</span>
      </div>

      {/* Zone scrollable */}
      <div className="overflow-x-auto">
        <div style={{ minWidth: 280 }}>
          {/* Overlays texte positionnés */}
          <div className="relative h-6 mb-1">
            {directive.text_overlays?.map((overlay, i) => {
              const leftPct = (overlay.timing_start / totalDuration) * 100
              const widthPct =
                ((overlay.timing_end - overlay.timing_start) / totalDuration) * 100
              return (
                <div
                  key={i}
                  className="absolute top-0 bg-pc-green-light text-pc-green-dark text-[10px] font-semibold rounded-[5px] px-1.5 py-0.5 truncate"
                  style={{
                    left: `${leftPct}%`,
                    width: `${widthPct}%`,
                    maxWidth: `${widthPct}%`,
                  }}
                  title={overlay.text}
                >
                  {overlay.text}
                </div>
              )
            })}
          </div>

          {/* Barre de timeline avec les clips */}
          <div className="flex gap-0.5 h-16">
            {orderedClips.map(({ clip, index, duration }) => {
              const widthPct = (duration / totalDuration) * 100
              return (
                <div
                  key={index}
                  className="relative rounded-btn overflow-hidden flex-shrink-0"
                  style={{ width: `${widthPct}%`, minWidth: 32 }}
                >
                  {clip.thumbnail ? (
                    <img
                      src={clip.thumbnail}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-pc-bg" />
                  )}
                  {/* Durée */}
                  <div className="absolute bottom-1 left-1 bg-black/70 text-white text-[10px] font-semibold px-1 py-px rounded-[3px]">
                    {duration.toFixed(1)}s
                  </div>
                </div>
              )
            })}
          </div>

          {/* Règle temporelle */}
          <div className="relative h-4 mt-1">
            {[0, 0.25, 0.5, 0.75, 1].map((pct) => (
              <div
                key={pct}
                className="absolute top-0 text-[9px] text-pc-ink-4"
                style={{ left: `${pct * 100}%`, transform: 'translateX(-50%)' }}
              >
                {(pct * totalDuration).toFixed(0)}s
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Musique sélectionnée */}
      {directive.music_mood && (
        <div className="mt-3 flex items-center gap-2">
          <span className="text-[11px]">🎵</span>
          <span className="bg-pc-bg px-2 py-0.5 rounded-[5px] text-[12px] font-medium text-pc-ink">
            {MUSIC_LABELS[directive.music_mood] || directive.music_mood}
          </span>
        </div>
      )}
    </div>
  )
}
