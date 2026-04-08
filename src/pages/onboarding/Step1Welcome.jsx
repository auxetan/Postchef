import Button from '../../components/ui/Button.jsx'

export default function Step1Welcome({ onNext }) {
  return (
    <div className="flex flex-col h-full min-h-screen">
      <div className="flex-1 px-6 pt-10 pb-[100px]">

        {/* Chef icon */}
        <div className="w-[72px] h-[72px] rounded-[22px] bg-pc-green-light flex items-center justify-center mb-8">
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <circle cx="18" cy="12" r="6" fill="#1D9E75"/>
            <path d="M5 34c0-7.18 5.82-13 13-13s13 5.82 13 13" stroke="#1D9E75" strokeWidth="2.2" strokeLinecap="round"/>
          </svg>
        </div>

        {/* Headline */}
        <h1 className="text-[34px] font-black tracking-[-0.04em] text-pc-ink leading-[1.1] mb-4">
          Ton resto<br/>mérite d'être<br/>vu.
        </h1>
        <p className="text-[15px] text-pc-ink-3 leading-[1.6] mb-10">
          PostChef génère tes idées TikTok & Instagram en 3 minutes — adaptées à ta cuisine, ta clientèle, ton rythme.
        </p>

        {/* Benefits */}
        <div className="space-y-4">
          {[
            { icon: '✦', title: '5 questions', sub: 'Profil complet en moins de 2 min' },
            { icon: '✦', title: 'Idées IA sur mesure', sub: 'Hooks, formats, légendes prêts à poster' },
            { icon: '✦', title: 'Gratuit pour commencer', sub: 'Sans CB — upgrade quand tu veux' },
          ].map((b) => (
            <div key={b.title} className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-[10px] bg-pc-green-light flex items-center justify-center flex-shrink-0 mt-[2px]">
                <span className="text-[13px] text-pc-green font-black">{b.icon}</span>
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
