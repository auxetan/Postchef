import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import ProgressBar from '../../components/ui/ProgressBar.jsx'
import Step1Welcome from './Step1Welcome.jsx'
import Step2Restaurant from './Step2Restaurant.jsx'
import Step3Clientele from './Step3Clientele.jsx'
import Step4Preferences from './Step4Preferences.jsx'
import Step5SocialProof from './Step5SocialProof.jsx'
import Step6Loading from './Step6Loading.jsx'
import Step7Notifications from './Step7Notifications.jsx'
import Step8Paywall from './Step8Paywall.jsx'
import useAppStore from '../../store/useAppStore.js'

const STEPS = [
  Step1Welcome,
  Step2Restaurant,
  Step3Clientele,
  Step4Preferences,
  Step5SocialProof,
  Step6Loading,
  Step7Notifications,
  Step8Paywall,
]

const variants = {
  enter: { x: 60, opacity: 0 },
  center: { x: 0, opacity: 1 },
  exit: { x: -60, opacity: 0 },
}

export default function OnboardingRouter() {
  const navigate = useNavigate()
  const storedStep = useAppStore((s) => s.onboarding.step || 1)
  const [step, setStep] = useState(storedStep)
  const setOnboardingStep = useAppStore((s) => s.setOnboardingStep)
  const completeOnboarding = useAppStore((s) => s.completeOnboarding)

  useEffect(() => {
    setStep(storedStep)
  }, [storedStep])

  const goNext = () => {
    if (step < 8) {
      const next = step + 1
      setStep(next)
      setOnboardingStep(next)
    } else {
      completeOnboarding()
      navigate('/app')
    }
  }

  const StepComponent = STEPS[step - 1]

  return (
    /* Mobile : plein écran blanc. Desktop : card centrée sur fond gris, 2 colonnes */
    <div className="min-h-screen bg-white md:bg-[#f1f3f5] flex items-start md:items-start md:justify-center md:py-6 md:px-4 lg:bg-[#f0f2f5] lg:items-center lg:justify-center lg:py-12 lg:px-8">
      <div className="lg:flex lg:gap-20 lg:max-w-5xl lg:mx-auto lg:w-full lg:items-center">
        {/* Phone card */}
        <div className="w-full md:w-[360px] lg:w-[380px] lg:flex-shrink-0 bg-white md:rounded-[40px] md:border-2 md:border-pc-border lg:rounded-[40px] lg:border-2 lg:border-pc-border overflow-hidden min-h-screen md:min-h-[680px] lg:min-h-[680px] relative">
          <ProgressBar step={step} total={8} />
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="h-full"
            >
              <StepComponent onNext={goNext} />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Desktop marketing column — hidden on mobile/tablet */}
        <div className="hidden lg:flex flex-col justify-center max-w-sm">
          <h2 className="text-[32px] font-black tracking-[-0.04em] text-pc-ink leading-[1.15] mb-6">
            PostChef transforme ton restaurant en machine à contenu.
          </h2>
          <ul className="space-y-4 mb-8">
            <li className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-pc-green-light flex items-center justify-center flex-shrink-0 mt-[2px]">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 2" stroke="#1a7a4a" strokeWidth="1.8" strokeLinecap="round"/></svg>
              </div>
              <div>
                <p className="text-[15px] font-bold text-pc-ink leading-snug">30 min → 3h de contenu</p>
                <p className="text-[13px] text-pc-ink-3 mt-[2px]">Génère une semaine de posts en quelques clics, personnalisés pour ton restaurant.</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-pc-green-light flex items-center justify-center flex-shrink-0 mt-[2px]">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 2" stroke="#1a7a4a" strokeWidth="1.8" strokeLinecap="round"/></svg>
              </div>
              <div>
                <p className="text-[15px] font-bold text-pc-ink leading-snug">400+ restaurants</p>
                <p className="text-[13px] text-pc-ink-3 mt-[2px]">Rejoins la communauté PostChef et booste ta visibilité sur Instagram et TikTok.</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-pc-green-light flex items-center justify-center flex-shrink-0 mt-[2px]">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 2" stroke="#1a7a4a" strokeWidth="1.8" strokeLinecap="round"/></svg>
              </div>
              <div>
                <p className="text-[15px] font-bold text-pc-ink leading-snug">Résultats dès la 1ère semaine</p>
                <p className="text-[13px] text-pc-ink-3 mt-[2px]">Nos utilisateurs constatent +40% d'engagement dès les premiers posts générés.</p>
              </div>
            </li>
          </ul>
          <blockquote className="bg-white rounded-[16px] border border-pc-border px-5 py-4">
            <p className="text-[13px] text-pc-ink-2 leading-[1.6] italic mb-3">
              "En 2 semaines, j'ai doublé mes abonnés Instagram. PostChef m'a sauvé des heures chaque semaine."
            </p>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-pc-green-light flex items-center justify-center text-[11px] font-black text-pc-green-dark">M</div>
              <div>
                <p className="text-[12px] font-bold text-pc-ink leading-none">Marie D.</p>
                <p className="text-[11px] text-pc-ink-4">Bistrot Parisien · Paris</p>
              </div>
            </div>
          </blockquote>
        </div>
      </div>
    </div>
  )
}
