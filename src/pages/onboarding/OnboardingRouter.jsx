import { useState } from 'react'
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
  const [step, setStep] = useState(1)
  const navigate = useNavigate()
  const setOnboardingStep = useAppStore((s) => s.setOnboardingStep)
  const completeOnboarding = useAppStore((s) => s.completeOnboarding)

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
    <div className="min-h-screen bg-[#f1f3f5] flex items-start justify-center py-6 px-4">
      <div className="w-[340px] bg-white rounded-[40px] border-2 border-pc-border overflow-hidden min-h-[680px] relative">
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
    </div>
  )
}
