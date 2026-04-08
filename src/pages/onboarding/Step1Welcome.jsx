import Button from '../../components/ui/Button.jsx'

export default function Step1Welcome({ onNext }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 px-5 pt-4 pb-[90px]">
        {/* Avatar Chef */}
        <div className="w-20 h-20 rounded-full bg-pc-green-light mx-auto mt-4 flex items-center justify-center">
          <svg width="42" height="42" viewBox="0 0 42 42" fill="none">
            <path d="M21 8c-2.2 0-4 1.8-4 4s1.8 4 4 4 4-1.8 4-4-1.8-4-4-4z" fill="#1D9E75" />
            <path d="M14 28c0-3.87 3.13-7 7-7s7 3.13 7 7" stroke="#1D9E75" strokeWidth="2" strokeLinecap="round" />
            <path d="M10 21h4M28 21h4" stroke="#5DCAA5" strokeWidth="2" strokeLinecap="round" />
            <circle cx="21" cy="21" r="18" stroke="#1D9E75" strokeWidth="1.5" />
          </svg>
        </div>

        <div className="h-[14px]" />

        {/* Bubble */}
        <div className="bg-pc-divider rounded-[20px_20px_20px_4px] px-4 py-[11px] text-[13px] leading-[1.55] text-[#111] mb-5">
          Bonjour ! Je suis <strong>Chef</strong>, ton expert contenu restaurant.
          <br /><br />
          En 5 questions rapides, je construis ton calendrier de posts sur mesure.
        </div>

        {/* Title */}
        <h1 className="text-[24px] font-extrabold text-pc-text leading-[1.25] tracking-[-0.5px] mb-2">
          Ton resto mérite<br />d'être vu.
        </h1>
        <p className="text-[14px] text-pc-muted leading-[1.6]">
          Des idées fraîches chaque semaine, adaptées à ta cuisine et ta clientèle.
        </p>
      </div>

      {/* Bottom CTA */}
      <div className="absolute bottom-0 left-0 right-0 px-5 pb-7 pt-[14px] bg-white">
        <Button fullWidth onClick={onNext}>
          Commencer — c'est gratuit
        </Button>
      </div>
    </div>
  )
}
