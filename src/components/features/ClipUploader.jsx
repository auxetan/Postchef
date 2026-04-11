import { useState, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import useAppStore from '../../store/useAppStore'

const MAX_CLIPS = 4
const MAX_CLIP_DURATION = 30

function getAnalysisLabel(duration) {
  if (duration < 3) return 'Plan détail'
  if (duration <= 8) return 'Plan principal'
  return 'Séquence longue'
}

/**
 * Capture plusieurs frames d'un fichier vidéo.
 * Retourne un tableau de data URLs JPEG (début, milieu, fin).
 */
function generateFrames(file, count = 3) {
  return new Promise((resolve) => {
    const video = document.createElement('video')
    video.preload = 'metadata'
    video.muted = true
    video.src = URL.createObjectURL(file)

    video.onloadedmetadata = async () => {
      const duration = video.duration
      const times =
        count === 1
          ? [0.5]
          : Array.from({ length: count }, (_, i) =>
              Math.min(0.5 + (i * (duration - 1)) / (count - 1), duration - 0.1)
            )

      const frames = []
      for (const t of times) {
        video.currentTime = t
        await new Promise((r) => {
          video.onseeked = r
        })
        const canvas = document.createElement('canvas')
        canvas.width = 180
        canvas.height = 320
        canvas.getContext('2d').drawImage(video, 0, 0, 180, 320)
        frames.push(canvas.toDataURL('image/jpeg', 0.7))
      }

      URL.revokeObjectURL(video.src)
      resolve(frames)
    }

    video.onerror = () => {
      URL.revokeObjectURL(video.src)
      resolve([null])
    }
  })
}

function getVideoDuration(file) {
  return new Promise((resolve) => {
    const video = document.createElement('video')
    video.preload = 'metadata'
    video.src = URL.createObjectURL(file)
    video.onloadedmetadata = () => {
      resolve(video.duration)
      URL.revokeObjectURL(video.src)
    }
    video.onerror = () => {
      resolve(0)
      URL.revokeObjectURL(video.src)
    }
  })
}

export default function ClipUploader({ onComplete, quotaReached }) {
  const clips = useAppStore((s) => s.studio.clips)
  const addClip = useAppStore((s) => s.addClip)
  const removeClip = useAppStore((s) => s.removeClip)
  const [dragging, setDragging] = useState(false)
  const [processing, setProcessing] = useState(false)
  const inputRef = useRef(null)

  const processFiles = useCallback(
    async (files) => {
      if (processing) return
      setProcessing(true)
      const remaining = MAX_CLIPS - clips.length
      const toProcess = Array.from(files).slice(0, remaining)

      for (const file of toProcess) {
        if (!file.type.startsWith('video/')) continue
        const duration = await getVideoDuration(file)
        if (duration > MAX_CLIP_DURATION) continue
        const frames = await generateFrames(file, 3)
        addClip({
          id: crypto.randomUUID(),
          file,
          url: URL.createObjectURL(file),
          duration,
          thumbnail: frames[0],   // Première frame pour l'affichage
          frames,                  // Toutes les frames pour Vision IA
          analysisLabel: getAnalysisLabel(duration),
        })
      }
      setProcessing(false)
    },
    [clips.length, addClip, processing]
  )

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault()
      setDragging(false)
      if (clips.length >= MAX_CLIPS) return
      processFiles(e.dataTransfer.files)
    },
    [clips.length, processFiles]
  )

  const handleFileChange = (e) => {
    processFiles(e.target.files)
    e.target.value = ''
  }

  if (quotaReached) {
    return (
      <div className="bg-pc-surface border border-pc-border rounded-card p-8 text-center">
        <div className="text-[40px] mb-3">🎬</div>
        <h2 className="text-[15px] font-black tracking-[-0.03em] text-pc-ink mb-2">
          Quota atteint
        </h2>
        <p className="text-[13px] text-pc-ink-3 leading-relaxed">
          Tu as utilisé tous tes Reels ce mois-ci. Passe au plan supérieur pour
          en créer plus.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Zone de dépôt */}
      <motion.div
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => clips.length < MAX_CLIPS && inputRef.current?.click()}
        animate={{ scale: dragging ? 1.01 : 1 }}
        className={`relative cursor-pointer rounded-card border-2 border-dashed p-8 text-center transition-colors ${
          dragging
            ? 'border-pc-green bg-pc-green/5'
            : 'border-pc-border bg-pc-surface hover:border-pc-ink-4'
        } ${clips.length >= MAX_CLIPS ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="video/*"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
        <div className="text-[36px] mb-2">📱</div>
        <p className="text-[14px] font-semibold text-pc-ink">
          {clips.length === 0
            ? 'Glisse tes clips ici ou clique pour filmer'
            : `Ajouter des clips (${clips.length}/${MAX_CLIPS})`}
        </p>
        <p className="text-[12px] text-pc-ink-3 mt-1">
          1 à {MAX_CLIPS} clips, {MAX_CLIP_DURATION}s max chacun
        </p>
        {processing && (
          <p className="text-[12px] text-pc-green mt-2 font-medium">
            Traitement en cours...
          </p>
        )}
      </motion.div>

      {/* Aperçus des clips */}
      {clips.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {clips.map((clip, idx) => (
            <div
              key={clip.id}
              className="relative bg-pc-surface rounded-elem border border-pc-border overflow-hidden group"
            >
              {clip.thumbnail ? (
                <img
                  src={clip.thumbnail}
                  alt={`Clip ${idx + 1}`}
                  className="w-full aspect-[9/16] object-cover"
                />
              ) : (
                <div className="w-full aspect-[9/16] bg-pc-bg flex items-center justify-center text-[24px]">
                  🎬
                </div>
              )}
              {/* Badge durée */}
              <div className="absolute bottom-2 left-2 bg-black/70 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-[5px]">
                {clip.duration.toFixed(1)}s
              </div>
              {/* Badge label */}
              <div className="absolute top-2 left-2 bg-white/90 text-pc-ink text-[9px] font-semibold px-1.5 py-0.5 rounded-[5px]">
                {clip.analysisLabel}
              </div>
              {/* Indicateur multi-frames */}
              {clip.frames?.length > 1 && (
                <div className="absolute bottom-2 right-2 bg-pc-green/80 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-[5px]">
                  {clip.frames.filter(Boolean).length}f
                </div>
              )}
              {/* Bouton supprimer */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  removeClip(clip.id)
                }}
                className="absolute top-2 right-2 w-5 h-5 bg-black/60 text-white rounded-full flex items-center justify-center text-[11px] opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
              >
                {'\u2715'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Conseil */}
      {clips.length > 0 && clips.length < 2 && (
        <p className="text-[12px] text-pc-ink-3 text-center">
          Astuce : 2-4 clips courts donnent les meilleurs résultats
        </p>
      )}

      {/* CTA */}
      <button
        disabled={clips.length === 0}
        onClick={onComplete}
        className={`w-full py-[11px] rounded-btn text-[13px] font-bold transition-all ${
          clips.length > 0
            ? 'bg-pc-ink text-white hover:bg-pc-ink-2 active:scale-[0.98]'
            : 'bg-pc-bg border border-pc-border text-pc-ink-3 cursor-not-allowed'
        }`}
      >
        Analyser mes clips
      </button>
    </div>
  )
}
