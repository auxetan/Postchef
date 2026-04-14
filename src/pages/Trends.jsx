import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { mockTrendingSounds, mockFormats, mockSeasonalEvents } from '../utils/mockData.js'
import DemoBadge from '../components/ui/DemoBadge.jsx'

const TABS = [
  ['sounds', 'Sons trending'],
  ['formats', 'Formats viraux'],
  ['calendar', 'Calendrier saisonnier'],
]

const SOUND_FILTERS = ['Tous', 'TikTok', 'Instagram']

const PLATFORM_COLOR = {
  TikTok:    { badge: 'bg-pc-bg border-pc-border text-pc-ink-2' },
  Instagram: { badge: 'bg-pc-green-light border-pc-green text-pc-green' },
}

const DIFF_COLOR = {
  Facile: 'text-[#059669]',
  Moyen:  'text-[#d97706]',
}

export default function Trends() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('sounds')
  const [soundFilter, setSoundFilter] = useState('Tous')

  const filteredSounds = mockTrendingSounds.filter(
    (s) => soundFilter === 'Tous' || s.platform === soundFilter
  )

  return (
    <div className="min-h-screen bg-pc-bg">

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="bg-pc-surface border-b border-pc-border sticky top-0 z-30">
        <div className="px-6 pt-7 pb-0 max-w-2xl mx-auto lg:max-w-5xl">
          <div className="flex items-center gap-2 pb-1">
            <h1 className="text-[26px] font-black tracking-[-0.04em] text-pc-ink leading-none">
              Inspirations
            </h1>
            <DemoBadge variant="beta" label="Curatées" />
          </div>
          <p className="text-[11px] text-pc-ink-4 mb-3 leading-snug">
            Formats et sons sélectionnés manuellement · pas de données live
          </p>
        </div>

        {/* Tabs */}
        <div className="flex max-w-2xl mx-auto lg:max-w-5xl border-t border-pc-rule">
          {TABS.map(([t, l]) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-3 text-[12px] font-semibold border-b-2 transition-all
                ${tab === t ? 'border-pc-ink text-pc-ink' : 'border-transparent text-pc-ink-4 hover:text-pc-ink-2'}`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* ── Sons trending ──────────────────────────────────────── */}
      {tab === 'sounds' && (
        <div className="px-6 py-6 max-w-2xl mx-auto lg:max-w-5xl lg:px-8 space-y-5">

          {/* Platform filter */}
          <div className="flex gap-3 overflow-x-auto scrollbar-hide">
            {SOUND_FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setSoundFilter(f)}
                className={`text-[12px] font-semibold pb-1 whitespace-nowrap flex-shrink-0 border-b-2 transition-all
                  ${soundFilter === f ? 'border-pc-ink text-pc-ink' : 'border-transparent text-pc-ink-4 hover:text-pc-ink-2'}`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Sound cards */}
          <div className="lg:grid lg:grid-cols-2 lg:gap-4 space-y-5 lg:space-y-0">
          {filteredSounds.map((sound) => {
            const pc = PLATFORM_COLOR[sound.platform] || { badge: 'bg-pc-bg border-pc-border text-pc-ink-3' }
            return (
              <div key={sound.id} className="bg-pc-surface border border-pc-border rounded-card overflow-hidden">
                <div className="px-5 pt-5 pb-4">

                  {/* Platform + category + trending row */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] font-bold border rounded-[6px] px-[8px] py-[3px] ${pc.badge}`}>
                        {sound.platform}
                      </span>
                      <span className="text-[11px] text-pc-ink-4 font-medium">{sound.category}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {sound.trending && <span className="text-[13px]" title="Trending">&#x1F525;</span>}
                      <span className={`text-[11px] font-semibold ${DIFF_COLOR[sound.difficulty] || 'text-pc-ink-3'}`}>
                        {sound.difficulty}
                      </span>
                    </div>
                  </div>

                  {/* Title + artist */}
                  <p className="text-[15px] font-bold text-pc-ink leading-[1.45] tracking-[-0.01em]">
                    {sound.name}
                  </p>
                  <p className="text-[12px] text-pc-ink-3 font-medium mt-[2px] mb-3">
                    {sound.artist} &middot; {sound.uses} utilisations
                  </p>

                  {/* Idea */}
                  <div className="bg-pc-bg border border-pc-rule rounded-btn px-4 py-3 mb-4">
                    <p className="pc-section-label mb-1">Idee resto</p>
                    <p className="text-[13px] text-pc-ink-2 leading-[1.55]">{sound.idea}</p>
                  </div>

                  {/* Action */}
                  <button
                    onClick={() => navigate('/app/ideas')}
                    className="w-full text-[12px] font-bold text-white bg-pc-green rounded-btn py-[9px] hover:bg-pc-green-dark transition-colors"
                  >
                    Utiliser cette idee
                  </button>
                </div>
              </div>
            )
          })}

          </div>

          {/* Empty state */}
          {filteredSounds.length === 0 && (
            <div className="text-center py-14">
              <div className="text-[13px] text-pc-ink-3 mb-3">Aucun son pour ce filtre</div>
              <button
                onClick={() => setSoundFilter('Tous')}
                className="text-[12px] font-semibold text-pc-green border-b border-pc-green hover:opacity-70 transition-opacity"
              >
                Reinitialiser
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Formats viraux ─────────────────────────────────────── */}
      {tab === 'formats' && (
        <div className="px-6 py-6 max-w-2xl mx-auto lg:max-w-5xl lg:px-8">
          <div className="space-y-5 lg:grid lg:grid-cols-3 lg:gap-4 lg:space-y-0">
          {mockFormats.map((fmt) => {
            const pc = PLATFORM_COLOR[fmt.platform] || { badge: 'bg-pc-bg border-pc-border text-pc-ink-3' }
            return (
              <div key={fmt.id} className="bg-pc-surface border border-pc-border rounded-card overflow-hidden">
                <div className="px-5 pt-5 pb-4">

                  {/* Platform + duration row */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] font-bold border rounded-[6px] px-[8px] py-[3px] ${pc.badge}`}>
                        {fmt.platform}
                      </span>
                      <span className="text-[11px] text-pc-ink-4 font-medium">{fmt.duration}</span>
                    </div>
                    <span className={`text-[11px] font-semibold ${DIFF_COLOR[fmt.difficulty] || 'text-pc-ink-3'}`}>
                      {fmt.difficulty}
                    </span>
                  </div>

                  {/* Name */}
                  <p className="text-[15px] font-bold text-pc-ink leading-[1.45] tracking-[-0.01em] mb-1">
                    {fmt.name}
                  </p>

                  {/* Description */}
                  <p className="text-[13px] text-pc-ink-3 leading-[1.55] mb-3">
                    {fmt.description}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-[11px] font-semibold text-pc-ink-4">
                      Vues moyennes : <span className="text-pc-ink-2">{fmt.avgViews}</span>
                    </span>
                  </div>

                  {/* Tips */}
                  <div className="bg-pc-bg border border-pc-rule rounded-btn px-4 py-3 mb-4">
                    <p className="pc-section-label mb-2">Conseils</p>
                    <ul className="space-y-1">
                      {fmt.tips.map((tip, i) => (
                        <li key={i} className="text-[12px] text-pc-ink-2 leading-[1.5] flex items-start gap-2">
                          <span className="text-pc-green mt-[2px] flex-shrink-0">&#x2022;</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Action */}
                  <button
                    onClick={() => navigate('/app/ideas')}
                    className="w-full text-[12px] font-bold text-white bg-pc-green rounded-btn py-[9px] hover:bg-pc-green-dark transition-colors"
                  >
                    Generer une idee avec ce format
                  </button>
                </div>
              </div>
            )
          })}
          </div>
        </div>
      )}

      {/* ── Calendrier saisonnier ──────────────────────────────── */}
      {tab === 'calendar' && (
        <div className="px-6 py-6 max-w-2xl mx-auto lg:max-w-5xl lg:px-8 space-y-0">

          {/* Section label */}
          <div className="flex items-center gap-3 mb-5">
            <span className="pc-section-label">Evenements a venir</span>
            <div className="flex-1 h-px bg-pc-rule" />
          </div>

          {/* Timeline */}
          <div className="space-y-[1px] bg-pc-border rounded-card overflow-hidden border border-pc-border">
            {mockSeasonalEvents.map((event) => {
              const isClose = event.daysUntil < 30
              return (
                <div key={event.id} className="bg-pc-surface px-5 py-4 flex gap-4">

                  {/* Timeline accent */}
                  <div className="flex flex-col items-center pt-[2px]">
                    <div
                      className={`w-[8px] h-[8px] rounded-full flex-shrink-0 ${isClose ? 'bg-pc-green' : 'bg-pc-ink-4'}`}
                    />
                    <div className="w-px flex-1 bg-pc-rule mt-1" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className={`text-[14px] font-bold leading-tight ${isClose ? 'text-pc-green' : 'text-pc-ink'}`}>
                        {event.name}
                      </p>
                      <span className={`text-[11px] font-bold flex-shrink-0 ml-3 ${isClose ? 'text-pc-green' : 'text-pc-ink-4'}`}>
                        J-{event.daysUntil}
                      </span>
                    </div>
                    <p className="text-[11px] text-pc-ink-4 font-medium mb-2">
                      {new Date(event.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                    <p className="text-[13px] text-pc-ink-3 leading-[1.55]">
                      {event.idea}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
