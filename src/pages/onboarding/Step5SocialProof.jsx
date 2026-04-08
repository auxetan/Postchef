import Button from '../../components/ui/Button.jsx'

const BARS = [
  { label: '1/sem', before: 34, after: 40 },
  { label: '2–3/sem', before: 34, after: 62 },
  { label: '4–5/sem', before: 34, after: 88 },
  { label: '6–7/sem', before: 34, after: 110 },
]

export default function Step5SocialProof({ onNext }) {
  return (
    <div className="flex flex-col h-full min-h-screen">
      <div className="flex-1 px-6 pt-7 pb-[100px] space-y-6 overflow-y-auto">

        {/* Step title */}
        <div>
          <h2 className="text-[26px] font-black tracking-[-0.04em] text-pc-ink leading-none mb-1">
            Les chiffres parlent.
          </h2>
          <p className="text-[13px] text-pc-ink-4">Ce que les restos PostChef observent en moyenne.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { val: '+3h', lbl: 'gagnées / semaine' },
            { val: '×4',  lbl: 'portée organique' },
            { val: '850+', lbl: 'restos actifs' },
          ].map((s) => (
            <div key={s.val} className="bg-pc-green-light rounded-card py-4 px-2 text-center border border-pc-green/20">
              <div className="text-[22px] font-black tracking-[-0.04em] text-pc-green leading-none mb-1">{s.val}</div>
              <div className="text-[10px] text-pc-ink-3 leading-[1.3] font-medium">{s.lbl}</div>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="bg-pc-surface border border-pc-border rounded-card p-4">
          <p className="text-[11px] font-semibold text-pc-ink-4 mb-4 text-center uppercase tracking-[0.05em]">
            Posts / sem → CA mensuel
          </p>
          <div className="relative h-[130px] flex items-end gap-1 pb-[22px] pl-7">
            <div className="absolute left-0 top-0 bottom-[22px] flex flex-col justify-between w-[26px]">
              <span className="text-[9px] text-pc-ink-4 text-right">+80%</span>
              <span className="text-[9px] text-pc-ink-4 text-right">+40%</span>
              <span className="text-[9px] text-pc-ink-4 text-right">0%</span>
            </div>
            <div className="flex-1 flex gap-[6px] items-end">
              {BARS.map((b) => (
                <div key={b.label} className="flex-1 flex flex-col items-center gap-[2px]">
                  <div className="flex gap-[2px] items-end w-full">
                    <div className="flex-1 bg-pc-border rounded-t-[5px]" style={{ height: b.before }} />
                    <div className="flex-1 bg-pc-green rounded-t-[5px]" style={{ height: b.after }} />
                  </div>
                  <span className="text-[9px] text-pc-ink-4">{b.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-4 justify-center mt-1">
            <div className="flex items-center gap-[5px] text-[10px] text-pc-ink-4">
              <div className="w-[10px] h-[10px] rounded-[2px] bg-pc-border" />
              Avant
            </div>
            <div className="flex items-center gap-[5px] text-[10px] text-pc-ink-4">
              <div className="w-[10px] h-[10px] rounded-[2px] bg-pc-green" />
              Avec PostChef
            </div>
          </div>
        </div>

        {/* Testimonial */}
        <div className="bg-pc-surface border border-pc-border rounded-card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-pc-green text-white text-[13px] font-black flex items-center justify-center flex-shrink-0">
              SR
            </div>
            <div>
              <div className="text-[13px] font-bold text-pc-ink leading-none">Sophie R.</div>
              <div className="text-[11px] text-pc-ink-4 mt-[2px]">Chez Sophie · Aix-en-Provence</div>
            </div>
            <div className="ml-auto text-[#f59e0b] text-[12px] tracking-[1px]">★★★★★</div>
          </div>
          <p className="text-[13px] text-pc-ink-2 leading-[1.65]">
            "En 3 semaines, mes Reels ont doublé ma file d'attente le vendredi soir."
          </p>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 md:absolute px-6 pb-8 pt-4 bg-white border-t border-pc-rule max-w-[360px] md:mx-auto w-full">
        <Button fullWidth onClick={onNext}>
          Je veux mon plan
        </Button>
      </div>
    </div>
  )
}
