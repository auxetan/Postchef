/**
 * CaptionStylePicker — choix du style et de la langue des sous-titres animés
 * Kinetic (mot par mot) / Classic / Minimaliste / Aucun + 10 langues
 */

const STYLES = [
  {
    id: 'kinetic',
    label: 'Kinetic',
    badge: 'VIRAL',
    preview: ['UN', 'MOT', 'À', 'LA', 'FOIS'],
    description: 'Mot par mot, 97% de rétention',
  },
  {
    id: 'classic',
    label: 'Classic',
    badge: null,
    preview: ['Texte en bloc centré'],
    description: 'Sous-titres standard',
  },
  {
    id: 'minimal',
    label: 'Minimal',
    badge: null,
    preview: ['texte en bas'],
    description: "Discret, en bas d'écran",
  },
  {
    id: 'none',
    label: 'Aucun',
    badge: null,
    preview: [],
    description: 'Sans captions',
  },
]

const LANGUAGES = [
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'en', label: 'English',  flag: '🇬🇧' },
  { code: 'es', label: 'Español',  flag: '🇪🇸' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
  { code: 'de', label: 'Deutsch',  flag: '🇩🇪' },
  { code: 'pt', label: 'Português', flag: '🇵🇹' },
  { code: 'nl', label: 'Nederlands', flag: '🇳🇱' },
  { code: 'ar', label: 'العربية',  flag: '🇸🇦' },
  { code: 'ja', label: '日本語',    flag: '🇯🇵' },
  { code: 'zh', label: '中文',      flag: '🇨🇳' },
]

export default function CaptionStylePicker({
  selected,
  onSelect,
  language = 'fr',
  onLanguageChange,
}) {
  return (
    <div className="bg-pc-surface border border-pc-border rounded-card px-5 py-5">
      <div className="flex items-center justify-between mb-3">
        <div className="pc-section-label">Style des captions</div>
        <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-pc-green">
          Auto IA · 97% accuracy
        </span>
      </div>

      {/* Langue */}
      <div className="mb-3">
        <div className="text-[11px] font-semibold text-pc-ink-4 uppercase tracking-caps mb-1.5">
          Langue
        </div>
        <select
          value={language}
          onChange={(e) => onLanguageChange?.(e.target.value)}
          disabled={selected === 'none'}
          className="w-full text-[13px] text-pc-ink bg-pc-bg rounded-btn px-3 py-2 border border-pc-border focus:border-pc-green focus:outline-none transition-colors disabled:opacity-50"
        >
          {LANGUAGES.map((l) => (
            <option key={l.code} value={l.code}>
              {l.flag} {l.label}
            </option>
          ))}
        </select>
      </div>

      {/* Styles */}
      <div className="grid grid-cols-2 gap-2">
        {STYLES.map((s) => {
          const active = selected === s.id
          return (
            <button
              key={s.id}
              onClick={() => onSelect(s.id)}
              className={`relative rounded-btn border p-3 text-left transition-all ${
                active
                  ? 'border-pc-green bg-pc-green/5'
                  : 'border-pc-border bg-pc-bg hover:border-pc-ink-4'
              }`}
            >
              {s.badge && (
                <span className="absolute top-2 right-2 text-[9px] font-black tracking-[0.06em] text-pc-green">
                  {s.badge}
                </span>
              )}
              {/* Mini preview */}
              <div className="h-8 flex items-center justify-center mb-2 overflow-hidden">
                {s.id === 'kinetic' ? (
                  <div className="flex gap-1">
                    {s.preview.map((w, i) => (
                      <span
                        key={i}
                        className="text-[9px] font-black text-pc-ink bg-pc-border px-1 py-px rounded-[3px]"
                      >
                        {w}
                      </span>
                    ))}
                  </div>
                ) : s.id === 'none' ? (
                  <span className="text-[11px] text-pc-ink-4">—</span>
                ) : (
                  <span
                    className={`text-[10px] font-semibold text-pc-ink ${
                      s.id === 'minimal' ? 'self-end' : ''
                    }`}
                  >
                    {s.preview[0]}
                  </span>
                )}
              </div>
              <div className="text-[12px] font-bold text-pc-ink">{s.label}</div>
              <div className="text-[10px] text-pc-ink-4 mt-0.5 leading-tight">
                {s.description}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
