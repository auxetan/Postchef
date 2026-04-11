/**
 * BrandKitPicker — logo, couleurs et police de la marque restaurant
 * Stocké localement dans le store (logo en base64)
 */
import { useRef } from 'react'
import useAppStore from '../../store/useAppStore'

const PRESET_COLORS = [
  '#1D9E75', // pc-green
  '#DC2626', // rouge
  '#D97706', // ambre
  '#7C3AED', // violet
  '#0EA5E9', // bleu
  '#0F172A', // ink
]

const FONTS = [
  { id: 'sans',    label: 'Sans',    preview: 'Aa', className: 'font-sans' },
  { id: 'serif',   label: 'Serif',   preview: 'Aa', className: 'font-serif' },
  { id: 'display', label: 'Display', preview: 'Aa', className: 'font-black tracking-tight' },
]

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function BrandKitPicker() {
  const brandKit = useAppStore((s) => s.brandKit)
  const setBrandKit = useAppStore((s) => s.setBrandKit)
  const fileRef = useRef(null)

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const dataUrl = await fileToDataUrl(file)
    setBrandKit({ logoDataUrl: dataUrl })
    e.target.value = ''
  }

  return (
    <div className="bg-pc-surface border border-pc-border rounded-card px-5 py-5">
      <div className="flex items-center justify-between mb-3">
        <div className="pc-section-label">Brand Kit</div>
        <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-pc-green">
          Identité visuelle
        </span>
      </div>

      {/* Logo */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => fileRef.current?.click()}
          className="w-16 h-16 rounded-btn border-2 border-dashed border-pc-border bg-pc-bg flex items-center justify-center overflow-hidden hover:border-pc-green transition-colors shrink-0"
        >
          {brandKit.logoDataUrl ? (
            <img src={brandKit.logoDataUrl} alt="Logo" className="w-full h-full object-contain" />
          ) : (
            <span className="text-[20px]">📷</span>
          )}
        </button>
        <div className="flex-1">
          <div className="text-[12px] font-bold text-pc-ink">Logo</div>
          <div className="text-[11px] text-pc-ink-4">PNG/JPG, carré recommandé</div>
          {brandKit.logoDataUrl && (
            <button
              onClick={() => setBrandKit({ logoDataUrl: null })}
              className="text-[10px] text-pc-ink-3 hover:text-pc-ink underline mt-0.5"
            >
              Retirer
            </button>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleLogoUpload}
        />
      </div>

      {/* Couleurs */}
      <div className="mb-4">
        <div className="text-[11px] font-semibold text-pc-ink-4 uppercase tracking-caps mb-2">
          Couleur principale
        </div>
        <div className="flex gap-2 flex-wrap">
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setBrandKit({ primaryColor: c })}
              className={`w-8 h-8 rounded-full border-2 transition-all ${
                brandKit.primaryColor === c
                  ? 'border-pc-ink scale-110'
                  : 'border-pc-border hover:scale-105'
              }`}
              style={{ backgroundColor: c }}
              title={c}
            />
          ))}
          <label className="w-8 h-8 rounded-full border-2 border-dashed border-pc-border flex items-center justify-center cursor-pointer hover:border-pc-ink transition-colors">
            <span className="text-[11px] text-pc-ink-4">+</span>
            <input
              type="color"
              value={brandKit.primaryColor}
              onChange={(e) => setBrandKit({ primaryColor: e.target.value })}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Police */}
      <div>
        <div className="text-[11px] font-semibold text-pc-ink-4 uppercase tracking-caps mb-2">
          Typographie
        </div>
        <div className="grid grid-cols-3 gap-2">
          {FONTS.map((f) => {
            const active = brandKit.fontFamily === f.id
            return (
              <button
                key={f.id}
                onClick={() => setBrandKit({ fontFamily: f.id })}
                className={`rounded-btn border py-2 transition-all ${
                  active
                    ? 'border-pc-green bg-pc-green/5'
                    : 'border-pc-border bg-pc-bg hover:border-pc-ink-4'
                }`}
              >
                <div className={`text-[20px] text-pc-ink ${f.className}`}>{f.preview}</div>
                <div className="text-[10px] text-pc-ink-3 mt-0.5">{f.label}</div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
