import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import useAppStore from '../../store/useAppStore.js'
import useToastStore from '../../store/useToastStore.js'
import { getFeature } from '../../utils/plans.js'

const PLATFORMS = ['Instagram', 'TikTok', 'Facebook']

const FR_DAYS       = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
const FR_DAYS_SHORT = ['DIM', 'LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM']

function isoToFrDay(iso) {
  const d = new Date(iso + 'T12:00:00')
  return FR_DAYS[d.getDay()]
}
function isoToFrDayShort(iso) {
  const d = new Date(iso + 'T12:00:00')
  return FR_DAYS_SHORT[d.getDay()]
}
function todayISO() {
  return new Date().toISOString().split('T')[0]
}

/** Retourne la date ISO du lundi de la semaine contenant `isoDate` */
function getMondayOf(isoDate) {
  const d   = new Date(isoDate + 'T12:00:00')
  const day = d.getDay() // 0=Dim
  const diff = day === 0 ? -6 : 1 - day
  const monday = new Date(d)
  monday.setDate(d.getDate() + diff)
  return monday.toISOString().split('T')[0]
}

/** Retourne la date ISO du dimanche de la semaine contenant `isoDate` */
function getSundayOf(isoDate) {
  const monday = new Date(getMondayOf(isoDate) + 'T12:00:00')
  monday.setDate(monday.getDate() + 6)
  return monday.toISOString().split('T')[0]
}

export default function PlanningModal({ idea, defaultDate, onClose }) {
  const navigate  = useNavigate()
  const addPost   = useAppStore((s) => s.addPost)
  const posts     = useAppStore((s) => s.posts)
  const plan      = useAppStore((s) => s.user.plan)
  const toast     = useToastStore((s) => s.toast)

  const [date, setDate]                         = useState(defaultDate || todayISO())
  const [selectedPlatforms, setSelectedPlatforms] = useState(
    idea?.plateforme ? [idea.plateforme] : ['Instagram']
  )
  const [title, setTitle] = useState(idea?.format || 'Post')

  const weekMax = getFeature(plan, 'calendarPostsPerWeek') // 3 | 14 | Infinity

  // Nombre de posts déjà planifiés dans la semaine de la date sélectionnée
  const postsThisWeek = useMemo(() => {
    if (weekMax === Infinity || !date) return 0
    const monday = getMondayOf(date)
    const sunday = getSundayOf(date)
    return posts.filter((p) => p.date >= monday && p.date <= sunday).length
  }, [posts, date, weekMax])

  const weekQuotaReached = weekMax !== Infinity && postsThisWeek >= weekMax
  const weekRemaining    = weekMax === Infinity ? Infinity : Math.max(0, weekMax - postsThisWeek)

  const togglePlatform = (p) => {
    setSelectedPlatforms((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    )
  }

  const handleConfirm = () => {
    if (!date) return
    if (selectedPlatforms.length === 0) return
    if (weekQuotaReached) return

    addPost({
      id: `post-${Date.now()}`,
      date,
      day:        isoToFrDay(date),
      dayShort:   isoToFrDayShort(date),
      type:       title,
      description: idea?.hook || '',
      hook:       idea?.hook || '',
      brief:      idea?.brief || '',
      legende:    idea?.legende || '',
      plateformes: selectedPlatforms,
      status:     'idee',
    })

    toast('Post ajouté au calendrier ✓')
    onClose()
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 z-[100] flex items-end sm:items-center justify-center px-0 sm:px-4"
      onClick={onClose}
    >
      <div
        className="bg-pc-surface w-full sm:max-w-sm rounded-t-[24px] sm:rounded-card p-5 pb-8 sm:pb-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="w-10 h-1 bg-pc-border rounded-full mx-auto mb-4 sm:hidden" />

        <h3 className="text-[17px] font-extrabold text-pc-ink tracking-[-0.4px] mb-4">
          Planifier ce post
        </h3>

        {/* Idea preview */}
        {idea && (
          <div className="bg-pc-bg rounded-elem px-4 py-3 mb-4">
            <div className="text-[12px] font-semibold text-pc-ink-4 uppercase tracking-caps mb-1">Hook</div>
            <div className="text-[13px] font-semibold text-pc-ink leading-snug">"{idea.hook}"</div>
          </div>
        )}

        {/* Titre du post */}
        <div className="mb-4">
          <label className="text-[11px] font-semibold text-pc-ink-4 uppercase tracking-caps mb-1 block">
            Type de contenu
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-pc-border rounded-elem px-4 py-[10px] text-[14px] text-pc-ink focus:outline-none focus:border-pc-green focus:ring-2 focus:ring-pc-green/20 transition-all"
          />
        </div>

        {/* Date */}
        <div className="mb-4">
          <label className="text-[11px] font-semibold text-pc-ink-4 uppercase tracking-caps mb-1 block">
            Date de publication
          </label>
          <input
            type="date"
            value={date}
            min={todayISO()}
            onChange={(e) => setDate(e.target.value)}
            className="w-full border border-pc-border rounded-elem px-4 py-[10px] text-[14px] text-pc-ink focus:outline-none focus:border-pc-green focus:ring-2 focus:ring-pc-green/20 transition-all"
          />
        </div>

        {/* Quota calendrier */}
        {weekMax !== Infinity && date && (
          <div className={`text-[11px] font-medium mb-4 flex items-center justify-between
            ${weekQuotaReached ? 'text-pc-danger' : 'text-pc-ink-4'}`}>
            <span>
              {weekQuotaReached
                ? `Limite atteinte : ${weekMax} posts/semaine sur ce plan`
                : `${weekRemaining} post${weekRemaining > 1 ? 's' : ''} restant${weekRemaining > 1 ? 's' : ''} cette semaine`}
            </span>
            {weekQuotaReached && (
              <button onClick={() => { onClose(); navigate('/app/account') }}
                className="font-bold text-pc-green underline ml-2 flex-shrink-0">
                Upgrader
              </button>
            )}
          </div>
        )}

        {/* Plateformes */}
        <div className="mb-5">
          <label className="text-[11px] font-semibold text-pc-ink-4 uppercase tracking-caps mb-2 block">
            Plateforme
          </label>
          <div className="flex gap-2">
            {PLATFORMS.map((p) => (
              <button
                key={p}
                onClick={() => togglePlatform(p)}
                className={`flex-1 py-[9px] rounded-pill text-[12px] font-semibold border transition-all
                  ${selectedPlatforms.includes(p)
                    ? 'bg-pc-green text-white border-pc-green'
                    : 'border-pc-border text-pc-ink-3 hover:border-pc-green'
                  }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-[11px] rounded-pill border border-pc-border text-[13px] font-semibold text-pc-ink hover:bg-pc-bg transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleConfirm}
            disabled={!date || selectedPlatforms.length === 0 || weekQuotaReached}
            className="flex-1 py-[11px] rounded-pill bg-pc-green text-white text-[13px] font-bold hover:bg-pc-green-dark transition-colors disabled:opacity-50"
          >
            Planifier
          </button>
        </div>
      </div>
    </div>
  )
}
