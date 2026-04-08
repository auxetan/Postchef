import Button from '../../components/ui/Button.jsx'
import ChefAvatar from '../../components/ui/ChefAvatar.jsx'

const BARS = [
  { label: '0–1/sem', before: 34, after: 40 },
  { label: '2–3/sem', before: 34, after: 62 },
  { label: '4–5/sem', before: 34, after: 88 },
  { label: '6–7/sem', before: 34, after: 110 },
]

export default function Step5SocialProof({ onNext }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 px-5 pt-4 pb-[90px]">
        {/* Chef bubble */}
        <div className="flex items-start gap-[10px] mb-4">
          <ChefAvatar size={32} />
          <div className="bg-pc-divider rounded-[20px_20px_20px_4px] px-4 py-[11px] text-[13px] leading-[1.55] text-[#111] flex-1">
            Les données parlent d'elles-mêmes.
          </div>
        </div>

        {/* Chart */}
        <div className="bg-pc-bg rounded-elem p-4 mb-4">
          <div className="text-[12px] font-semibold text-pc-muted mb-3 text-center">
            Fréquence de posts vs chiffre d'affaires mensuel
          </div>
          <div className="relative h-[150px] flex items-end gap-1 pb-[22px] pl-7">
            {/* Y axis */}
            <div className="absolute left-0 top-0 bottom-[22px] flex flex-col justify-between w-[26px]">
              <span className="text-[9px] text-pc-hint text-right">+80%</span>
              <span className="text-[9px] text-pc-hint text-right">+40%</span>
              <span className="text-[9px] text-pc-hint text-right">0%</span>
            </div>
            {/* Bars */}
            <div className="flex-1 flex gap-[6px] items-end">
              {BARS.map((b) => (
                <div key={b.label} className="flex-1 flex flex-col items-center gap-[2px]">
                  <div className="flex gap-[2px] items-end w-full">
                    <div
                      className="flex-1 bg-pc-border rounded-t-[5px]"
                      style={{ height: b.before }}
                    />
                    <div
                      className="flex-1 bg-pc-green rounded-t-[5px]"
                      style={{ height: b.after }}
                    />
                  </div>
                  <span className="text-[9px] text-pc-hint">{b.label}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Legend */}
          <div className="flex gap-3 justify-center mt-[6px]">
            <div className="flex items-center gap-[5px] text-[10px] text-pc-muted">
              <div className="w-[10px] h-[10px] rounded-[2px] bg-pc-border" />
              Avant PostChef
            </div>
            <div className="flex items-center gap-[5px] text-[10px] text-pc-muted">
              <div className="w-[10px] h-[10px] rounded-[2px] bg-pc-green" />
              Avec PostChef
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { val: '+3h', lbl: 'gagnées par semaine' },
            { val: '×4', lbl: 'portée organique' },
            { val: '850+', lbl: 'restos actifs' },
          ].map((s) => (
            <div key={s.val} className="bg-pc-green-light rounded-[14px] py-3 px-2 text-center">
              <div className="text-[20px] font-extrabold text-pc-green-dark">{s.val}</div>
              <div className="text-[10px] text-pc-green-mid mt-[2px] leading-[1.3]">{s.lbl}</div>
            </div>
          ))}
        </div>

        {/* Testimonial */}
        <div className="bg-white rounded-elem border border-pc-divider p-[14px]">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-pc-green text-white text-[12px] font-bold flex items-center justify-center">
              SR
            </div>
            <div>
              <div className="text-[13px] font-bold text-[#111]">Sophie R.</div>
              <div className="text-[11px] text-pc-hint">Chez Sophie · Aix-en-Provence</div>
            </div>
          </div>
          <div className="text-[#f59e0b] text-[11px] tracking-[1px] mb-1">★★★★★</div>
          <div className="text-[12px] text-[#374151] leading-[1.6]">
            "En 3 semaines, mes Reels ont doublé ma file d'attente le vendredi soir."
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 px-5 pb-7 pt-[14px] bg-white">
        <Button fullWidth onClick={onNext}>
          Je veux mon plan
        </Button>
      </div>
    </div>
  )
}
