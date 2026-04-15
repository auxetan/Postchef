import { useState, useEffect, useRef } from 'react'

/**
 * VoiceNarrator — Génère une narration vocale IA via Web Speech API (100% gratuit, natif navigateur).
 * Permet au restaurateur d'écouter le script de narration pour son reel AVANT de filmer,
 * ou d'enregistrer sa propre voix en lisant le script affiché.
 *
 * Props :
 *  - script : string  — texte à lire (généré par Claude depuis la directive)
 *  - lang   : string  — code langue ('fr', 'en', etc.)
 */
export default function VoiceNarrator({ script, lang = 'fr' }) {
  const [supported, setSupported] = useState(false)
  const [voices, setVoices] = useState([])
  const [selectedVoice, setSelectedVoice] = useState(null)
  const [speaking, setSpeaking] = useState(false)
  const [rate, setRate] = useState(1.0)
  const utterRef = useRef(null)

  useEffect(() => {
    if ('speechSynthesis' in window) {
      setSupported(true)
      const loadVoices = () => {
        const all = window.speechSynthesis.getVoices()
        const langCode = lang.toLowerCase()
        const filtered = all.filter((v) =>
          v.lang.toLowerCase().startsWith(langCode)
        )
        setVoices(filtered.length ? filtered : all.slice(0, 5))
        if (!selectedVoice && filtered.length) setSelectedVoice(filtered[0].name)
      }
      loadVoices()
      window.speechSynthesis.onvoiceschanged = loadVoices
    }
    return () => { window.speechSynthesis?.cancel() }
  }, [lang])

  const handlePlay = () => {
    if (!script || !supported) return
    window.speechSynthesis.cancel()

    const utter = new SpeechSynthesisUtterance(script)
    utter.lang = lang + '-' + lang.toUpperCase()
    utter.rate = rate
    if (selectedVoice) {
      const voice = window.speechSynthesis.getVoices().find((v) => v.name === selectedVoice)
      if (voice) utter.voice = voice
    }
    utter.onstart = () => setSpeaking(true)
    utter.onend   = () => setSpeaking(false)
    utter.onerror = () => setSpeaking(false)
    utterRef.current = utter
    window.speechSynthesis.speak(utter)
  }

  const handleStop = () => {
    window.speechSynthesis?.cancel()
    setSpeaking(false)
  }

  if (!supported) return null
  if (!script) return null

  return (
    <div className="bg-pc-surface border border-pc-border rounded-card px-5 py-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[15px]">🎙️</span>
          <div className="pc-section-label">Script narration</div>
        </div>
        <span className="text-[10px] font-bold tracking-[0.07em] text-pc-green uppercase">
          Gratuit · Voix système
        </span>
      </div>

      {/* Script affiché */}
      <p className="text-[13px] text-pc-ink-2 leading-relaxed mb-4 bg-pc-bg rounded-btn px-3 py-2 border border-pc-border">
        {script}
      </p>

      {/* Contrôles */}
      <div className="flex items-center gap-3">
        {/* Play / Stop */}
        <button
          onClick={speaking ? handleStop : handlePlay}
          className={`flex items-center gap-2 px-4 py-[9px] rounded-btn text-[13px] font-bold transition-colors ${
            speaking
              ? 'bg-red-500/10 text-red-500 border border-red-500/20'
              : 'bg-pc-ink text-white hover:bg-pc-ink-2'
          }`}
        >
          {speaking ? (
            <>
              <span className="inline-block w-2.5 h-2.5 bg-red-500 rounded-[2px]" />
              Arrêter
            </>
          ) : (
            <>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
              Écouter
            </>
          )}
        </button>

        {/* Vitesse */}
        <div className="flex items-center gap-2 text-[12px] text-pc-ink-3">
          <span>Vitesse</span>
          <select
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
            className="text-[12px] bg-pc-bg border border-pc-border rounded px-2 py-1 text-pc-ink"
          >
            <option value={0.8}>0.8×</option>
            <option value={1.0}>1×</option>
            <option value={1.2}>1.2×</option>
            <option value={1.5}>1.5×</option>
          </select>
        </div>

        {/* Voix */}
        {voices.length > 1 && (
          <select
            value={selectedVoice || ''}
            onChange={(e) => setSelectedVoice(e.target.value)}
            className="flex-1 text-[12px] bg-pc-bg border border-pc-border rounded px-2 py-1 text-pc-ink truncate"
          >
            {voices.map((v) => (
              <option key={v.name} value={v.name}>
                {v.name.replace(/^Google\s|^Microsoft\s/, '')}
              </option>
            ))}
          </select>
        )}
      </div>

      <p className="text-[10px] text-pc-ink-4 mt-3">
        Lis ce script à voix haute pendant le tournage, ou enregistre ta voix pour la narration off.
      </p>
    </div>
  )
}
