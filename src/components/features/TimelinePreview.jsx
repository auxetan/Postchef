import { useMemo } from 'react'
import { motion } from 'framer-motion'

const MUSIC_LABELS = {
  warm_upbeat:   'Warm & Upbeat',
  energetic:     'Énergique',
  chill_ambient: 'Chill Ambient',
  asmr_natural:  'Sons naturels',
}

/**
 * Affiche une timeline visuelle du montage avant le render.
 * - Clips ordonnés avec durées proportionnelles
 * - Overlays texte positionnés comme des badges
 * - B-roll IA inséré visuellement
 * - Preview kinetic caption animée (si caption_style === 'kinetic')
 */
export default function TimelinePreview({ directive, clips, clipOrder, captionStyle }) {
  const totalDuration = directive?.total_duration || 1

  // Blocs de clips + B-roll ordonnés selon clip_order
  const segments = useMemo(() => {
    if (!directive) return []
    const order = clipOrder || directive?.clip_order || clips.map((_, i) => i + 1)
    const enabledBroll = (directive.b_roll_slots || []).filter((s) => s.enabled)
    const result = []

    order.forEach((n, idx) => {
      const clip = clips[n - 1]
      if (!clip) return
      const clipIdx = n - 1
      const trim = directive?.clip_trims?.find((t) => t.clip_index === clipIdx)
      const start = trim?.start ?? 0
      const end = trim?.end ?? clip.duration
      result.push({
        type: 'clip',
        thumbnail: clip.thumbnail,
        duration: end - start,
        label: `${idx + 1}`,
      })
      // Insérer B-rolls positionnés après ce clip
      enabledBroll
        .filter((b) => b.after_clip === clipIdx)
        .forEach((b) => {
          result.push({
            type: 'broll',
            thumbnail: b.imageUrl,
            duration: b.duration || 1.5,
            label: 'AI',
          })
        })
    })
    return result
  }, [directive, clips, clipOrder])

  const totalWithBroll = segments.reduce((s, seg) => s + seg.duration, 0) || totalDuration

  if (!directive) return null

  return (
    <div className="bg-pc-surface border border-pc-border rounded-card px-5 py-5">
      <div className="flex items-center justify-between mb-4">
        <span className="pc-section-label">Preview du montage</span>
        <span className="text-[12px] font-semibold text-pc-ink">
          {totalWithBroll.toFixed(1)}s total
        </span>
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

          {/* Barre de timeline avec les segments (clips + b-rolls) */}
          <div className="flex gap-0.5 h-16 relative">
            {segments.map((seg, index) => {
              const widthPct = (seg.duration / totalWithBroll) * 100
              return (
                <div
                  key={index}
                  className={`relative rounded-btn overflow-hidden flex-shrink-0 ${
                    seg.type === 'broll' ? 'ring-2 ring-pc-green ring-offset-1' : ''
                  }`}
                  style={{ width: `${widthPct}%`, minWidth: 32 }}
                >
                  {seg.thumbnail ? (
                    <img src={seg.thumbnail} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-pc-bg flex items-center justify-center">
                      <span className="text-[14px]">🎞️</span>
                    </div>
                  )}
                  {seg.type === 'broll' && (
                    <div className="absolute top-1 right-1 bg-pc-green text-white text-[8px] font-black px-1 py-px rounded-[3px]">
                      AI
                    </div>
                  )}
                  {/* Durée */}
                  <div className="absolute bottom-1 left-1 bg-black/70 text-white text-[10px] font-semibold px-1 py-px rounded-[3px]">
                    {seg.duration.toFixed(1)}s
                  </div>
                </div>
              )
            })}
          </div>

          {/* Kinetic caption preview animée */}
          {captionStyle === 'kinetic' && directive.hook_text && (
            <div className="mt-3 h-8 bg-black rounded-btn flex items-center justify-center overflow-hidden relative">
              <KineticWordsLoop text={directive.hook_text} />
            </div>
          )}

          {/* Règle temporelle */}
          <div className="relative h-4 mt-1">
            {[0, 0.25, 0.5, 0.75, 1].map((pct) => (
              <div
                key={pct}
                className="absolute top-0 text-[9px] text-pc-ink-4"
                style={{ left: `${pct * 100}%`, transform: 'translateX(-50%)' }}
              >
                {(pct * totalWithBroll).toFixed(0)}s
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

/** Boucle mot par mot animée — évoque la preview kinetic */
function KineticWordsLoop({ text }) {
  const words = text.split(/\s+/).filter(Boolean)
  if (!words.length) return null
  return (
    <div className="flex gap-1">
      {words.map((w, i) => (
        <motion.span
          key={i}
          animate={{
            opacity: [0.2, 1, 1, 0.2],
            scale: [0.9, 1.1, 1, 0.9],
          }}
          transition={{
            duration: words.length * 0.35,
            times: [i / words.length, (i + 0.3) / words.length, (i + 0.7) / words.length, (i + 1) / words.length],
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="text-white text-[11px] font-black uppercase tracking-tight"
        >
          {w}
        </motion.span>
      ))}
    </div>
  )
}
