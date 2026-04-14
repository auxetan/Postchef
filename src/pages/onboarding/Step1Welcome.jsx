import Button from '../../components/ui/Button.jsx'
import { PC_GREEN } from '../../utils/colors.js'

const BENEFITS = [
  {
    title: '5 questions',
    sub: 'Profil complet en moins de 2 min',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke={PC_GREEN} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="9" r="7.5"/>
        <path d="M9 6v4l2.5 1.5"/>
      </svg>
    ),
  },
  {
    title: 'Idées IA sur mesure',
    sub: 'Hooks, formats, légendes prêts à poster',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke={PC_GREEN} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 2l1.8 5H16l-4.2 3 1.6 5L9 12.5 5.6 15l1.6-5L3 7h5.2z"/>
      </svg>
    ),
  },
  {
    title: 'Gratuit pour commencer',
    sub: 'Sans CB — upgrade quand tu veux',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke={PC_GREEN} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l5 5 7-8"/>
      </svg>
    ),
  },
]

export default function Step1Welcome({ onNext }) {
  return (
    <div className="flex flex-col h-full min-h-screen">
      <div className="flex-1 px-6 pt-10 pb-[100px]">

        {/* Chef icon */}
        <div className="w-[72px] h-[72px] rounded-[22px] bg-pc-green-light flex items-center justify-center mb-8">
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none" stroke={PC_GREEN} strokeWidth="1.8" strokeLinecap="round">
            <circle cx="18" cy="12" r="6" fill={PC_GREEN} stroke="none"/>
            <path d="M5 34c0-7.18 5.82-13 13-13s13 5.82 13 13" strokeWidth="2.2"/>
          </svg>
        </div>

        <h1 className="text-[34px] font-black tracking-[-0.04em] text-pc-ink leading-[1.1] mb-4">
          Ton resto<br/>mérite d'être<br/>vu.
        </h1>
        <p className="text-[15px] text-pc-ink-3 leading-[1.6] mb-10">
          PostChef génère tes idées TikTok & Instagram en 3 minutes — adaptées à ta cuisine, ta clientèle, ton rythme.
        </p>

        <div className="space-y-4">
          {BENEFITS.map((b) => (
            <div key={b.title} className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-[10px] bg-pc-green-light flex items-center justify-center flex-shrink-0 mt-[2px]">
                {b.icon}
              </div>
              <div>
                <p className="text-[14px] font-bold text-pc-ink leading-none mb-[3px]">{b.title}</p>
                <p className="text-[12px] text-pc-ink-4">{b.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 md:absolute px-6 pb-8 pt-4 bg-white border-t border-pc-rule max-w-[360px] md:mx-auto w-full">
        <Button fullWidth onClick={onNext}>
          Commencer — c'est gratuit
        </Button>
      </div>
    </div>
  )
}
