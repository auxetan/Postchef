import { useState, useRef, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * Sélecteur de musique avec preview audio.
 * - 4 pistes principales visibles par défaut
 * - "Voir plus" révèle la bibliothèque complète (~15 pistes) avec recherche
 * - Input URL custom pour ajouter n'importe quelle musique
 */

// Bibliothèque complète — les previewUrl pointent vers des pistes libres de droits
// Remplacer par les vraies URLs une fois les tracks uploadés dans Creatomate
const MUSIC_LIBRARY = [
  // ── Warm & Upbeat ──
  {
    id: 'warm_upbeat_01',
    name: 'Golden Hour',
    mood: 'warm_upbeat',
    moodLabel: 'Warm & Upbeat',
    duration: 30,
    trending: false,
    previewUrl: 'https://cdn.pixabay.com/audio/2024/11/28/audio_3a4b923ecd.mp3',
    creatomateId: 'track_warm_001',
  },
  {
    id: 'warm_upbeat_02',
    name: 'Sunday Brunch',
    mood: 'warm_upbeat',
    moodLabel: 'Warm & Upbeat',
    duration: 30,
    trending: false,
    previewUrl: 'https://cdn.pixabay.com/audio/2024/09/10/audio_6e5d780da7.mp3',
    creatomateId: 'track_warm_002',
  },
  {
    id: 'warm_upbeat_03',
    name: 'Feel Good Kitchen',
    mood: 'warm_upbeat',
    moodLabel: 'Warm & Upbeat',
    duration: 25,
    trending: false,
    previewUrl: 'https://cdn.pixabay.com/audio/2023/10/07/audio_2fed9dfcab.mp3',
    creatomateId: 'track_warm_003',
  },
  // ── Énergique ──
  {
    id: 'energetic_01',
    name: 'Viral Beat',
    mood: 'energetic',
    moodLabel: 'Énergique',
    duration: 30,
    trending: true,
    previewUrl: 'https://cdn.pixabay.com/audio/2023/07/19/audio_e53dc10cf3.mp3',
    creatomateId: 'track_energetic_001',
  },
  {
    id: 'energetic_02',
    name: 'Hype Mode',
    mood: 'energetic',
    moodLabel: 'Énergique',
    duration: 30,
    trending: true,
    previewUrl: 'https://cdn.pixabay.com/audio/2024/03/11/audio_10b89a14b3.mp3',
    creatomateId: 'track_energetic_002',
  },
  {
    id: 'energetic_03',
    name: 'Rush Hour',
    mood: 'energetic',
    moodLabel: 'Énergique',
    duration: 25,
    trending: false,
    previewUrl: 'https://cdn.pixabay.com/audio/2023/09/26/audio_283a1b4cde.mp3',
    creatomateId: 'track_energetic_003',
  },
  {
    id: 'energetic_04',
    name: 'Neon Nights',
    mood: 'energetic',
    moodLabel: 'Énergique',
    duration: 30,
    trending: false,
    previewUrl: 'https://cdn.pixabay.com/audio/2024/06/11/audio_4afce0b7b7.mp3',
    creatomateId: 'track_energetic_004',
  },
  // ── Chill Ambient ──
  {
    id: 'chill_01',
    name: 'Café Terrace',
    mood: 'chill_ambient',
    moodLabel: 'Chill Ambient',
    duration: 30,
    trending: false,
    previewUrl: 'https://cdn.pixabay.com/audio/2024/02/14/audio_8cf98fd532.mp3',
    creatomateId: 'track_chill_001',
  },
  {
    id: 'chill_02',
    name: 'Sunset Lounge',
    mood: 'chill_ambient',
    moodLabel: 'Chill Ambient',
    duration: 30,
    trending: false,
    previewUrl: 'https://cdn.pixabay.com/audio/2024/07/24/audio_5e3b1f7c25.mp3',
    creatomateId: 'track_chill_002',
  },
  {
    id: 'chill_03',
    name: 'Rainy Day',
    mood: 'chill_ambient',
    moodLabel: 'Chill Ambient',
    duration: 25,
    trending: false,
    previewUrl: 'https://cdn.pixabay.com/audio/2023/04/18/audio_89a52deaff.mp3',
    creatomateId: 'track_chill_003',
  },
  {
    id: 'chill_04',
    name: 'Jazz & Wine',
    mood: 'chill_ambient',
    moodLabel: 'Chill Ambient',
    duration: 30,
    trending: false,
    previewUrl: 'https://cdn.pixabay.com/audio/2024/01/16/audio_3dbb8f4753.mp3',
    creatomateId: 'track_chill_004',
  },
  // ── ASMR ──
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
  // ── Trending ──
  {
    id: 'trending_01',
    name: 'TikTok Vibes',
    mood: 'energetic',
    moodLabel: 'Énergique',
    duration: 15,
    trending: true,
    previewUrl: 'https://cdn.pixabay.com/audio/2024/08/15/audio_db5ef4a73a.mp3',
    creatomateId: 'track_trending_001',
  },
  {
    id: 'trending_02',
    name: 'Aesthetic Slow',
    mood: 'chill_ambient',
    moodLabel: 'Chill Ambient',
    duration: 20,
    trending: true,
    previewUrl: 'https://cdn.pixabay.com/audio/2024/05/20/audio_6fba2b90f3.mp3',
    creatomateId: 'track_trending_002',
  },
]

// 4 pistes affichées par défaut (1 par mood principal)
const DEFAULT_IDS = ['warm_upbeat_01', 'energetic_01', 'chill_01', 'asmr_01']

export default function MusicSelector({ recommendedMood, selected, onSelect }) {
  const [playing, setPlaying] = useState(null)
  const [expanded, setExpanded] = useState(false)
  const [search, setSearch] = useState('')
  const [customUrl, setCustomUrl] = useState('')
  const [customName, setCustomName] = useState('')
  const audioRef = useRef(null)

  // Arrêter l'audio quand le composant est démonté
  useEffect(() => {
    return () => {
      audioRef.current?.pause()
      audioRef.current = null
    }
  }, [])

  // Filtrer la bibliothèque
  const filteredTracks = useMemo(() => {
    if (!expanded) {
      // Mode compact : 4 pistes par défaut + la recommandée IA si pas déjà dedans
      const defaults = MUSIC_LIBRARY.filter((t) => DEFAULT_IDS.includes(t.id))
      if (recommendedMood && !defaults.some((t) => t.mood === recommendedMood)) {
        const rec = MUSIC_LIBRARY.find((t) => t.mood === recommendedMood)
        if (rec) defaults.unshift(rec)
      }
      return defaults
    }
    if (!search.trim()) return MUSIC_LIBRARY
    const q = search.toLowerCase()
    return MUSIC_LIBRARY.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.moodLabel.toLowerCase().includes(q) ||
        t.mood.toLowerCase().includes(q)
    )
  }, [expanded, search, recommendedMood])

  const handlePlay = (trackOrUrl, trackId) => {
    const url = typeof trackOrUrl === 'string' ? trackOrUrl : trackOrUrl.previewUrl
    const id = trackId || trackOrUrl.id
    if (!url) return

    if (playing === id) {
      audioRef.current?.pause()
      setPlaying(null)
      return
    }

    if (audioRef.current) {
      audioRef.current.pause()
    }
    audioRef.current = new Audio(url)
    audioRef.current.play().catch(() => setPlaying(null))
    audioRef.current.onended = () => setPlaying(null)
    setPlaying(id)
  }

  const handleAddCustom = () => {
    if (!customUrl.trim()) return
    onSelect('custom:' + customUrl.trim())
    setCustomUrl('')
    setCustomName('')
  }

  return (
    <div className="bg-pc-surface border border-pc-border rounded-card px-5 py-5">
      <div className="pc-section-label mb-3">Musique</div>
      <div className="space-y-2">
        {filteredTracks.map((track) => (
          <TrackRow
            key={track.id}
            track={track}
            isSelected={selected === track.mood || selected === track.id}
            isRecommended={track.mood === recommendedMood}
            isPlaying={playing === track.id}
            onSelect={() => onSelect(track.mood)}
            onPlay={() => handlePlay(track)}
          />
        ))}
      </div>

      {/* Bouton Voir plus / Voir moins */}
      <button
        onClick={() => {
          setExpanded((v) => !v)
          setSearch('')
        }}
        className="w-full mt-3 py-[9px] rounded-btn text-[12px] font-semibold text-pc-ink-3 bg-pc-bg hover:bg-pc-rule transition-colors"
      >
        {expanded ? 'Voir moins' : `Voir plus de musiques (${MUSIC_LIBRARY.length})`}
      </button>

      {/* Recherche (visible en mode expanded) */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par nom ou mood..."
              className="w-full mt-3 text-[13px] text-pc-ink bg-pc-bg rounded-btn p-3 border border-pc-border focus:border-pc-green focus:outline-none transition-colors"
            />

            {/* Section musique custom */}
            <div className="mt-4 pt-3 border-t border-pc-rule">
              <div className="pc-section-label mb-2">Ajouter ta propre musique</div>
              <div className="space-y-2">
                <input
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="Nom de la piste (optionnel)"
                  className="w-full text-[13px] text-pc-ink bg-pc-bg rounded-btn p-3 border border-pc-border focus:border-pc-green focus:outline-none transition-colors"
                />
                <div className="flex gap-2">
                  <input
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    placeholder="URL du fichier audio (MP3, WAV...)"
                    className="flex-1 text-[13px] text-pc-ink bg-pc-bg rounded-btn p-3 border border-pc-border focus:border-pc-green focus:outline-none transition-colors"
                  />
                  {/* Preview de l'URL custom */}
                  {customUrl.trim() && (
                    <button
                      onClick={() => handlePlay(customUrl.trim(), 'custom_preview')}
                      className="w-10 h-10 rounded-full bg-pc-green text-white flex items-center justify-center shrink-0 hover:bg-pc-green-dark transition-colors"
                    >
                      {playing === 'custom_preview' ? (
                        <svg width="10" height="12" viewBox="0 0 10 12" fill="currentColor">
                          <rect x="0" y="0" width="3.5" height="12" rx="1" />
                          <rect x="6.5" y="0" width="3.5" height="12" rx="1" />
                        </svg>
                      ) : (
                        <svg width="10" height="12" viewBox="0 0 10 12" fill="currentColor">
                          <path d="M0 0l10 6-10 6V0z" />
                        </svg>
                      )}
                    </button>
                  )}
                </div>
                <button
                  onClick={handleAddCustom}
                  disabled={!customUrl.trim()}
                  className={`w-full py-[11px] rounded-btn text-[13px] font-bold transition-all ${
                    customUrl.trim()
                      ? 'bg-pc-ink text-white hover:bg-pc-ink-2 active:scale-[0.98]'
                      : 'bg-pc-bg border border-pc-border text-pc-ink-4 cursor-not-allowed'
                  }`}
                >
                  Utiliser cette musique
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Composant ligne de piste ────────────────────────────────────────────────

function TrackRow({ track, isSelected, isRecommended, isPlaying, onSelect, onPlay }) {
  return (
    <button
      onClick={onSelect}
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
          onPlay()
        }}
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${
          track.previewUrl
            ? 'bg-pc-green text-white cursor-pointer hover:bg-pc-green-dark'
            : 'bg-pc-bg text-pc-ink-4 cursor-default'
        }`}
      >
        {isPlaying ? (
          <svg width="10" height="12" viewBox="0 0 10 12" fill="currentColor">
            <rect x="0" y="0" width="3.5" height="12" rx="1" />
            <rect x="6.5" y="0" width="3.5" height="12" rx="1" />
          </svg>
        ) : (
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
}
