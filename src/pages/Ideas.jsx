import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { mockIdeas } from '../utils/mockData.js'
import useAppStore from '../store/useAppStore.js'
import useToastStore from '../store/useToastStore.js'
import useFeatureAccess from '../hooks/useFeatureAccess.js'
import FeatureLock from '../components/ui/FeatureLock.jsx'
import IdeasCounter from '../components/ui/IdeasCounter.jsx'
import DishPhotoGenerator from '../components/features/DishPhotoGenerator.jsx'
import VideoScriptGenerator from '../components/features/VideoScriptGenerator.jsx'
import PlanningModal from '../components/ui/PlanningModal.jsx'
import { requestClaude } from '../utils/serverApi.js'

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
      const data = await requestClaude({
        prompt,
        maxTokens: 2000,
      })
      const match  = data.text.match(/\[[\s\S]*\]/)
      const parsed = JSON.parse(match ? match[0] : data.text)
      storeIdeas(parsed)
    } catch {
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
      <div
        className="sticky top-0 z-30"
        style={{
          background: 'rgba(247,247,245,0.85)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
        }}
      >
        <div className="px-5 pt-7 pb-4 flex items-center justify-between max-w-2xl mx-auto">
          <h1 className="text-[28px] font-[800] tracking-[-0.03em] text-pc-ink leading-none">
            Idées IA
          </h1>
          {tab === 'ideas' && (
            <button
              onClick={handleGenerate}
              disabled={loading || !canGenerateMore}
              className="flex items-center gap-[7px] px-4 py-[9px] rounded-pill text-[13px] font-[700] transition-all disabled:opacity-50"
              style={isExhausted
                ? { background: 'rgba(0,0,0,0.05)', color: '#A3A3A3', cursor: 'not-allowed' }
                : { background: '#1D9E75', color: 'white', boxShadow: '0 4px 14px rgba(29,158,117,0.28)' }
              }
            >
              {loading ? (
                <>
                  <span className="w-[13px] h-[13px] rounded-full animate-spin inline-block" style={{ border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff' }} />
                  En cours…
                </>
              ) : isExhausted ? 'Quota atteint' : (
                <>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M6 1v10M1 6h10"/></svg>
                  Générer
                </>
              )}
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex max-w-2xl mx-auto px-5 gap-6">
          {[['ideas', 'Idées IA'], ['bibliotheque', 'Bibliothèque']].map(([t, l]) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`py-3 text-[13px] font-[${tab === t ? '700' : '500'}] border-b-[2.5px] transition-all flex items-center gap-[6px] ${
                tab === t ? 'border-pc-green text-pc-ink' : 'border-transparent text-pc-ink-4 hover:text-pc-ink'
              }`}
            >
              {l}
              {t === 'bibliotheque' && savedIdeas.length > 0 && (
                <span className="text-[9px] font-[700] bg-pc-ink text-white rounded-full w-[17px] h-[17px] flex items-center justify-center">
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
            <div className="text-center py-16">
              <div className="w-12 h-12 rounded-full bg-pc-bg border border-pc-border flex items-center justify-center mx-auto mb-4">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#A3A3A3" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 2h10a1 1 0 011 1v14l-6-3-6 3V3a1 1 0 011-1z"/>
                </svg>
              </div>
              <div className="text-[15px] font-bold text-pc-ink mb-[6px]">Bibliothèque vide</div>
              <div className="text-[12px] text-pc-ink-3 leading-[1.6] max-w-[200px] mx-auto">Appuie sur l'icône signet d'une idée pour la sauvegarder ici.</div>
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
            <div
              className="rounded-[14px] px-4 py-3 flex items-center justify-between"
              style={{ background: 'rgba(29,158,117,0.06)', border: '1px solid rgba(29,158,117,0.15)' }}
            >
              <span className="text-[12px] text-pc-ink-2 font-[500]">
                <span className="font-[700] text-pc-green">Starter :</span> 1 plateforme.{' '}
                Pro = toutes.
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

          {/* Filters — pill chips */}
          <div className="space-y-2">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
              {PLATFORMS.map((p) => (
                <button
                  key={p}
                  onClick={() => setPlatform(p)}
                  className="whitespace-nowrap flex-shrink-0 text-[12px] font-[600] px-[14px] py-[6px] rounded-pill transition-all duration-150 press-scale"
                  style={platform === p
                    ? { background: '#0A0A0A', color: 'white' }
                    : { background: 'rgba(0,0,0,0.05)', color: '#737373' }
                  }
                >
                  {p}
                </button>
              ))}
            </div>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
              {FORMATS.map((f) => (
                <button
                  key={f}
                  onClick={() => setFormat(f)}
                  className="whitespace-nowrap flex-shrink-0 text-[12px] font-[600] px-[14px] py-[6px] rounded-pill transition-all duration-150 press-scale"
                  style={format === f
                    ? { background: '#1D9E75', color: 'white' }
                    : { background: 'rgba(0,0,0,0.05)', color: '#737373' }
                  }
                >
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

  const scoreColor = idea.score >= 80 ? '#1D9E75' : idea.score >= 60 ? '#F59E0B' : '#A3A3A3'

  return (
    <div
      className="bg-white overflow-hidden rounded-[20px]"
      style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.05)' }}
    >
      <div className="px-5 pt-5 pb-4">
        {/* Top row: platform + score + bookmark */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span
              className="text-[10px] font-[700] px-[9px] py-[4px] rounded-pill"
              style={
                idea.plateforme === 'TikTok'
                  ? { background: 'rgba(10,10,10,0.07)', color: '#0A0A0A' }
                  : idea.plateforme === 'Instagram'
                  ? { background: 'rgba(29,158,117,0.10)', color: '#1D9E75' }
                  : { background: 'rgba(37,99,235,0.08)', color: '#2563eb' }
              }
            >
              {idea.plateforme}
            </span>
            <span className="text-[11px] text-pc-ink-4 font-[500]">{idea.format}</span>
          </div>
          <div className="flex items-center gap-2">
            {idea.score && (
              <div
                className="text-[11px] font-[700] px-[8px] py-[3px] rounded-pill"
                style={{ background: `${scoreColor}14`, color: scoreColor }}
              >
                {idea.score}
              </div>
            )}
            <button
              onClick={(e) => onBookmark(idea, e)}
              className="w-8 h-8 flex items-center justify-center rounded-full transition-colors press-scale"
              style={{ background: isSaved ? 'rgba(29,158,117,0.10)' : 'rgba(0,0,0,0.04)' }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14"
                fill={isSaved ? '#1D9E75' : 'none'}
                stroke={isSaved ? '#1D9E75' : '#A3A3A3'}
                strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2.5 2h9a1 1 0 011 1v9l-5-3-5 3V3a1 1 0 011-1z"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Hook — the star */}
        <p className="text-[15px] font-[700] text-pc-ink leading-[1.5] mb-4 tracking-[-0.01em]">
          &ldquo;{idea.hook}&rdquo;
        </p>

        {/* Actions */}
        <div className="flex gap-2">
          {canBrief ? (
            <button
              onClick={() => onExpand(isExpanded ? null : idea.id)}
              className="flex-1 text-[12px] font-[600] py-[9px] rounded-pill transition-all press-scale"
              style={isExpanded
                ? { background: '#0A0A0A', color: 'white' }
                : { background: 'rgba(0,0,0,0.05)', color: '#404040' }
              }
            >
              {isExpanded ? '↑ Masquer' : 'Voir le brief'}
            </button>
          ) : (
            <div className="flex-1 flex items-center justify-center gap-2 rounded-pill py-[9px] text-[12px] text-pc-ink-4" style={{ background: 'rgba(0,0,0,0.04)' }}>
              Brief visuel <FeatureLock feature="briefVisuel" compact />
            </div>
          )}
          <button
            onClick={() => onSchedule(idea)}
            className="flex-1 text-[12px] font-[700] text-white rounded-pill py-[9px] transition-colors flex items-center justify-center gap-[6px] press-scale"
            style={{ background: '#1D9E75', boxShadow: '0 2px 10px rgba(29,158,117,0.25)' }}
          >
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <rect x="1" y="2" width="9" height="8" rx="1.5"/>
              <path d="M3.5 1v2M7.5 1v2M1 5h9"/>
            </svg>
            Planifier
          </button>
        </div>
      </div>

      {/* Expanded brief */}
      {isExpanded && canBrief && (
        <div className="border-t border-pc-rule px-5 py-5 space-y-5" style={{ background: '#FAFAF9' }}>
          <div>
            <p className="pc-section-label mb-2">Brief visuel</p>
            <p className="text-[13px] text-pc-ink-2 leading-[1.65] font-[450]">{idea.brief}</p>
          </div>
          <div>
            <p className="pc-section-label mb-2">Légende prête à poster</p>
            <p className="text-[13px] text-pc-ink-3 leading-[1.65] mb-3 font-[450]">{idea.legende}</p>
            <button
              onClick={(e) => onCopyLegend(idea.legende, e)}
              className="text-[12px] font-[600] text-pc-ink px-4 py-[7px] rounded-pill transition-colors press-scale"
              style={{ background: 'rgba(0,0,0,0.06)' }}
            >
              Copier la légende
            </button>
          </div>
          <div>
            <p className="pc-section-label mb-2">Hashtags viraux</p>
            {showHashtags ? (
              <>
                <div className="flex flex-wrap gap-[6px] mb-3">
                  {hashtags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[11px] font-[600] px-[10px] py-[4px] rounded-pill"
                      style={{ background: 'rgba(29,158,117,0.10)', color: '#1D9E75' }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <button
                  onClick={(e) => onCopyHashtags(hashtags, e)}
                  className="text-[12px] font-[600] text-pc-ink px-4 py-[7px] rounded-pill press-scale"
                  style={{ background: 'rgba(0,0,0,0.06)' }}
                >
                  Copier les hashtags
                </button>
              </>
            ) : (
              <button
                onClick={() => onHashtags(idea.id)}
                className="flex items-center gap-2 text-[12px] font-[600] text-pc-green px-4 py-[7px] rounded-pill press-scale"
                style={{ background: 'rgba(29,158,117,0.10)', border: '1px solid rgba(29,158,117,0.20)' }}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M2 4h8M2 8h8M5 1l-1 10M8 1l-1 10"/></svg>
                Générer les hashtags
              </button>
            )}
          </div>
          <div>
            <p className="pc-section-label mb-2">Script vidéo</p>
            <VideoScriptGenerator idea={idea} />
          </div>
        </div>
      )}
    </div>
  )
}
