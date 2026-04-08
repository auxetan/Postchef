import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { mockIdeas } from '../utils/mockData.js'
import useAppStore from '../store/useAppStore.js'

const ANTHROPIC_KEY = import.meta.env.VITE_ANTHROPIC_KEY
import useToastStore from '../store/useToastStore.js'
import useFeatureAccess from '../hooks/useFeatureAccess.js'
import FeatureLock from '../components/ui/FeatureLock.jsx'
import IdeasCounter from '../components/ui/IdeasCounter.jsx'
import DishPhotoGenerator from '../components/features/DishPhotoGenerator.jsx'
import VideoScriptGenerator from '../components/features/VideoScriptGenerator.jsx'
import PlanningModal from '../components/ui/PlanningModal.jsx'

const PLATFORMS = ['Tous', 'TikTok', 'Instagram', 'Facebook']
const FORMATS   = ['Tous', 'Vidéo', 'Photo', 'Reel', 'Carrousel']

const PLATFORM_COLOR = {
  TikTok:    { text: 'text-pc-ink-2',    badge: 'bg-pc-bg border-pc-border text-pc-ink-2' },
  Instagram: { text: 'text-pc-green',    badge: 'bg-pc-green-light border-pc-green text-pc-green' },
  Facebook:  { text: 'text-[#2563eb]',   badge: 'bg-[#eff6ff] border-[#93c5fd] text-[#2563eb]' },
}

const DIFF_COLOR = {
  Facile: 'text-[#059669]',
  Moyen:  'text-[#d97706]',
}

// ── Hashtag generation ──────────────────────────────────────────────────────
const CUISINE_TAGS = {
  Italienne:       ['#italianfood', '#pastalovers', '#pizzatime'],
  Française:       ['#cuisinefrancaise', '#gastronomie', '#bistrot'],
  Japonaise:       ['#sushi', '#japanesefood', '#ramen'],
  Méditerranéenne: ['#mediterraneanfood', '#fresh'],
  Burger:          ['#burgeroftheday', '#smashburger', '#burgerlovers'],
  Pizza:           ['#pizzalovers', '#pizzatime'],
  Végétarien:      ['#plantbased', '#vegetarianfood'],
}

function generateHashtags(idea, restaurant) {
  const { hook = '', plateforme = '', format = '' } = idea
  const { cuisineTypes = [], city = 'Marseille', specialite = '' } = restaurant
  const tags = []

  if (plateforme === 'TikTok') tags.push('#foodtok', '#pourtoi', '#fyp', '#restauranttiktok', '#chefsoftiktok')
  else tags.push('#instafood', '#foodphotography', '#foodlovers', '#reelsinstagram')

  if (format.includes('Vidéo') || format.includes('Reel')) tags.push('#foodvideo')
  if (format.includes('Carrousel')) tags.push('#carouselfood')

  cuisineTypes.forEach((c) => { const ct = CUISINE_TAGS[c] || []; tags.push(...ct.slice(0, 2)) })
  tags.push('#restaurant', '#food', '#chef', '#foodie')

  const citySlug = city.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '')
  tags.push(`#${citySlug}`, `#restaurant${citySlug}`)

  if (specialite) {
    const slug = specialite.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '').slice(0, 15)
    if (slug) tags.push(`#${slug}`)
  }

  const STOPS = new Set(['avec', 'dans', 'pour', 'notre', 'votre', 'cette', 'comme', 'quand', 'premier', 'premiere'])
  const hookWords = hook.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').split(/\W+/)
    .filter((w) => w.length > 4 && !STOPS.has(w)).slice(0, 2).map((w) => `#${w}`)
  tags.push(...hookWords)

  return [...new Set(tags)].slice(0, 12)
}

