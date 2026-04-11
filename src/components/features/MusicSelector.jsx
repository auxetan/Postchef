import { useState, useRef, useEffect } from 'react'

/**
 * Sélecteur de musique avec preview audio 15s.
 * Affiche les pistes disponibles, indique la recommandation IA,
 * et permet d'écouter avant de choisir.
 */

const MUSIC_LIBRARY = [
  {
    id: 'warm_upbeat_01',
    name: 'Golden Hour',
    mood: 'warm_upbeat',
    moodLabel: 'Warm & Upbeat',
    duration: 30,
    trending: false,
    previewUrl: null,
    creatomateId: 'track_warm_001',
  },
  {
    id: 'energetic_01',
    name: 'Viral Beat',
    mood: 'energetic',
    moodLabel: 'Énergique',
    duration: 30,
    trending: true,
    previewUrl: null,
    creatomateId: 'track_energetic_001',
  },
  {
    id: 'chill_01',
    name: 'Café Terrace',
    mood: 'chill_ambient',
    moodLabel: 'Chill Ambient',
    duration: 30,
    trending: false,
    previewUrl: null,
    creatomateId: 'track_chill_001',
  },
  {
    id: 'asmr_01',
    name: 'Sons naturels',
    mood: 'asmr_natural',
    moodLabel: 'ASMR',
    duration: 30,
    trending: false,
    previewUrl: null,
    creatomateId: null,
  },
]

export default function MusicSelector({ recommendedMood, selected, onSelect }) {
  const [playing, setPlaying] = useState(null)
  const audioRef = useRef(null)

  // Arrêter l'audio quand le composant est démonté
  useEffect(() => {
    return () => {
      audioRef.current?.pause()
      audioRef.current = null
    }
  }, [])

  const handlePlay = (track) => {
    if (!track.previewUrl) return

    if (playing === track.id) {
      audioRef.current?.pause()
      setPlaying(null)
      return
    }

    if (audioRef.current) {
      audioRef.current.pause()
    }
    audioRef.current = new Audio(track.previewUrl)
    audioRef.current.play()
    audioRef.current.onended = () => setPlaying(null)
    setPlaying(track.id)
  }

  return (
    <div className="bg-pc-surface border border-pc-border rounded-card px-5 py-5">
      <div className="pc-section-label mb-3">Musique</div>
      <div className="space-y-2">
        {MUSIC_LIBRARY.map((track) => {
          const isSelected = selected === track.mood
          const isRecommended = track.mood === recommendedMood
          const isPlaying = playing === track.id

          return (
            <button
              key={track.id}
              onClick={() => onSelect(track.mood)}
              className={`w-full flex items-center gap-3 p-3 rounded-btn border transition-colors text-left ${
                isSelected
                  ? 'border-pc-green bg-pc-green-light'
                  : 'border-pc-border bg-pc-surface hover:bg-pc-bg'
              }`}
            >
              {/* Bouton play */}
              <div
                onClick={(e) => {
                  e.stopPropagation()
                  handlePlay(track)
                }}
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                  track.previewUrl
                    ? 'bg-pc-green text-white cursor-pointer hover:bg-pc-green-dark'
                    : 'bg-pc-bg text-pc-ink-4 cursor-default'
                }`}
              >
                {isPlaying ? (
                  // Icône pause
                  <svg width="10" height="12" viewBox="0 0 10 12" fill="currentColor">
                    <rect x="0" y="0" width="3.5" height="12" rx="1" />
                    <rect x="6.5" y="0" width="3.5" height="12" rx="1" />
                  </svg>
                ) : (
                  // Icône play
                  <svg width="10" height="12" viewBox="0 0 10 12" fill="currentColor">
                    <path d="M0 0l10 6-10 6V0z" />
                  </svg>
                )}
              </div>

              {/* Infos piste */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[13px] font-semibold text-pc-ink">{track.name}</span>
                  {isRecommended && (
                    <span className="bg-pc-green text-white text-[9px] font-bold px-1.5 py-0.5 rounded-[5px]">
                      IA
                    </span>
                  )}
                  {track.trending && (
                    <span className="bg-pc-green text-white text-[9px] font-bold uppercase tracking-[0.08em] px-1.5 py-0.5 rounded-[5px]">
                      Trending
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-pc-ink-3">{track.moodLabel}</div>
              </div>

              {/* Durée */}
              <span className="text-[11px] text-pc-ink-4 shrink-0">{track.duration}s</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
