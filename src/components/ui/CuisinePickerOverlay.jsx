import { useState, useRef, useEffect } from 'react'

const CUISINE_CATEGORIES = {
  'Classiques françaises': [
    'Française', 'Bistrot', 'Brasserie', 'Lyonnaise', 'Provençale',
    'Alsacienne', 'Basque', 'Normande', 'Bretonne', 'Gastronomique',
    'Crêperie', 'Pâtisserie / Salon de thé',
  ],
  'Méditerranée & Moyen-Orient': [
    'Italienne', 'Pizza', 'Grecque', 'Espagnole', 'Tapas',
    'Libanaise', 'Turque', 'Marocaine', 'Tunisienne', 'Israélienne',
    'Mezze', 'Méditerranéenne',
  ],
  'Asie': [
    'Japonaise', 'Sushi / Sashimi', 'Ramen', 'Coréenne', 'Chinoise',
    'Thaïlandaise', 'Vietnamienne', 'Indonésienne', 'Indienne',
    'Sri Lankaise', 'Philippine', 'Taïwanaise', 'Dim Sum',
  ],
  'Amériques': [
    'Américaine', 'Burger & Snack', 'Tacos / Mexicaine', 'Tex-Mex',
    'Brésilienne', 'Péruvienne', 'Argentine', 'Caribéenne', 'Créole',
  ],
  'Autres cuisines du monde': [
    'Éthiopienne', 'Sénégalaise', 'Ivoirienne', 'Camerounaise',
    'Réunionnaise', 'Polynésienne', 'Australienne',
  ],
  'Spécialités & Régimes': [
    'Végétarien', 'Vegan', 'Bio / Organique', 'Sans gluten',
    'Fruits de mer', 'Poissons', 'Viandes & Grillades',
    'Barbecue / Plancha', 'Fondue / Raclette',
  ],
  'Formats modernes': [
    'Street Food', 'Food Truck', 'Brunch', 'Bowls & Healthy',
    'Poke Bowl', 'Smash Burger', 'Kebab / Sandwich', 'Glacier',
    'Cave à vin / Bar à vins',
  ],
}

const ALL_CUISINES = Object.values(CUISINE_CATEGORIES).flat()

export default function CuisinePickerOverlay({ selected = [], onChange, onClose }) {
  const [search, setSearch] = useState('')
  const [local, setLocal] = useState(selected)
  const searchRef = useRef(null)

  useEffect(() => {
    searchRef.current?.focus()
  }, [])

  const toggle = (c) => {
    setLocal((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    )
  }

  const handleConfirm = () => {
    onChange(local)
    onClose()
  }

  const filtered = search.trim()
    ? ALL_CUISINES.filter((c) => c.toLowerCase().includes(search.toLowerCase()))
    : null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center px-0 sm:px-4">
      <div className="bg-white w-full sm:max-w-lg rounded-t-[28px] sm:rounded-[24px] flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 pt-5 pb-3 flex items-center justify-between border-b border-pc-divider flex-shrink-0">
          <div>
            <h3 className="text-[17px] font-extrabold text-pc-text tracking-[-0.3px]">Type de cuisine</h3>
            <div className="text-[12px] text-pc-hint mt-[2px]">{local.length} sélectionné{local.length > 1 ? 's' : ''}</div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-pc-bg flex items-center justify-center text-pc-muted hover:bg-pc-border transition-colors">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M2 2l10 10M12 2L2 12" />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="px-5 py-3 flex-shrink-0">
          <div className="flex items-center gap-3 bg-pc-bg rounded-[14px] px-4 py-[11px] border border-pc-border focus-within:border-pc-green focus-within:ring-2 focus-within:ring-pc-green/20 transition-all">
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="#9ca3af" strokeWidth="1.8" strokeLinecap="round">
              <circle cx="6" cy="6" r="5" />
              <path d="M10.5 10.5l3 3" />
            </svg>
            <input
              ref={searchRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un type de cuisine..."
              className="flex-1 bg-transparent text-[14px] text-pc-body placeholder:text-pc-hint focus:outline-none"
            />
            {search && (
              <button onClick={() => setSearch('')} className="text-pc-hint hover:text-pc-body">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M2 2l10 10M12 2L2 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Selected chips */}
        {local.length > 0 && (
          <div className="px-5 pb-2 flex-shrink-0">
            <div className="flex flex-wrap gap-[6px]">
              {local.map((c) => (
                <button
                  key={c}
                  onClick={() => toggle(c)}
                  className="flex items-center gap-1 bg-pc-green text-white text-[12px] font-semibold px-3 py-[5px] rounded-pill"
                >
                  {c}
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M2 2l6 6M8 2L2 8" />
                  </svg>
                </button>
              ))}
              <button onClick={() => setLocal([])} className="text-[11px] text-pc-hint hover:text-pc-muted font-medium px-2">
                Tout effacer
              </button>
            </div>
          </div>
        )}

        {/* List */}
        <div className="flex-1 overflow-y-auto px-5 pb-3">
          {filtered ? (
            <div>
              {filtered.length === 0 ? (
                <div className="text-center py-8 text-pc-muted text-[14px]">Aucun résultat pour "{search}"</div>
              ) : (
                <div className="flex flex-wrap gap-2 pt-2">
                  {filtered.map((c) => (
                    <button
                      key={c}
                      onClick={() => toggle(c)}
                      className={`px-4 py-[9px] rounded-pill border-[1.5px] text-[13px] font-medium transition-all
                        ${local.includes(c) ? 'bg-pc-green text-white border-pc-green' : 'bg-white text-pc-ink-2 border-pc-border hover:border-pc-green-mid'}`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            Object.entries(CUISINE_CATEGORIES).map(([cat, items]) => (
              <div key={cat} className="mb-4">
                <div className="text-[11px] font-semibold text-pc-hint uppercase tracking-caps mb-2 mt-3">{cat}</div>
                <div className="flex flex-wrap gap-2">
                  {items.map((c) => (
                    <button
                      key={c}
                      onClick={() => toggle(c)}
                      className={`px-4 py-[9px] rounded-pill border-[1.5px] text-[13px] font-medium transition-all duration-100
                        ${local.includes(c) ? 'bg-pc-green text-white border-pc-green' : 'bg-white text-pc-ink-2 border-pc-border hover:border-pc-green-mid'}`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-pc-divider flex-shrink-0">
          <button
            onClick={handleConfirm}
            disabled={local.length === 0}
            className="w-full bg-pc-green text-white font-bold text-[15px] py-[14px] rounded-pill hover:bg-pc-green-dark transition-colors disabled:opacity-40"
          >
            Confirmer {local.length > 0 ? `(${local.length})` : ''}
          </button>
        </div>
      </div>
    </div>
  )
}
