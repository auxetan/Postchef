import { useState } from 'react'
import { useRestaurantBrain } from '../../hooks/useRestaurantBrain.js'

const STARS = (n) => '★'.repeat(Math.round(n)) + '☆'.repeat(5 - Math.round(n))

const PLATFORM_COLOR = {
  TikTok:    'bg-[#f3f4f6] text-[#374151]',
  Instagram: 'bg-pc-green-light text-pc-green-dark',
  Story:     'bg-[#fef3c7] text-[#92400e]',
}

export default function RestaurantBrainPanel({ restaurantName, city }) {
  const { loading, place, insights, error, search, reset, quotaReached, remaining, monthlyMax } = useRestaurantBrain()
  const [started, setStarted] = useState(false)

  const handleSearch = () => {
    setStarted(true)
    search(restaurantName, city)
  }

  if (!started) {
    return (
      <div className="bg-pc-surface rounded-card border border-pc-border p-4">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-[12px] bg-pc-green-light flex items-center justify-center flex-shrink-0">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#1D9E75" strokeWidth="1.8" strokeLinecap="round">
              <circle cx="10" cy="10" r="8" />
              <path d="M10 6v4l2.5 2.5" />
            </svg>
          </div>
          <div>
            <div className="text-[14px] font-bold text-pc-ink">Analyse de ton restaurant</div>
            <div className="text-[12px] text-pc-ink-3 leading-[1.5] mt-[2px]">
              Chef trouve {restaurantName || 'ton restaurant'} sur Google, lit tes avis et génère des idées de contenu sur mesure.
            </div>
          </div>
        </div>

        <div className="bg-pc-green-light rounded-elem px-4 py-3 mb-4">
          <div className="text-[11px] font-semibold text-pc-green-dark uppercase tracking-caps mb-1">Ce que tu vas obtenir</div>
          {['Tes points forts vus par tes clients', 'Opportunités de contenu manquées', '3 idées de posts basées sur tes vrais avis'].map((item) => (
            <div key={item} className="flex items-center gap-2 text-[12px] text-pc-green-dark mt-[4px]">
              <div className="w-[5px] h-[5px] rounded-full bg-pc-green flex-shrink-0" />
              {item}
            </div>
          ))}
        </div>

        {/* Quota restant */}
        {monthlyMax !== Infinity && monthlyMax > 0 && (
          <div className={`text-[11px] font-medium text-center mb-2 ${quotaReached ? 'text-[#ef4444]' : 'text-pc-ink-4'}`}>
            {quotaReached
              ? `Quota atteint ce mois (${monthlyMax} analyses/mois)`
              : `${remaining} analyse${remaining > 1 ? 's' : ''} restante${remaining > 1 ? 's' : ''} ce mois`}
          </div>
        )}

        <button
          onClick={handleSearch}
          disabled={!restaurantName || !city || quotaReached}
          className="w-full bg-pc-green text-white font-bold text-[14px] py-[12px] rounded-btn hover:bg-pc-green-dark transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="7" cy="7" r="5" />
            <path d="M11.5 11.5l3 3" />
          </svg>
          Analyser {restaurantName || 'mon restaurant'}
        </button>
        {(!restaurantName || !city) && !quotaReached && (
          <div className="text-[11px] text-pc-ink-4 text-center mt-2">
            Remplis le nom et la ville d'abord
          </div>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="bg-pc-surface rounded-card border border-pc-border p-5">
        <div className="space-y-3">
          {[
            { icon: '🔍', text: `Recherche "${restaurantName}" sur Google...`, done: true },
            { icon: '⭐', text: 'Lecture des avis clients...', done: place !== null },
            { icon: '🧠', text: 'Analyse des insights contenu...', done: insights !== null },
          ].map((step, i) => (
            <div key={i} className={`flex items-center gap-3 transition-opacity duration-300 ${step.done ? 'opacity-100' : 'opacity-40'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${step.done ? 'bg-pc-green' : 'bg-pc-border'}`}>
                {step.done ? (
                  <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                    <path d="M2 5.5l2.5 2.5 4.5-4.5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                ) : (
                  <span className="text-[9px]">{step.icon}</span>
                )}
              </div>
              <span className="text-[13px] text-pc-ink">{step.text}</span>
              {!step.done && (
                <span
                  className="w-3 h-3 rounded-full ml-auto flex-shrink-0 animate-spin"
                  style={{ border: '2px solid #E1F5EE', borderTopColor: '#1D9E75' }}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!place) return null

  return (
    <div className="space-y-3">
      {/* Place info */}
      <div className="bg-pc-surface rounded-card border border-pc-border p-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <div className="text-[15px] font-bold text-pc-ink">{place.name}</div>
            <div className="text-[12px] text-pc-ink-3 mt-[2px]">{place.address}</div>
          </div>
          <button onClick={reset} className="text-[11px] text-pc-ink-4 hover:text-pc-ink-3 font-medium flex-shrink-0">
            Relancer
          </button>
        </div>

        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center gap-1">
            <span className="text-[16px] font-extrabold text-pc-ink">{place.rating}</span>
            <span className="text-[#f59e0b] text-[13px]">{STARS(place.rating)}</span>
          </div>
          <span className="text-[12px] text-pc-ink-4">{place.totalRatings} avis</span>
          {place.phone && <span className="text-[12px] text-pc-ink-4">{place.phone}</span>}
        </div>

        {/* Reviews */}
        <div className="space-y-2">
          <div className="text-[11px] font-semibold text-pc-ink-4 uppercase tracking-caps">Avis récents</div>
          {place.reviews.slice(0, 3).map((r, i) => (
            <div key={i} className="bg-pc-bg rounded-elem px-3 py-[10px]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[12px] font-semibold text-pc-ink">{r.author}</span>
                <span className="text-[10px] text-pc-ink-4">{r.date}</span>
              </div>
              <div className="text-[#f59e0b] text-[10px] mb-1">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
              <div className="text-[12px] text-pc-ink-3 leading-[1.5] line-clamp-2">{r.text}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Insights */}
      {insights && (
        <>
          {/* Strengths */}
          <div className="bg-pc-surface rounded-card border border-pc-border p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-full bg-pc-green-light flex items-center justify-center">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="#1D9E75" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </div>
              <div className="text-[13px] font-bold text-pc-ink">Tes points forts</div>
            </div>
            <div className="space-y-2">
              {insights.strengths.map((s, i) => (
                <div key={i} className="flex items-start gap-2 text-[13px] text-pc-ink-2">
                  <div className="w-[5px] h-[5px] rounded-full bg-pc-green flex-shrink-0 mt-[6px]" />
                  {s}
                </div>
              ))}
            </div>
          </div>

          {/* Opportunities */}
          <div className="bg-pc-surface rounded-card border border-pc-border p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-full bg-[#fef3c7] flex items-center justify-center">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M6 2v5M6 9v1" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <div className="text-[13px] font-bold text-pc-ink">Opportunités de contenu</div>
            </div>
            <div className="space-y-2">
              {insights.opportunities.map((o, i) => (
                <div key={i} className="flex items-start gap-2 text-[13px] text-pc-ink-2">
                  <div className="w-[5px] h-[5px] rounded-full bg-[#f59e0b] flex-shrink-0 mt-[6px]" />
                  {o}
                </div>
              ))}
            </div>
          </div>

          {/* Content ideas from reviews */}
          <div className="bg-pc-surface rounded-card border-2 border-pc-green p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-full bg-pc-green flex items-center justify-center">
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                  <path d="M5.5 1L7 4h3L7.5 6.5l1 3L5.5 8l-3 1.5 1-3L1 4h3z" fill="#fff" />
                </svg>
              </div>
              <div className="text-[13px] font-bold text-pc-ink">Idées basées sur tes avis</div>
            </div>
            <div className="space-y-2">
              {insights.contentIdeas.map((idea, i) => (
                <div key={i} className="bg-pc-green-light rounded-elem px-3 py-[10px]">
                  <div className="text-[13px] font-semibold text-pc-green-dark mb-1">"{idea.hook}"</div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-semibold px-2 py-[2px] rounded-pill ${PLATFORM_COLOR[idea.plateforme] || 'bg-pc-bg text-pc-ink-3'}`}>
                      {idea.plateforme}
                    </span>
                    <span className="text-[11px] text-pc-ink-4">{idea.format}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
