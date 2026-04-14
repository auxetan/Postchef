import { useState, useRef } from 'react'
import { requestClaude } from '../../utils/serverApi.js'
import { PC_GREEN } from '../../utils/colors.js'

const MOCK_RESULT = {
  dishes: ['Tartare de bœuf', 'Saint-Jacques poêlées', 'Risotto aux truffes', 'Moelleux chocolat'],
  insights: 'Carte axée produits nobles. Idéal pour du contenu "behind the scenes" et des zooms plats signature.',
}

export default function MenuPhotoUpload({ value, onChange }) {
  const [dragging, setDragging]   = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult]       = useState(null)
  const inputRef = useRef(null)

  const readFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = (e) => {
      onChange({ file, dataUrl: e.target.result, name: file.name })
      triggerAnalysis(e.target.result)
    }
    reader.readAsDataURL(file)
  }

  const triggerAnalysis = async (dataUrl) => {
    setAnalyzing(true)
    setResult(null)

    if (dataUrl) {
      const prompt = `Tu es Chef, expert en marketing pour restaurants. Analyse cette image de carte ou menu.

Si l'image n'est PAS une carte/menu, réponds avec dishes:[] et un insights adapté.

Réponds UNIQUEMENT en JSON valide :
{
  "dishes": ["Nom exact du plat 1", "Nom exact du plat 2"],
  "starDish": "le plat qui a le plus fort potentiel viral (1 nom, ou null)",
  "insights": "2 phrases concrètes : ce que cette carte révèle comme opportunité de contenu pour TikTok/Instagram",
  "contentAngles": ["angle 1 court", "angle 2 court", "angle 3 court"]
}

Règles :
- dishes : max 8 plats, noms seuls sans prix ni description
- starDish : le plat le plus photogénique, original ou signature
- contentAngles : 3 angles de contenu vidéo/photo exploitables directement
- insights : spécifiques à CE menu, pas génériques`

      try {
        const data = await requestClaude({
          prompt,
          imageDataUrl: dataUrl,
          maxTokens: 320,
        })
        const match  = data.text.match(/\{[\s\S]*\}/)
        const parsed = JSON.parse(match ? match[0] : data.text)
        // Assure la compatibilité avec les anciens champs
        setResult({
          dishes: parsed.dishes || [],
          starDish: parsed.starDish || null,
          insights: parsed.insights || '',
          contentAngles: parsed.contentAngles || [],
        })
      } catch {
        setResult(MOCK_RESULT)
      }
    } else {
      setResult(MOCK_RESULT)
    }

    setAnalyzing(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    readFile(e.dataTransfer.files[0])
  }

  return (
    <div>
      {!value ? (
        <div
          onDragEnter={() => setDragging(true)}
          onDragLeave={() => setDragging(false)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-[16px] px-4 py-6 text-center cursor-pointer transition-all
            ${dragging ? 'border-pc-green bg-pc-green-light' : 'border-pc-border bg-pc-bg hover:border-pc-green-mid hover:bg-pc-green-light/30'}`}
        >
          <div className="w-12 h-12 rounded-[14px] bg-pc-green-light mx-auto mb-3 flex items-center justify-center">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke={PC_GREEN} strokeWidth="1.8" strokeLinecap="round">
              <path d="M11 14V4M7 8l4-4 4 4" />
              <path d="M3 17v1a2 2 0 002 2h12a2 2 0 002-2v-1" />
            </svg>
          </div>
          <div className="text-[14px] font-semibold text-pc-ink mb-1">
            Importe ta carte / menu
          </div>
          <div className="text-[12px] text-pc-ink-3 leading-[1.5]">
            Photo de ta carte, menu PDF scanné...<br />
            Chef analyse les plats et génère du contenu adapté
          </div>
          <div className="mt-3 inline-flex items-center gap-2 bg-pc-green text-white text-[12px] font-bold px-4 py-[8px] rounded-pill">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M6.5 9V1M3 4l3.5-3 3.5 3" />
              <path d="M1 11v.5A1.5 1.5 0 002.5 13h8a1.5 1.5 0 001.5-1.5V11" />
            </svg>
            Choisir un fichier
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => readFile(e.target.files[0])}
          />
        </div>
      ) : (
        <div className="border border-pc-border rounded-[16px] overflow-hidden">
          {/* Preview */}
          <div className="relative">
            <img
              src={value.dataUrl}
              alt="Carte du restaurant"
              className="w-full max-h-[200px] object-cover"
            />
            <button
              onClick={() => { onChange(null); setResult(null) }}
              className="absolute top-2 right-2 w-7 h-7 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M2 2l8 8M10 2L2 10" />
              </svg>
            </button>
          </div>

          {/* Analysis */}
          <div className="p-3">
            {analyzing ? (
              <div className="flex items-center gap-3 py-2">
                <div
                  className="w-5 h-5 rounded-full flex-shrink-0 animate-spin"
                  style={{ border: '2.5px solid #E1F5EE', borderTopColor: PC_GREEN }}
                />
                <span className="text-[13px] text-pc-ink-3">Chef analyse ta carte...</span>
              </div>
            ) : result ? (
              <div className="space-y-3">
                {/* Plats */}
                {result.dishes.length > 0 && (
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-pc-green flex items-center justify-center flex-shrink-0 mt-[1px]">
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M2 5l2.5 2.5L8 2" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-[11px] font-semibold text-pc-green-dark mb-1">
                        {result.dishes.length} plat{result.dishes.length > 1 ? 's' : ''} détecté{result.dishes.length > 1 ? 's' : ''}
                      </div>
                      <div className="flex flex-wrap gap-[5px]">
                        {result.dishes.map((d) => (
                          <span
                            key={d}
                            className={`text-[11px] px-2 py-[3px] rounded-pill font-medium ${
                              result.starDish === d
                                ? 'bg-pc-amber-light text-pc-amber-text border border-pc-amber-border'
                                : 'bg-pc-green-light text-pc-green-dark'
                            }`}
                          >
                            {result.starDish === d ? '⭐ ' : ''}{d}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                {/* Insights */}
                {result.insights && (
                  <div className="text-[12px] text-pc-ink-3 leading-[1.5] pl-7">
                    {result.insights}
                  </div>
                )}
                {/* Angles de contenu */}
                {result.contentAngles?.length > 0 && (
                  <div className="pl-7">
                    <div className="text-[10px] font-bold text-pc-ink-4 uppercase tracking-wider mb-1">Angles à filmer</div>
                    <div className="space-y-[4px]">
                      {result.contentAngles.map((a, i) => (
                        <div key={i} className="flex items-center gap-2 text-[11px] text-pc-ink-2">
                          <div className="w-[4px] h-[4px] rounded-full bg-pc-green flex-shrink-0" />
                          {a}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  )
}
