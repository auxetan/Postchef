import { useState, useRef } from 'react'
import { mockPosts } from '../utils/mockData.js'
import useAppStore from '../store/useAppStore.js'
import useToastStore from '../store/useToastStore.js'
import PlanningModal from '../components/ui/PlanningModal.jsx'

const DAY_HEADERS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
const MONTH_NAMES = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']
const DAY_INDEX = { Lundi: 0, Mardi: 1, Mercredi: 2, Jeudi: 3, Vendredi: 4, Samedi: 5, Dimanche: 6 }

const STATUS_COLOR = {
  idee:       'bg-[#f3f4f6] text-[#374151] border-[#e5e7eb]',
  'a-tourner':'bg-[#fef3c7] text-[#92400e] border-[#fde68a]',
  publie:     'bg-pc-green-light text-pc-green-dark border-pc-green-mid',
}
const STATUS_LABEL = { idee: 'Idée', 'a-tourner': 'À tourner', publie: 'Publié' }
const STATUS_NEXT  = { idee: 'a-tourner', 'a-tourner': 'publie', publie: 'idee' }

const PLATFORM_PILL = {
  Instagram: 'bg-pc-green-light text-pc-green-dark',
  TikTok:    'bg-[#f3f4f6] text-[#374151]',
  Facebook:  'bg-[#eff6ff] text-[#1d4ed8]',
}

const STATUS_FILTERS = ['Tous', 'Idée', 'À tourner', 'Publié']
const STATUS_FILTER_MAP = { 'Idée': 'idee', 'À tourner': 'a-tourner', 'Publié': 'publie' }

function buildMonthGrid(year, month) {
  const firstDay = new Date(year, month, 1)
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const startOffset = (firstDay.getDay() + 6) % 7
  const grid = Array(startOffset).fill(null)
  for (let d = 1; d <= daysInMonth; d++) grid.push(d)
  while (grid.length % 7 !== 0) grid.push(null)
  return grid
}

