import { useState, useRef, useEffect } from 'react'

const SUGGESTIONS = [
  // Plats emblématiques
  'Bouillabaisse', 'Ratatouille', 'Soupe à l\'oignon', 'Bœuf bourguignon', 'Cassoulet',
  'Choucroute', 'Raclette', 'Fondue savoyarde', 'Tartiflette', 'Coq au vin',
  'Entrecôte frites', 'Foie gras maison', 'Magret de canard', 'Confit de canard',
  'Risotto', 'Pasta carbonara', 'Lasagnes maison', 'Pizza napolitaine', 'Osso buco',
  'Tiramisu maison', 'Panna cotta',
  'Sushi assortis', 'Ramen traditionnel', 'Yakitori', 'Gyoza maison',
  'Bibimbap', 'Bulgogi', 'Pho bœuf', 'Banh mi', 'Pad thaï',
  'Curry indien', 'Butter chicken', 'Dal makhani', 'Biryani',
  'Tajine d\'agneau', 'Couscous maison', 'Pastilla', 'Harira',
  'Shawarma maison', 'Mezze libanais', 'Hummus artisanal',
  'Burger artisanal', 'Smash burger', 'Tacos maison', 'Hot dog gourmet',
  'Brunch du dimanche', 'Eggs benedict', 'Pancakes moelleux',
  'Plateau de fruits de mer', 'Homard grillé', 'Saint-Jacques poêlées',
  'Tartare de bœuf', 'Carpaccio', 'Vitello tonnato',
  'Soufflé au fromage', 'Crêpes suzette', 'Profiteroles',
  'Moelleux au chocolat', 'Crème brûlée', 'Tarte Tatin',
  // Spécialités locales
  'Pissaladière', 'Socca', 'Pan bagnat', 'Daube provençale',
  'Chili con carne', 'Paella valenciana', 'Gambas al ajillo',
]

export default function SpecialitePickerOverlay({ value = '', onChange, onClose }) {
  const [search, setSearch] = useState(value)
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const filtered = SUGGESTIONS.filter((s) =>
    s.toLowerCase().includes(search.toLowerCase()) && s !== search
  ).slice(0, 20)

  const handleSelect = (s) => {
    onChange(s)
    onClose()
  }

  const handleConfirm = () => {
    onChange(search)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center px-0 sm:px-4">
      <div className="bg-white w-full sm:max-w-lg rounded-t-[28px] sm:rounded-[24px] flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 pt-5 pb-3 flex items-center justify-between flex-shrink-0">
          <h3 className="text-[17px] font-extrabold text-pc-text tracking-[-0.3px]">Spécialité signature</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-pc-bg flex items-center justify-center text-pc-muted hover:bg-pc-border transition-colors">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M2 2l10 10M12 2L2 12" />
            </svg>
          </button>
        </div>

        {/* Input */}
        <div className="px-5 pb-4 flex-shrink-0">
          <div className="flex items-center gap-3 bg-white rounded-[14px] px-4 py-[11px] border-2 border-pc-green ring-2 ring-pc-green/20">
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="#1D9E75" strokeWidth="1.8" strokeLinecap="round">
              <circle cx="6" cy="6" r="5" />
              <path d="M10.5 10.5l3 3" />
            </svg>
            <input
              ref={inputRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Ex : Bouillabaisse, Pizza napolitaine..."
              className="flex-1 bg-transparent text-[14px] text-pc-body placeholder:text-pc-hint focus:outline-none"
            />
            {search && (
              <button onClick={() => setSearch('')} className="text-pc-hint">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M2 2l10 10M12 2L2 12" />
                </svg>
              </button>
            )}
          </div>
          <div className="text-[11px] text-pc-hint mt-2">
            Tape le nom exact ou choisis dans les suggestions
          </div>
        </div>

        {/* Suggestions */}
        <div className="flex-1 overflow-y-auto px-5 pb-3">
          {filtered.length > 0 ? (
            <>
              <div className="text-[11px] font-semibold text-pc-hint uppercase tracking-caps mb-3">
                {search ? 'Correspondances' : 'Suggestions populaires'}
              </div>
              <div className="space-y-[6px]">
                {filtered.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSelect(s)}
                    className="w-full text-left px-4 py-[12px] rounded-elem border border-pc-divider bg-white hover:border-pc-green hover:bg-pc-green-light transition-all text-[14px] font-medium text-pc-body flex items-center justify-between group"
                  >
                    {s}
                    <svg className="text-pc-hint group-hover:text-pc-green w-4 h-4 transition-colors" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M3 8h10M9 4l4 4-4 4" />
                    </svg>
                  </button>
                ))}
              </div>
            </>
          ) : search ? (
            <div className="text-[13px] text-pc-muted py-4">
              Aucune suggestion — ton nom personnalisé sera utilisé.
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.slice(0, 30).map((s) => (
                <button
                  key={s}
                  onClick={() => handleSelect(s)}
                  className="px-4 py-[9px] rounded-pill border border-pc-border bg-white text-[13px] font-medium text-[#374151] hover:border-pc-green hover:bg-pc-green-light transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-pc-divider flex-shrink-0">
          <button
            onClick={handleConfirm}
            disabled={!search.trim()}
            className="w-full bg-pc-green text-white font-bold text-[15px] py-[14px] rounded-pill hover:bg-pc-green-dark transition-colors disabled:opacity-40"
          >
            {search.trim() ? `Confirmer "${search}"` : 'Entrer une spécialité'}
          </button>
        </div>
      </div>
    </div>
  )
}
