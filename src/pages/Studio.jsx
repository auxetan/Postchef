import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ClipUploader from '../components/features/ClipUploader'
import ViralityEngine from '../components/features/ViralityEngine'
import VideoRenderStatus from '../components/features/VideoRenderStatus'
import useAppStore from '../store/useAppStore'
import { getFeature } from '../utils/plans'

export default function Studio() {
  const [step, setStep] = useState(1)
  const plan = useAppStore((s) => s.user.plan)
  const reelUsed = useAppStore((s) => s.usage.videoReelUsedThisMonth ?? 0)
  const reelMax = getFeature(plan, 'videoReelPerMonth')
  const resetStudio = useAppStore((s) => s.resetStudio)
  const quotaReached = reelMax !== Infinity && reelUsed >= reelMax

  const handleNewVideo = () => {
    resetStudio()
    setStep(1)
  }

  return (
    <div className="min-h-screen bg-pc-bg pb-24 md:pb-8">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-pc-bg border-b border-pc-border px-6 py-4">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <div>
            <h1 className="text-[26px] font-[800] text-pc-ink tracking-[-0.04em]">
              Studio
            </h1>
            <p className="text-[13px] text-pc-ink-3 mt-0.5">
              Transforme tes clips en Reels viraux
            </p>
          </div>
          {reelMax !== Infinity && (
            <div className="text-[11px] font-bold uppercase tracking-[0.10em] text-pc-ink-3 border-b border-pc-border pb-0.5">
              {reelUsed}/{reelMax} reels ce mois
            </div>
          )}
        </div>
      </div>

      {/* Step indicator */}
      <StepIndicator currentStep={step} />

      {/* Content */}
      <div className="max-w-2xl mx-auto px-6 mt-6">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
              <ClipUploader
                onComplete={() => setStep(2)}
                quotaReached={quotaReached}
              />
            </motion.div>
          )}
          {step === 2 && (
            <motion.div
              key="directive"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
              <ViralityEngine
                onBack={() => setStep(1)}
                onRenderStart={() => setStep(3)}
              />
            </motion.div>
          )}
          {step === 3 && (
            <motion.div
              key="render"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
              <VideoRenderStatus onNewVideo={handleNewVideo} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function StepIndicator({ currentStep }) {
  const steps = ['Tes clips', 'Analyse IA', 'Ton Reel']
  return (
    <div className="flex items-center justify-center gap-3 px-6 pt-5">
      {steps.map((label, i) => {
        const n = i + 1
        const active = n === currentStep
        const done = n < currentStep
        return (
          <div key={n} className="flex items-center gap-2">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-colors ${
                done
                  ? 'bg-pc-green text-white'
                  : active
                    ? 'bg-pc-ink text-white'
                    : 'bg-pc-border text-pc-ink-4'
              }`}
            >
              {done ? '\u2713' : n}
            </div>
            <span
              className={`text-[12px] font-medium ${active ? 'text-pc-ink' : 'text-pc-ink-4'}`}
            >
              {label}
            </span>
            {i < steps.length - 1 && (
              <div className="w-8 h-px bg-pc-border mx-1" />
            )}
          </div>
        )
      })}
    </div>
  )
}
