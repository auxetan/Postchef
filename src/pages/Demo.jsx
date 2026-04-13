import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

const DEMO_STEPS = [
  {
    step: '01',
    title: 'Tu décris ton restaurant',
    desc: 'Nom, ville, cuisine, spécialité. 90 secondes maximum — PostChef apprend à te connaître une seule fois.',
    visual: (
      <div className="bg-white rounded-[16px] p-4 border border-pc-border space-y-2">
        {[
          { label: 'Nom', value: 'La Trattoria' },
          { label: 'Ville', value: 'Marseille' },
          { label: 'Cuisine', value: 'Italienne · Maison' },
        ].map((f) => (
          <div key={f.label} className="flex items-center justify-between text-[12px]">
            <span className="text-pc-ink-4 font-[500]">{f.label}</span>
            <span className="text-pc-ink font-[700]">{f.value}</span>
          </div>
        ))}
        <div className="mt-2 h-[2px] rounded-full bg-pc-green-light overflow-hidden">
          <div className="h-full w-3/4 rounded-full bg-pc-green" />
        </div>
      </div>
    ),
  },
  {
    step: '02',
    title: 'L\'IA génère tes idées',
    desc: 'Hooks, formats, plateformes — 8 idées personnalisées prêtes à tourner ou planifier.',
    visual: (
      <div className="space-y-2">
        {[
          { hook: '"Touristes vs locaux — ce qu\'ils commandent"', platform: 'TikTok', format: 'Reel', score: 92 },
          { hook: '"La pasta maison en 38 commandes cette semaine"', platform: 'Instagram', format: 'Carrousel', score: 85 },
          { hook: '"POV : table en terrasse un mardi midi"', platform: 'Instagram', format: 'Story', score: 78 },
        ].map((idea) => (
          <div key={idea.hook} className="bg-white rounded-[12px] p-3 border border-pc-border">
            <div className="text-[11px] font-[700] text-pc-ink mb-1 leading-snug">{idea.hook}</div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-[700] bg-pc-bg border border-pc-border text-pc-ink-3 px-2 py-[2px] rounded-full">{idea.platform}</span>
              <span className="text-[9px] text-pc-ink-4">{idea.format}</span>
              <span className="ml-auto text-[9px] font-[700] text-pc-green">{idea.score}</span>
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    step: '03',
    title: 'Tu planifies en un tap',
    desc: 'Chaque idée s\'ajoute au calendrier avec date, plateforme et statut. Zéro friction.',
    visual: (
      <div className="bg-white rounded-[16px] border border-pc-border overflow-hidden">
        {[
          { day: 'LUN 14', title: 'Touristes vs locaux', platform: 'TikTok', color: '#1D9E75' },
          { day: 'MER 16', title: 'Pasta maison · stats', platform: 'Instagram', color: '#3B82F6' },
          { day: 'VEN 18', title: 'Terrasse midi', platform: 'Instagram', color: '#F59E0B' },
        ].map((p, i) => (
          <div key={i} className={`flex items-center gap-3 px-4 py-3 ${i > 0 ? 'border-t border-pc-rule' : ''}`}>
            <div className="w-[5px] h-[5px] rounded-full flex-shrink-0" style={{ background: p.color }} />
            <span className="text-[10px] font-[700] text-pc-ink-4 w-14 flex-shrink-0">{p.day}</span>
            <span className="text-[11px] font-[600] text-pc-ink flex-1 truncate">{p.title}</span>
            <span className="text-[9px] font-[700] text-pc-ink-4">{p.platform}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    step: '04',
    title: 'Studio génère ton Reel',
    desc: 'Importe ton clip, Chef IA écrit le script, Monte et sous-titre. Prêt en 60 secondes.',
    visual: (
      <div className="bg-[#0A0A0A] rounded-[16px] p-4">
        <div className="text-[9px] text-white/40 font-[700] uppercase tracking-wider mb-2">Script généré</div>
        <div className="text-[11px] text-white/80 font-[500] leading-[1.7] mb-3">
          "38 personnes ont commandé cette pasta cette semaine. Voici pourquoi elle revient toutes les tables..."
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-[3px] rounded-full bg-white/10 overflow-hidden">
            <div className="h-full w-2/3 rounded-full bg-pc-green" />
          </div>
          <span className="text-[9px] text-white/40">0:42 / 0:58</span>
        </div>
      </div>
    ),
  },
]

export default function Demo() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-pc-bg">

      {/* Header */}
      <div
        className="sticky top-0 z-30 px-5 py-4 flex items-center justify-between"
        style={{
          background: 'rgba(247,247,245,0.90)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
        }}
      >
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-pc-ink-4 hover:text-pc-ink transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M10 3L5 8l5 5"/>
          </svg>
          <span className="text-[13px] font-[600]">Retour</span>
        </button>
        <span className="text-[16px] font-[800] text-pc-ink tracking-[-0.03em]">
          Post<span className="text-pc-green">Chef</span>
        </span>
        <button
          onClick={() => navigate('/signup')}
          className="bg-pc-green text-white text-[12px] font-[700] px-4 py-[8px] rounded-pill"
        >
          Essayer gratuitement
        </button>
      </div>

      {/* Hero */}
      <div className="px-5 pt-10 pb-6 max-w-[520px] mx-auto text-center">
        <div
          className="inline-flex items-center gap-2 mb-4 px-3 py-[6px] rounded-pill"
          style={{ background: 'rgba(29,158,117,0.10)', border: '1px solid rgba(29,158,117,0.20)' }}
        >
          <div className="w-[6px] h-[6px] rounded-full bg-pc-green" />
          <span className="text-[11px] font-[700] text-pc-green">Démo interactive</span>
        </div>
        <h1 className="text-[30px] font-[800] text-pc-ink tracking-[-0.04em] leading-tight mb-3">
          Comment fonctionne PostChef
        </h1>
        <p className="text-[14px] text-pc-ink-3 leading-[1.6]">
          Du premier post à un calendrier complet — voici les 4 étapes.
        </p>
      </div>

      {/* Steps */}
      <div className="px-5 pb-10 max-w-[520px] mx-auto space-y-6">
        {DEMO_STEPS.map((s, i) => (
          <motion.div
            key={s.step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.12, duration: 0.4, ease: 'easeOut' }}
            className="bg-white rounded-[20px] p-5 border border-pc-border"
            style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.04)' }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-pc-green flex items-center justify-center flex-shrink-0">
                <span className="text-[10px] font-[800] text-white">{s.step}</span>
              </div>
              <div>
                <div className="text-[15px] font-[800] text-pc-ink tracking-[-0.02em]">{s.title}</div>
                <div className="text-[12px] text-pc-ink-3 leading-snug mt-[2px]">{s.desc}</div>
              </div>
            </div>
            {s.visual}
          </motion.div>
        ))}
      </div>

      {/* CTA */}
      <div className="px-5 pb-12 max-w-[520px] mx-auto text-center">
        <div className="bg-white rounded-[24px] p-7 border border-pc-border" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
          <h2 className="text-[22px] font-[800] text-pc-ink tracking-[-0.03em] mb-2">Prêt à essayer ?</h2>
          <p className="text-[13px] text-pc-ink-3 mb-5">7 jours gratuits · sans carte bancaire · données préservées si tu changes de plan.</p>
          <button
            onClick={() => navigate('/signup')}
            className="w-full bg-pc-green text-white text-[15px] font-[700] py-[14px] rounded-pill mb-3"
            style={{ boxShadow: '0 4px 20px rgba(29,158,117,0.30)' }}
          >
            Commencer gratuitement
          </button>
          <button onClick={() => navigate('/')} className="text-[12px] text-pc-ink-4 hover:text-pc-ink transition-colors">
            Retour à l'accueil
          </button>
        </div>
      </div>
    </div>
  )
}