export default function Calendar() {
  const today = new Date()
  const storePosts = useAppStore((s) => s.posts)
  const updatePostStatus = useAppStore((s) => s.updatePostStatus)
  const updatePostDate   = useAppStore((s) => s.updatePostDate)
  const removePost       = useAppStore((s) => s.removePost)
  const toast = useToastStore((s) => s.toast)

  const [viewYear, setViewYear]         = useState(today.getFullYear())
  const [viewMonth, setViewMonth]       = useState(today.getMonth())
  const [selectedDate, setSelectedDate] = useState(today.getDate())
  const [expandedPost, setExpandedPost] = useState(null)
  const [showPlanningModal, setShowPlanningModal] = useState(false)
  const [statusFilter, setStatusFilter] = useState('Tous')
  const [dragOverDay, setDragOverDay]   = useState(null)

  const draggingId = useRef(null)

  // ── Compute posts with dates ──────────────────────────────────────────────
  const todayDow = (today.getDay() + 6) % 7
  const monday = new Date(today)
  monday.setDate(today.getDate() - todayDow)

  const mockPostsWithDates = mockPosts.map((p) => {
    const dayIdx = DAY_INDEX[p.day] ?? 0
    const d = new Date(monday)
    d.setDate(monday.getDate() + dayIdx)
    return { ...p, dateNum: d.getDate(), postMonth: d.getMonth(), postYear: d.getFullYear(), _mock: true }
  })

  const storePostsWithDates = storePosts.map((p) => {
    if (p.date) {
      const d = new Date(p.date + 'T12:00:00')
      return { ...p, dateNum: d.getDate(), postMonth: d.getMonth(), postYear: d.getFullYear() }
    }
    const dayIdx = DAY_INDEX[p.day] ?? 0
    const d = new Date(monday)
    d.setDate(monday.getDate() + dayIdx)
    return { ...p, dateNum: d.getDate(), postMonth: d.getMonth(), postYear: d.getFullYear() }
  })

  const allPosts = [...mockPostsWithDates, ...storePostsWithDates]

  const filteredAll = statusFilter === 'Tous'
    ? allPosts
    : allPosts.filter((p) => p.status === STATUS_FILTER_MAP[statusFilter])

  const datesWithPosts = new Set(
    filteredAll
      .filter((p) => p.postMonth === viewMonth && p.postYear === viewYear)
      .map((p) => p.dateNum)
  )

  const postsForSelected = selectedDate
    ? filteredAll.filter(
        (p) => p.dateNum === selectedDate && p.postMonth === viewMonth && p.postYear === viewYear
      )
    : []

  const grid = buildMonthGrid(viewYear, viewMonth)
  const storePostIds = new Set(storePosts.map((p) => p.id))

  // ── Navigation ────────────────────────────────────────────────────────────
  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1) }
    else setViewMonth((m) => m - 1)
    setSelectedDate(null); setExpandedPost(null)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1) }
    else setViewMonth((m) => m + 1)
    setSelectedDate(null); setExpandedPost(null)
  }

  const isToday = (d) =>
    d === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear()

  const handleDayClick = (d) => {
    setSelectedDate(selectedDate === d ? null : d)
    setExpandedPost(null)
  }

  // ── Status toggle ─────────────────────────────────────────────────────────
  const handleStatusChange = (post) => {
    if (post._mock) return // mock posts are read-only
    const next = STATUS_NEXT[post.status]
    updatePostStatus(post.id, next)
    toast(`Statut → ${STATUS_LABEL[next]}`)
  }

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = (id) => {
    removePost(id)
    setExpandedPost(null)
    toast('Post supprimé')
  }

  // ── Drag & drop ───────────────────────────────────────────────────────────
  const handleDragStart = (postId) => { draggingId.current = postId }
  const handleDragEnd   = () => { draggingId.current = null; setDragOverDay(null) }

  const handleDrop = (targetDay) => {
    const id = draggingId.current
    draggingId.current = null
    setDragOverDay(null)
    if (!id) return
    const isoDate = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(targetDay).padStart(2, '0')}`
    updatePostDate(id, isoDate)
    setSelectedDate(targetDay)
    toast('Post déplacé ✓')
  }

  return (
    <div className="min-h-screen bg-pc-bg">
      {/* Header */}
      <div className="bg-pc-surface border-b border-pc-border px-6 pt-7 pb-5 sticky top-0 z-30">
        <div className="max-w-lg mx-auto">
          <h1 className="text-[26px] font-black tracking-[-0.04em] text-pc-ink leading-none">Calendrier</h1>
          <p className="text-[12px] text-pc-ink-4 mt-[6px] font-medium">{MONTH_NAMES[viewMonth]} {viewYear}</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-6 py-7 pb-28">

        {/* ── Calendar card ── */}
        <div className="bg-pc-surface rounded-card border border-pc-border p-5 mb-4">

          {/* Month navigation */}
          <div className="flex items-center justify-between mb-5">
            <button onClick={prevMonth} className="w-8 h-8 rounded-full border border-pc-border flex items-center justify-center text-pc-ink-3 hover:border-pc-green hover:text-pc-green transition-colors" aria-label="Mois précédent">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 2L4 7l5 5" /></svg>
            </button>
            <div className="text-[15px] font-bold text-pc-ink">{MONTH_NAMES[viewMonth]} {viewYear}</div>
            <button onClick={nextMonth} className="w-8 h-8 rounded-full border border-pc-border flex items-center justify-center text-pc-ink-3 hover:border-pc-green hover:text-pc-green transition-colors" aria-label="Mois suivant">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 2l5 5-5 5" /></svg>
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-1">
            {DAY_HEADERS.map((h) => (
              <div key={h} className="text-center text-[11px] font-semibold text-pc-ink-4 py-1">{h}</div>
            ))}
          </div>
          <div className="border-t border-pc-rule mb-2" />

          {/* Date grid */}
          <div className="grid grid-cols-7">
            {grid.map((d, i) => {
              if (d === null) {
                return (
                  <div
                    key={`pad-${i}`}
                    className="h-10"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => {}}
                  />
                )
              }
              const today_    = isToday(d)
              const selected_ = selectedDate === d
              const hasPost   = datesWithPosts.has(d)
              const isDragTarget = dragOverDay === d
              return (
                <div
                  key={`d-${d}`}
                  className={`flex flex-col items-center justify-center h-10 rounded-[8px] transition-colors ${isDragTarget ? 'bg-pc-green-light' : ''}`}
                  onDragOver={(e) => { e.preventDefault(); setDragOverDay(d) }}
                  onDragLeave={() => setDragOverDay(null)}
                  onDrop={() => handleDrop(d)}
                >
                  <button
                    onClick={() => handleDayClick(d)}
                    className="flex flex-col items-center w-full"
                  >
                    <span
                      className={`w-8 h-8 flex items-center justify-center rounded-full text-[13px] font-semibold transition-all
                        ${selected_
                          ? 'bg-pc-green text-white'
                          : today_
                          ? 'border-2 border-pc-green text-pc-green'
                          : isDragTarget
                          ? 'text-pc-green font-bold'
                          : 'text-pc-ink-2 hover:bg-pc-bg'}`}
                    >
                      {d}
                    </span>
                    {hasPost && (
                      <span className={`w-[4px] h-[4px] rounded-full mt-[2px] ${selected_ ? 'bg-white' : 'bg-pc-green'}`} />
                    )}
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Status filters ── */}
        <div className="flex gap-3 mb-4 overflow-x-auto scrollbar-hide">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`text-[12px] font-semibold pb-1 whitespace-nowrap flex-shrink-0 border-b-2 transition-all
                ${statusFilter === f ? 'border-pc-ink text-pc-ink' : 'border-transparent text-pc-ink-4 hover:text-pc-ink-2'}`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* ── Legend ── */}
        <div className="flex gap-4 mb-5">
          {[{ s: 'idee', l: 'Idée' }, { s: 'a-tourner', l: 'À tourner' }, { s: 'publie', l: 'Publié' }].map(({ s, l }) => (
            <div key={s} className="flex items-center gap-[6px]">
              <div className={`w-3 h-3 rounded-[3px] border ${STATUS_COLOR[s]}`} />
              <span className="text-[11px] text-pc-ink-3">{l}</span>
            </div>
          ))}
        </div>

        {/* ── Posts section ── */}
        {selectedDate ? (
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="text-[11px] font-semibold text-pc-ink-4 uppercase tracking-caps">
                {postsForSelected.length > 0
                  ? `${postsForSelected.length} post${postsForSelected.length > 1 ? 's' : ''} · ${selectedDate} ${MONTH_NAMES[viewMonth]}`
                  : `Aucun post · ${selectedDate} ${MONTH_NAMES[viewMonth]}`}
              </div>
              <button
                onClick={() => setShowPlanningModal(true)}
                className="text-[12px] font-semibold text-pc-green flex items-center gap-1 hover:text-pc-green-dark transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M6 1v10M1 6h10" /></svg>
                Planifier
              </button>
            </div>
            {postsForSelected.length === 0 ? (
              <button
                onClick={() => setShowPlanningModal(true)}
                className="w-full bg-pc-surface border-2 border-dashed border-pc-border rounded-card py-6 text-[13px] font-semibold text-pc-ink-4 hover:border-pc-green hover:text-pc-green transition-colors"
              >
                + Planifier un post
              </button>
            ) : (
              <PostList
                posts={postsForSelected}
                expandedPost={expandedPost}
                setExpandedPost={setExpandedPost}
                showDay={false}
                storePostIds={storePostIds}
                onStatusChange={handleStatusChange}
                onDelete={handleDelete}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                toast={toast}
              />
            )}
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="text-[11px] font-semibold text-pc-ink-4 uppercase tracking-caps">Posts de la semaine</div>
              <button
                onClick={() => setShowPlanningModal(true)}
                className="text-[12px] font-semibold text-pc-green flex items-center gap-1 hover:text-pc-green-dark transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M6 1v10M1 6h10" /></svg>
                Planifier
              </button>
            </div>
            <PostList
              posts={filteredAll.filter((p) => p.postMonth === viewMonth && p.postYear === viewYear)}
              expandedPost={expandedPost}
              setExpandedPost={setExpandedPost}
              showDay
              storePostIds={storePostIds}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              toast={toast}
            />
          </div>
        )}
      </div>

      {/* Planning modal */}
      {showPlanningModal && (
        <PlanningModal
          defaultDate={
            selectedDate
              ? `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(selectedDate).padStart(2, '0')}`
              : undefined
          }
          onClose={() => setShowPlanningModal(false)}
        />
      )}
    </div>
  )
}

// ── PostList ──────────────────────────────────────────────────────────────────
function PostList({ posts, expandedPost, setExpandedPost, showDay, storePostIds, onStatusChange, onDelete, onDragStart, onDragEnd, toast }) {
  if (posts.length === 0) {
    return (
      <div className="text-center py-8 text-pc-ink-4 text-[13px]">
        Aucun post pour ce filtre
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {posts.map((post) => {
        const isEditable = storePostIds.has(post.id)
        const isExpanded = expandedPost === post.id

        return (
          <div
            key={`${post.id}-${post.postMonth}`}
            draggable={isEditable}
            onDragStart={() => onDragStart(post.id)}
            onDragEnd={onDragEnd}
            onClick={() => setExpandedPost(isExpanded ? null : post.id)}
            className={`bg-pc-surface rounded-elem border cursor-pointer transition-all overflow-hidden select-none
              ${isExpanded ? 'border-pc-green' : 'border-pc-border hover:border-pc-green/40'}
              ${isEditable ? 'cursor-grab active:cursor-grabbing' : ''}`}
          >
            <div className="flex gap-[11px] items-start px-[15px] py-[13px]">
              {showDay && (
                <div className="text-[10px] font-bold text-pc-green uppercase tracking-[0.05em] min-w-[28px] pt-[2px]">
                  {post.dayShort}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold text-pc-ink mb-[4px]">{post.type}</div>
                <div className="text-[12px] text-pc-ink-3 leading-[1.5] mb-[6px]">{post.description}</div>
                <div className="flex gap-[5px] flex-wrap items-center">
                  {post.plateformes.map((p) => (
                    <span key={p} className={`text-[10px] font-semibold px-[7px] py-[2px] rounded-pill ${PLATFORM_PILL[p] || 'bg-pc-bg text-pc-ink-3'}`}>{p}</span>
                  ))}
                  {/* Clickable status badge */}
                  <button
                    onClick={(e) => { e.stopPropagation(); onStatusChange(post) }}
                    className={`text-[10px] font-semibold px-[7px] py-[2px] rounded-pill border transition-all
                      ${STATUS_COLOR[post.status]}
                      ${isEditable ? 'hover:opacity-70 cursor-pointer' : 'cursor-default'}`}
                    title={isEditable ? `Clic pour passer à "${STATUS_LABEL[STATUS_NEXT[post.status]]}"` : ''}
                  >
                    {STATUS_LABEL[post.status]}
                    {isEditable && <span className="ml-1 opacity-50">›</span>}
                  </button>
                  {isEditable && (
                    <span className="text-[9px] text-pc-ink-4" title="Drag pour déplacer">⋮⋮</span>
                  )}
                </div>
              </div>
              <svg
                className={`w-4 h-4 flex-shrink-0 transition-transform text-pc-ink-4 ${isExpanded ? 'rotate-180 text-pc-green' : ''}`}
                viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"
              >
                <path d="M4 6l4 4 4-4" strokeLinecap="round" />
              </svg>
            </div>

            {isExpanded && (
              <div className="px-[15px] pb-[15px] border-t border-pc-rule pt-[12px] space-y-3">
                {post.hook && (
                  <div>
                    <div className="text-[10px] font-semibold text-pc-ink-4 uppercase tracking-caps mb-1">Hook</div>
                    <div className="text-[13px] text-pc-ink font-medium">"{post.hook}"</div>
                  </div>
                )}
                {post.brief && (
                  <div>
                    <div className="text-[10px] font-semibold text-pc-ink-4 uppercase tracking-caps mb-1">Brief</div>
                    <div className="text-[12px] text-pc-ink-3 leading-[1.6]">{post.brief}</div>
                  </div>
                )}
                {post.legende && (
                  <div>
                    <div className="text-[10px] font-semibold text-pc-ink-4 uppercase tracking-caps mb-1">Légende</div>
                    <div className="text-[12px] text-pc-ink-3 leading-[1.6] mb-2">{post.legende}</div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        navigator.clipboard?.writeText(post.legende)
                        toast('Légende copiée')
                      }}
                      className="text-[12px] font-semibold text-pc-green border border-pc-green rounded-pill px-3 py-[5px] hover:bg-pc-green hover:text-white transition-colors"
                    >
                      Copier la légende
                    </button>
                  </div>
                )}
                {/* Delete button — store posts only */}
                {isEditable && (
                  <div className="pt-1 border-t border-pc-rule">
                    <button
                      onClick={(e) => { e.stopPropagation(); onDelete(post.id) }}
                      className="text-[12px] font-semibold text-[#ef4444] border border-[#fecaca] rounded-pill px-3 py-[5px] hover:bg-[#fef2f2] transition-colors flex items-center gap-1"
                    >
                      <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                        <path d="M1.5 3h8M4 3V2h3v1M9 3l-.7 6H2.7L2 3" />
                      </svg>
                      Supprimer ce post
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
