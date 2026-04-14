import { Fragment, useMemo } from 'react'
import useFeatureAccess from '../hooks/useFeatureAccess.js'
import FeatureLock from '../components/ui/FeatureLock.jsx'
import DemoBadge from '../components/ui/DemoBadge.jsx'
import useAppStore from '../store/useAppStore.js'
import { mockStats } from '../utils/mockData.js'
import { PC_INK } from '../utils/colors.js'

const WEEKS = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7']

const HEATMAP_DAYS  = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
const SLOTS         = ['Matin', 'Midi', 'Soir', 'Nuit']
const HEATMAP_DATA  = [
  [2, 1, 3, 1],
  [1, 3, 2, 1],
  [2, 2, 4, 1],
  [1, 2, 3, 1],
  [3, 2, 5, 2],
  [4, 3, 4, 2],
  [3, 2, 3, 1],
]

function heatOpacity(v) {
  // 1→5 mapped to opacity 0.12→1
  return Math.min(0.15 + (v / 5) * 0.85, 1)
}

function Rule({ children, action }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="pc-section-label">{children}</span>
      <div className="flex-1 h-px bg-pc-rule" />
      {action}
    </div>
  )
}

export default function Analytics() {
  const { can } = useFeatureAccess()

  // ── Vraies données depuis le store ──────────────────────────────────────────
  const posts    = useAppStore((s) => s.posts)
  const reels    = useAppStore((s) => s.reels)
  const usage    = useAppStore((s) => s.usage)
  const savedIdeas = useAppStore((s) => s.savedIdeas)

  const realStats = useMemo(() => {
    const published = posts.filter((p) => p.status === 'publie').length
    const byDay     = posts.reduce((acc, p) => {
      const d = p.day || p.dayShort || ''
      if (d) acc[d] = (acc[d] || 0) + 1
      return acc
    }, {})
    const bestDay = Object.entries(byDay).sort((a, b) => b[1] - a[1])[0]?.[0] || '—'

    // Posts par semaine (7 dernières semaines) basés sur post.date
    const now = new Date()
    const weeklyPosts = Array(7).fill(0)
    posts.forEach((p) => {
      if (!p.date) return
      const d    = new Date(p.date + 'T12:00:00')
      const diff = Math.floor((now - d) / (7 * 24 * 3600 * 1000))
      const idx  = 6 - diff // semaine la plus récente = index 6
      if (idx >= 0 && idx < 7) weeklyPosts[idx]++
    })

    return {
      totalPosts:  posts.length,
      published,
      planned:     posts.filter((p) => p.status !== 'publie').length,
      reels:       reels.length,
      ideasUsed:   usage.ideasUsedThisWeek ?? 0,
      captions:    usage.captionUsedThisMonth ?? 0,
      savedIdeas:  savedIdeas.length,
      bestDay,
      weeklyPosts,
    }
  }, [posts, reels, usage, savedIdeas])

  return (
    <div className="min-h-screen bg-pc-bg">

      {/* Header */}
      <div className="bg-pc-surface border-b border-pc-border px-6 pt-7 pb-5 sticky top-0 z-30">
        <div className="max-w-3xl mx-auto lg:max-w-5xl">
          <h1 className="text-[26px] font-black tracking-[-0.04em] text-pc-ink leading-none">Analytics</h1>
          <p className="text-[12px] text-pc-ink-4 mt-[6px] font-medium">Activité PostChef en temps réel · réseaux sociaux à venir</p>
        </div>
      </div>

      <div className="px-6 py-7 max-w-3xl mx-auto lg:max-w-5xl space-y-8">

        {/* ── Section 1 : VRAIES données PostChef ─────────────────────────── */}
        <div>
          <Rule>Activité PostChef</Rule>
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-3">
            {[
              { val: realStats.totalPosts,  lbl: 'Posts créés',         sub: `${realStats.published} publiés` },
              { val: realStats.reels,       lbl: 'Reels Studio',        sub: 'générés' },
              { val: realStats.ideasUsed,   lbl: 'Idées générées',      sub: 'cette semaine' },
              { val: realStats.captions,    lbl: 'Légendes générées',   sub: 'ce mois' },
              { val: realStats.savedIdeas,  lbl: 'Idées sauvegardées',  sub: 'bibliothèque' },
              { val: realStats.bestDay || '—', lbl: 'Jour le plus actif', sub: 'posts créés' },
            ].map((m) => (
              <div key={m.lbl} className="bg-pc-surface border border-pc-border rounded-card px-5 py-5">
                <div className="text-[36px] font-black tracking-[-0.05em] leading-none text-pc-ink pc-num">
                  {m.val}
                </div>
                <div className="text-[11px] font-medium text-pc-ink-4 mt-2 leading-tight">{m.lbl}</div>
                <div className="text-[10px] text-pc-ink-4 mt-[2px]">{m.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Section 2 : Stats réseaux simulées (Pro+) ───────────────────── */}
        {can('analyticsStandard') ? (
          <>
            {/* KPI grid */}
            <div>
              <Rule action={<DemoBadge variant="simule" label="Simulé" />}>Réseaux sociaux</Rule>
              <p className="text-[11px] text-pc-ink-4 mb-3">Connexion TikTok/Instagram à venir — chiffres illustratifs.</p>
              <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
                {[
                  { val: mockStats.postsThisMonth,                lbl: 'Posts ce mois',      delta: '+3',       up: true  },
                  { val: mockStats.totalViews.toLocaleString('fr'), lbl: 'Vues estimées',     delta: '+18%',     up: true  },
                  { val: `${mockStats.engagementRate}%`,           lbl: 'Taux d\'engagement', delta: '+0.6pts',  up: true  },
                  { val: mockStats.bestDay,                        lbl: 'Meilleur jour',     delta: '2×',    up: true  },
                ].map((m, i) => (
                  <div key={i} className="bg-pc-surface border border-pc-border rounded-card px-5 py-5">
                    <div className="text-[36px] font-black tracking-[-0.05em] leading-none text-pc-ink pc-num">
                      {m.val}
                    </div>
                    <div className="text-[11px] font-medium text-pc-ink-4 mt-3 leading-tight">{m.lbl}</div>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-[10px] font-bold text-pc-green">{m.delta}</span>
                      <span className="text-[10px] text-pc-ink-4">vs mois préc.</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bar chart — posts créés par semaine (vraies données) */}
            <div>
              <Rule>Posts créés par semaine</Rule>
              <div className="bg-pc-surface border border-pc-border rounded-card px-5 py-5">
                {realStats.weeklyPosts.every((v) => v === 0) ? (
                  <p className="text-[12px] text-pc-ink-4 text-center py-6">Crée tes premiers posts pour voir les stats ici.</p>
                ) : (
                  <div className="flex items-end gap-2 h-[100px]">
                    {realStats.weeklyPosts.map((v, i) => {
                      const maxV = Math.max(...realStats.weeklyPosts, 1)
                      const pct  = (v / maxV) * 100
                      const isHi = v === maxV && v > 0
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-2">
                          <div className="w-full relative" style={{ height: '80px' }}>
                            <div
                              className="absolute bottom-0 left-0 right-0 rounded-t-[4px] transition-all duration-500"
                              style={{
                                height: `${Math.max(pct, v > 0 ? 8 : 0)}%`,
                                backgroundColor: isHi ? PC_INK : '#E8E8E6',
                              }}
                            />
                          </div>
                          <span className="text-[9px] font-bold text-pc-ink-4 uppercase">{WEEKS[i]}</span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Top posts */}
            <div>
              <Rule>Top posts</Rule>
              <div className="bg-pc-surface border border-pc-border rounded-card divide-y divide-pc-rule">
                {mockStats.topPosts.map((p, i) => (
                  <div key={i} className="flex items-center gap-4 px-5 py-4">
                    <div className={`text-[13px] font-black tracking-[-0.02em] w-5 flex-shrink-0
                      ${i === 0 ? 'text-pc-ink' : 'text-pc-ink-4'}`}>
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-pc-ink truncate">{p.type}</p>
                      <p className="text-[11px] text-pc-ink-4 mt-[2px]">{p.plateforme} · {p.vues.toLocaleString('fr')} vues</p>
                    </div>
                    <div className="text-[13px] font-bold text-pc-green flex-shrink-0">{p.engagement}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <FeatureLock feature="analyticsStandard" title="Analytics PostChef"
            description="Stats de performance, vues, taux d'engagement, top posts — dès le plan Pro.">
            <div className="grid grid-cols-2 gap-2 mb-3 opacity-40 pointer-events-none select-none">
              {['12', '4 821', '3.2%', 'Vendredi'].map((v, i) => (
                <div key={i} className="bg-white border border-pc-border rounded-card px-4 py-4">
                  <div className="text-[28px] font-black text-pc-ink">{v}</div>
                  <div className="h-2 bg-pc-rule rounded mt-3 w-2/3" />
                </div>
              ))}
            </div>
          </FeatureLock>
        )}

        {/* Recommandations — Pro Annuel */}
        <div>
          <Rule action={!can('analyticsAdvanced') && <FeatureLock feature="analyticsAdvanced" compact />}>
            Recommandations Chef
          </Rule>
          {can('analyticsAdvanced') ? (
            <div className="bg-pc-surface border border-pc-border rounded-card divide-y divide-pc-rule">
              {[
                'Tes posts le vendredi soir performent 2× mieux — programme plus sur ce créneau.',
                'Les vidéos courtes génèrent 4× plus de vues que les photos sur ton compte.',
                'Teste un carrousel cette semaine — format peu utilisé = plus de portée organique.',
              ].map((r, i) => (
                <div key={i} className="flex items-start gap-4 px-5 py-4">
                  <div className="w-1 h-full self-stretch rounded-full bg-pc-green flex-shrink-0 mt-[2px]" style={{ minHeight: 20, width: 2 }} />
                  <p className="text-[13px] text-pc-ink-2 leading-[1.6]">{r}</p>
                </div>
              ))}
            </div>
          ) : (
            <FeatureLock feature="analyticsAdvanced" title="Recommandations IA"
              description="Chef analyse tes performances et te donne des conseils personnalisés." />
          )}
        </div>

        {/* Heatmap — Pro Annuel */}
        <div>
          <Rule action={!can('analyticsAdvanced') && <FeatureLock feature="analyticsAdvanced" compact />}>
            Meilleurs créneaux
          </Rule>
          {can('analyticsAdvanced') ? (
            <div className="bg-pc-surface border border-pc-border rounded-card p-5">
              {/* Slot headers */}
              <div className="grid gap-[6px] mb-[6px]" style={{ gridTemplateColumns: `32px repeat(${SLOTS.length}, 1fr)` }}>
                <div />
                {SLOTS.map((s) => (
                  <div key={s} className="text-[9px] font-bold text-pc-ink-4 text-center uppercase tracking-[0.06em]">{s}</div>
                ))}
              </div>
              {/* Grid */}
              <div className="grid gap-[4px]" style={{ gridTemplateColumns: `32px repeat(${SLOTS.length}, 1fr)` }}>
                {HEATMAP_DAYS.map((day, di) => (
                  <Fragment key={day}>
                    <div className="text-[10px] font-bold text-pc-ink-4 flex items-center">{day}</div>
                    {HEATMAP_DATA[di].map((v, si) => (
                      <div
                        key={si}
                        className="rounded-[5px] h-8 flex items-center justify-center text-[10px] font-bold"
                        style={{
                          backgroundColor: `rgba(29, 158, 117, ${heatOpacity(v)})`,
                          color: v >= 3 ? 'white' : PC_INK,
                        }}
                      >
                        {v}
                      </div>
                    ))}
                  </Fragment>
                ))}
              </div>
              {/* Legend */}
              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-pc-rule">
                <span className="text-[10px] text-pc-ink-4 font-medium">Faible</span>
                <div className="flex gap-[3px] flex-1">
                  {[1,2,3,4,5].map((v) => (
                    <div key={v} className="flex-1 h-[6px] rounded-full"
                      style={{ backgroundColor: `rgba(29, 158, 117, ${heatOpacity(v)})` }} />
                  ))}
                </div>
                <span className="text-[10px] text-pc-ink-4 font-medium">Fort</span>
              </div>
            </div>
          ) : (
            <FeatureLock feature="analyticsAdvanced" title="Heatmap des créneaux"
              description="Identifie exactement quand poster pour maximiser tes vues." />
          )}
        </div>

      </div>
    </div>
  )
}