// ── Main component ──────────────────────────────────────────────────────────
export default function Ideas() {
  const navigate = useNavigate()
  const [platform, setPlatform] = useState('Tous')
  const [format, setFormat] = useState('Tous')
  const [expanded, setExpanded] = useState(null)
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState('ideas')
  const [planningIdea, setPlanningIdea] = useState(null)
  const [hashtagsFor, setHashtagsFor] = useState(null)

  const ideas           = useAppStore((s) => s.ideas)
  const storeIdeas      = useAppStore((s) => s.setIdeas)
  const onboarding      = useAppStore((s) => s.onboarding)
  const menuPhoto       = useAppStore((s) => s.menuPhoto)
  const usage           = useAppStore((s) => s.usage)
  const incrementIdeasUsed = useAppStore((s) => s.incrementIdeasUsed)
  const savedIdeas      = useAppStore((s) => s.savedIdeas)
  const saveIdea        = useAppStore((s) => s.saveIdea)
  const toast           = useToastStore((s) => s.toast)
  const { can, feature, plan } = useFeatureAccess()

  const restaurantName = onboarding.restaurant.name || 'La Trattoria'
  const menuDishes     = menuPhoto?.dishes || []
  const displayIdeas   = ideas.length > 0 ? ideas : mockIdeas

  const ideasMax     = feature('ideasPerWeek')
  const ideasUsed    = usage.ideasUsedThisWeek
  const canGenerateMore      = ideasMax === Infinity || ideasUsed < ideasMax
  const isExhausted  = !canGenerateMore && ideasMax !== Infinity
  const allowedPlatformsCount = feature('platforms')

  const filtered = displayIdeas.filter((i) => {
    const matchPlatform = platform === 'Tous' || i.plateforme === platform
    const matchFormat   = format === 'Tous' || i.format.includes(format)
    return matchPlatform && matchFormat
  })

  const handleGenerate = async () => {
    if (!canGenerateMore) return
    setLoading(true)

    const restaurant  = onboarding.restaurant
    const clientele   = onboarding.clientele
    const preferences = onboarding.preferences

    if (ANTHROPIC_KEY) {
      const prompt = `Tu es Chef, expert en marketing restaurant sur les réseaux sociaux.

Restaurant : ${restaurant.name || 'Mon restaurant'}
Ville : ${restaurant.city || 'France'}
Cuisine : ${(restaurant.cuisineTypes || []).join(', ') || 'Française'}
Spécialité : ${restaurant.specialite || ''}
Couverts : ${restaurant.couverts || ''}
Cible : ${(clientele.profils || []).join(', ')}
Objectif : ${clientele.objectif || ''}
Plateformes préférées : ${(preferences.plateformes || []).join(', ')}
Fréquence : ${preferences.frequence || ''}

Génère 8 idées de contenu percutantes et variées, vraiment adaptées à ce restaurant spécifique.
Réponds UNIQUEMENT en JSON valide (tableau sans commentaires) :
[
  {
    "id": "idea-1",
    "hook": "accroche courte et percutante (max 12 mots, tutoiement interdit)",
    "format": "Reel|Vidéo courte|Photo|Carrousel|Story",
    "plateforme": "TikTok|Instagram|Facebook",
    "difficulte": "Facile|Moyen",
    "brief": "description du contenu visuel en 1-2 phrases concrètes",
    "legende": "légende prête à poster avec emojis (150 chars max)",
    "score": 85
  }
]`

      try {
        const res  = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': ANTHROPIC_KEY,
            'anthropic-version': '2023-06-01',
            'anthropic-dangerous-direct-browser-access': 'true',
          },
          body: JSON.stringify({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 2000,
            messages: [{ role: 'user', content: prompt }],
          }),
        })
        const data   = await res.json()
        const text   = data.content?.[0]?.text || ''
        const match  = text.match(/\[[\s\S]*\]/)
        const parsed = JSON.parse(match ? match[0] : text)
        storeIdeas(parsed)
      } catch {
        storeIdeas([...mockIdeas].sort(() => Math.random() - 0.5))
      }
    } else {
      await new Promise((r) => setTimeout(r, 1500))
      storeIdeas([...mockIdeas].sort(() => Math.random() - 0.5))
    }

    incrementIdeasUsed()
    setLoading(false)
    toast('Nouvelles idées générées ✓')
  }

  const handleBookmark = (idea, e) => {
    e.stopPropagation()
    const wasSaved = savedIdeas.some((i) => i.id === idea.id)
    saveIdea(idea)
    toast(wasSaved ? 'Retiré de la bibliothèque' : 'Ajouté à la bibliothèque ✓')
  }

  const handleCopyLegend   = (legende, e) => { e.stopPropagation(); navigator.clipboard?.writeText(legende); toast('Légende copiée ✓') }
  const handleCopyHashtags = (tags, e) => { e.stopPropagation(); navigator.clipboard?.writeText(tags.join(' ')); toast('Hashtags copiés ✓') }

  return (
    <div className="min-h-screen bg-pc-bg">

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="bg-pc-surface border-b border-pc-border sticky top-0 z-30">
        <div className="px-6 pt-7 pb-0 flex items-end justify-between max-w-2xl mx-auto">
          <h1 className="text-[26px] font-black tracking-[-0.04em] text-pc-ink leading-none pb-4">
            Idées IA
          </h1>
          {tab === 'ideas' && (
            <div className="pb-4">
              <button
                onClick={handleGenerate}
                disabled={loading || !canGenerateMore}
                className={`flex items-center gap-2 px-4 py-[9px] rounded-btn text-[13px] font-bold transition-all disabled:opacity-40
                  ${isExhausted
                    ? 'bg-pc-bg border border-pc-border text-pc-ink-3 cursor-not-allowed'
                    : 'bg-pc-green text-white hover:bg-pc-green-dark'}`}
              >
                {loading ? (
                  <>
                    <span className="w-3 h-3 rounded-full animate-spin inline-block" style={{ border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff' }} />
                    En cours…
                  </>
                ) : isExhausted ? 'Quota atteint' : (
                  <>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 1v10M1 6h10"/></svg>
                    Générer
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex max-w-2xl mx-auto border-t border-pc-rule">
          {[['ideas', 'Idées IA'], ['bibliotheque', 'Bibliothèque']].map(([t, l]) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-3 text-[12px] font-semibold border-b-2 transition-all flex items-center justify-center gap-[6px]
                ${tab === t ? 'border-pc-ink text-pc-ink' : 'border-transparent text-pc-ink-4 hover:text-pc-ink-2'}`}
            >
              {l}
              {t === 'bibliotheque' && savedIdeas.length > 0 && (
                <span className="text-[10px] bg-pc-ink text-white rounded-full w-[18px] h-[18px] flex items-center justify-center font-bold">
                  {savedIdeas.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Bibliothèque ─────────────────────────────────────────── */}
      {tab === 'bibliotheque' && (
        <div className="px-6 py-7 max-w-2xl mx-auto">
          {savedIdeas.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-[48px] mb-4">🔖</div>
              <div className="text-[17px] font-bold text-pc-ink mb-2">Bibliothèque vide</div>
              <div className="text-[13px] text-pc-ink-3">Sauvegarde tes idées préférées avec l'icône signet.</div>
            </div>
          ) : (
            <div className="space-y-2">
              {savedIdeas.map((idea) => (
                <IdeaCard key={idea.id} idea={idea} isSaved={true} expanded={expanded} hashtagsFor={hashtagsFor}
                  restaurant={onboarding.restaurant} onExpand={setExpanded} onBookmark={handleBookmark}
                  onSchedule={setPlanningIdea} onHashtags={setHashtagsFor} onCopyLegend={handleCopyLegend}
                  onCopyHashtags={handleCopyHashtags} canBrief={can('briefVisuel')} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Idées ─────────────────────────────────────────────────── */}
      {tab === 'ideas' && (
        <div className="px-6 py-6 max-w-2xl mx-auto space-y-5">

          {/* Credits */}
          <IdeasCounter used={ideasUsed} max={ideasMax} plan={plan} />

          {/* Platform lock */}
          {allowedPlatformsCount !== Infinity && allowedPlatformsCount < 3 && (
            <div className="bg-[#fefce8] border border-[#fde68a] rounded-btn px-4 py-3 flex items-center justify-between">
              <span className="text-[12px] text-[#713f12]">
                <span className="font-semibold">Starter :</span> 1 plateforme.{' '}
                <span className="text-[#92400e]">Pro = toutes.</span>
              </span>
              <FeatureLock feature="platforms" compact />
            </div>
          )}

          {/* Quota exhausted */}
          {isExhausted && (
            <div className="bg-pc-surface border border-pc-border rounded-card px-5 py-5">
              <div className="text-[15px] font-black tracking-[-0.03em] text-pc-ink mb-1">Quota épuisé</div>
              <div className="text-[13px] text-pc-ink-3 mb-4 leading-relaxed">
                {ideasMax} idées utilisées cette semaine. Réinitialisation lundi.
              </div>
              <div className="space-y-2">
                <button onClick={() => navigate('/app/account')}
                  className="w-full bg-pc-ink text-white font-bold text-[13px] py-[11px] rounded-btn hover:bg-pc-ink-2 transition-colors">
                  Passer à Pro — 20 idées / sem
                </button>
                <button onClick={() => navigate('/app/account')}
                  className="w-full border border-pc-border text-pc-ink font-bold text-[13px] py-[11px] rounded-btn hover:bg-pc-bg transition-colors">
                  Pro Annuel — illimité ∞
                </button>
              </div>
            </div>
          )}

          {/* Filters — text underline style */}
          <div className="space-y-3">
            <div className="flex gap-3 overflow-x-auto scrollbar-hide">
              {PLATFORMS.map((p) => (
                <button key={p} onClick={() => setPlatform(p)}
                  className={`text-[12px] font-semibold pb-1 whitespace-nowrap flex-shrink-0 border-b-2 transition-all
                    ${platform === p ? 'border-pc-ink text-pc-ink' : 'border-transparent text-pc-ink-4 hover:text-pc-ink-2'}`}>
                  {p}
                </button>
              ))}
            </div>
            <div className="flex gap-3 overflow-x-auto scrollbar-hide">
              {FORMATS.map((f) => (
                <button key={f} onClick={() => setFormat(f)}
                  className={`text-[12px] font-semibold pb-1 whitespace-nowrap flex-shrink-0 border-b-2 transition-all
                    ${format === f ? 'border-pc-green text-pc-green' : 'border-transparent text-pc-ink-4 hover:text-pc-ink-2'}`}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="bg-pc-surface border border-pc-border rounded-card px-5 py-8 text-center">
              <div className="w-10 h-10 rounded-full mx-auto mb-4 animate-spin"
                style={{ border: '2px solid #E8E8E6', borderTopColor: '#1D9E75' }} />
              <div className="text-[14px] font-bold text-pc-ink">Analyse en cours…</div>
              <div className="text-[12px] text-pc-ink-4 mt-1">Chef personnalise les idées pour ton restaurant</div>
            </div>
          )}

          {/* Ideas */}
          {!loading && filtered.map((idea) => (
            <IdeaCard key={idea.id} idea={idea}
              isSaved={savedIdeas.some((i) => i.id === idea.id)}
              expanded={expanded} hashtagsFor={hashtagsFor} restaurant={onboarding.restaurant}
              onExpand={setExpanded} onBookmark={handleBookmark} onSchedule={setPlanningIdea}
              onHashtags={setHashtagsFor} onCopyLegend={handleCopyLegend}
              onCopyHashtags={handleCopyHashtags} canBrief={can('briefVisuel')} />
          ))}

          {/* Empty state */}
          {!loading && filtered.length === 0 && (
            <div className="text-center py-14">
              <div className="text-[13px] text-pc-ink-3 mb-3">Aucune idée pour ces filtres</div>
              <button onClick={() => { setPlatform('Tous'); setFormat('Tous') }}
                className="text-[12px] font-semibold text-pc-green border-b border-pc-green hover:opacity-70 transition-opacity">
                Réinitialiser
              </button>
            </div>
          )}

          {/* Photo generator */}
          {!loading && (
            <div>
              <div className="flex items-center gap-3 mb-4 mt-2">
                <div className="flex-1 h-px bg-pc-rule" />
                <span className="pc-section-label flex items-center gap-2">
                  Photo IA
                  {!can('dishPhotoGenerator') && <FeatureLock feature="dishPhotoGenerator" compact />}
                </span>
                <div className="flex-1 h-px bg-pc-rule" />
              </div>
              {can('dishPhotoGenerator') ? (
                <DishPhotoGenerator restaurantName={restaurantName} menuDishes={menuDishes} />
              ) : feature('dishPhotoGenerator') === 'prompt' ? (
                <DishPhotoGenerator restaurantName={restaurantName} menuDishes={menuDishes} promptOnly />
              ) : (
                <FeatureLock feature="dishPhotoGenerator" title="Génération photo IA"
                  description="Génère des photos de plats professionnelles. Styles personnalisés, ambiance, angle de vue." />
              )}
            </div>
          )}
        </div>
      )}

      {planningIdea && <PlanningModal idea={planningIdea} onClose={() => setPlanningIdea(null)} />}
    </div>
  )
}

// ── IdeaCard ──────────────────────────────────────────────────────────────────
function IdeaCard({ idea, isSaved, expanded, hashtagsFor, restaurant,
  onExpand, onBookmark, onSchedule, onHashtags, onCopyLegend, onCopyHashtags, canBrief }) {

  const isExpanded  = expanded === idea.id
  const showHashtags = hashtagsFor === idea.id
  const hashtags    = showHashtags ? generateHashtags(idea, restaurant) : []
  const pc = PLATFORM_COLOR[idea.plateforme] || { text: 'text-pc-ink-3', badge: 'bg-pc-bg border-pc-border text-pc-ink-3' }

  return (
    <div className="bg-pc-surface border border-pc-border rounded-card overflow-hidden">

      <div className="px-5 pt-5 pb-4">
        {/* Platform + difficulty row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className={`text-[11px] font-bold border rounded-[6px] px-[8px] py-[3px] ${pc.badge}`}>
              {idea.plateforme}
            </span>
            <span className="text-[11px] text-pc-ink-4 font-medium">{idea.format}</span>
          </div>
          <div className="flex items-center gap-2">
            {idea.difficulte && (
              <span className={`text-[11px] font-semibold ${DIFF_COLOR[idea.difficulte] || 'text-pc-ink-3'}`}>
                {idea.difficulte}
              </span>
            )}
            <button
              onClick={(e) => onBookmark(idea, e)}
              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-pc-bg transition-colors"
            >
              <svg width="15" height="15" viewBox="0 0 15 15"
                fill={isSaved ? '#1D9E75' : 'none'}
                stroke={isSaved ? '#1D9E75' : '#D4D4D4'}
                strokeWidth="1.5">
                <path d="M3 2.5h9a1 1 0 011 1v9.5l-5-3-5 3V3.5a1 1 0 011-1z" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Hook — the star of the card */}
        <p className="text-[15px] font-bold text-pc-ink leading-[1.45] mb-4 tracking-[-0.01em]">
          "{idea.hook}"
        </p>

        {/* Actions */}
        <div className="flex gap-2">
          {canBrief ? (
            <button
              onClick={() => onExpand(isExpanded ? null : idea.id)}
              className={`flex-1 text-[12px] font-semibold py-[8px] rounded-btn border transition-colors
                ${isExpanded
                  ? 'bg-pc-ink text-white border-pc-ink'
                  : 'bg-pc-bg border-pc-border text-pc-ink-2 hover:border-pc-ink hover:text-pc-ink'}`}>
              {isExpanded ? '↑ Masquer' : 'Voir le brief'}
            </button>
          ) : (
            <div className="flex-1 flex items-center justify-center gap-2 border border-pc-rule rounded-btn py-[8px] text-[12px] text-pc-ink-4 bg-pc-bg">
              Brief visuel <FeatureLock feature="briefVisuel" compact />
            </div>
          )}
          <button
            onClick={() => onSchedule(idea)}
            className="flex-1 text-[12px] font-bold text-white bg-pc-green rounded-btn py-[8px] hover:bg-pc-green-dark transition-colors flex items-center justify-center gap-[6px]">
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <rect x="1" y="2" width="9" height="8" rx="1"/>
              <path d="M3.5 1v2M7.5 1v2M1 5h9"/>
            </svg>
            Planifier
          </button>
        </div>
      </div>

      {/* Expanded brief */}
      {isExpanded && canBrief && (
        <div className="border-t border-pc-rule px-5 py-5 space-y-5 bg-pc-bg">
          <div>
            <p className="pc-section-label mb-2">Brief visuel</p>
            <p className="text-[13px] text-pc-ink-2 leading-[1.65]">{idea.brief}</p>
          </div>

          <div>
            <p className="pc-section-label mb-2">Légende</p>
            <p className="text-[13px] text-pc-ink-3 leading-[1.65] mb-3">{idea.legende}</p>
            <button onClick={(e) => onCopyLegend(idea.legende, e)}
              className="text-[12px] font-semibold text-pc-ink border border-pc-border rounded-btn px-4 py-[6px] hover:bg-pc-surface transition-colors">
              Copier la légende
            </button>
          </div>

          <div>
            <p className="pc-section-label mb-2">Hashtags viraux</p>
            {showHashtags ? (
              <>
                <div className="flex flex-wrap gap-[6px] mb-3">
                  {hashtags.map((tag) => (
                    <span key={tag} className="text-[11px] font-semibold bg-pc-green-light text-pc-green border border-pc-green/20 px-[10px] py-[4px] rounded-[6px]">
                      {tag}
                    </span>
                  ))}
                </div>
                <button onClick={(e) => onCopyHashtags(hashtags, e)}
                  className="text-[12px] font-semibold text-pc-ink border border-pc-border rounded-btn px-4 py-[6px] hover:bg-pc-surface transition-colors">
                  Copier les hashtags
                </button>
              </>
            ) : (
              <button onClick={() => onHashtags(idea.id)}
                className="flex items-center gap-2 text-[12px] font-semibold text-pc-green border border-pc-green/30 rounded-btn px-4 py-[6px] bg-pc-green-light hover:bg-pc-green hover:text-white hover:border-pc-green transition-colors">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M2 4h8M2 8h8M5 1l-1 10M8 1l-1 10"/>
                </svg>
                Générer les hashtags
              </button>
            )}
          </div>

          {/* Video Script Generator */}
          <div>
            <p className="pc-section-label mb-2">Script vidéo</p>
            <VideoScriptGenerator idea={idea} />
          </div>
        </div>
      )}
    </div>
  )
}
