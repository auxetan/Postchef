/**
 * FilmingMode — Guide de tournage en temps réel.
 * Ouvre la caméra arrière, affiche le cadrage exact pour chaque plan,
 * compte le temps à la place du resto, indique quand passer à l'étape suivante.
 */
import { useState, useEffect, useRef } from 'react'
import { PC_DANGER, PC_GREEN } from '../../utils/colors.js'

// ── Helpers ──────────────────────────────────────────────────────────────────

function parseDurationMax(str) {
  const m = (str || '').match(/(\d+)-?(\d+)?s?/)
  return m ? parseInt(m[2] || m[1]) : 4
}

// ── Countdown ring SVG ────────────────────────────────────────────────────────
function CountdownRing({ total, remaining, onTap }) {
  const r = 22
  const circ = 2 * Math.PI * r
  const progress = total > 0 ? remaining / total : 1
  const offset = circ * (1 - progress)
  const urgent = remaining <= 2 && remaining > 0

  return (
    <button onClick={onTap} className="relative w-14 h-14 flex items-center justify-center flex-shrink-0">
      <svg className="absolute inset-0 -rotate-90" width="56" height="56" viewBox="0 0 56 56">
        <circle cx="28" cy="28" r={r} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="3.5"/>
        <circle
          cx="28" cy="28" r={r} fill="none"
          stroke={urgent ? PC_DANGER : PC_GREEN}
          strokeWidth="3.5"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s' }}
        />
      </svg>
      <span className={`font-black text-[22px] z-10 leading-none ${urgent ? 'text-pc-danger' : 'text-white'}`}>
        {remaining}
      </span>
    </button>
  )
}

// ── Corner brackets div helper ────────────────────────────────────────────────
function Brackets({ sz = 22, color = PC_GREEN, opacity = 1 }) {
  const s = { position: 'absolute', background: color, opacity }
  return (
    <>
      {/* Top-left */}
      <div style={{ ...s, top: 0, left: 0, width: sz, height: 2 }} />
      <div style={{ ...s, top: 0, left: 0, width: 2, height: sz }} />
      {/* Top-right */}
      <div style={{ ...s, top: 0, right: 0, width: sz, height: 2 }} />
      <div style={{ ...s, top: 0, right: 0, width: 2, height: sz }} />
      {/* Bottom-left */}
      <div style={{ ...s, bottom: 0, left: 0, width: sz, height: 2 }} />
      <div style={{ ...s, bottom: 0, left: 0, width: 2, height: sz }} />
      {/* Bottom-right */}
      <div style={{ ...s, bottom: 0, right: 0, width: sz, height: 2 }} />
      <div style={{ ...s, bottom: 0, right: 0, width: 2, height: sz }} />
    </>
  )
}

// ── Framing guides par type de plan ──────────────────────────────────────────
function FrameGuide({ stepNum }) {
  if (stepNum === 1) return (
    // Plan large — grand rectangle, coins en bas
    <div className="absolute rounded-[14px]" style={{ top: '10%', left: '4%', right: '4%', height: '58%' }}>
      <div className="absolute inset-0 rounded-[14px] border border-pc-green opacity-50" />
      <Brackets sz={28} />
    </div>
  )

  if (stepNum === 2) return (
    // Plan centré — cadre centré + croix de mise au point
    <div className="absolute rounded-[12px]" style={{ top: '16%', left: '12%', right: '12%', height: '54%' }}>
      <div className="absolute inset-0 rounded-[12px] border border-pc-green opacity-50" />
      <Brackets sz={24} />
      {/* Croix centrale */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div style={{ position: 'absolute', width: 32, height: 1.5, background: PC_GREEN, opacity: 0.6 }} />
        <div style={{ position: 'absolute', width: 1.5, height: 32, background: PC_GREEN, opacity: 0.6 }} />
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: PC_GREEN, opacity: 0.8 }} />
      </div>
    </div>
  )

  if (stepNum === 3) return (
    // Gros plan — cercle pointillé, petit et centré
    <div
      className="absolute rounded-full"
      style={{ top: '22%', left: '18%', width: '64%', aspectRatio: '1', border: '2px dashed #1D9E75', opacity: 0.85 }}
    >
      {/* Zoom lines depuis les coins de l'écran */}
      <svg className="absolute" style={{ top: '-80%', left: '-25%', width: '150%', height: '160%', overflow: 'visible' }}
        viewBox="0 0 150 160" fill="none">
        <line x1="0" y1="0" x2="30" y2="60" stroke={PC_GREEN} strokeWidth="0.8" strokeOpacity="0.3"/>
        <line x1="150" y1="0" x2="120" y2="60" stroke={PC_GREEN} strokeWidth="0.8" strokeOpacity="0.3"/>
      </svg>
      {/* Point central */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: PC_GREEN, opacity: 0.7 }} />
      </div>
    </div>
  )

  if (stepNum === 4) return (
    // Résultat — ovale arrondi + brackets
    <div className="absolute rounded-[80px]" style={{ top: '18%', left: '8%', right: '8%', height: '54%' }}>
      <div className="absolute inset-0 rounded-[80px] border border-pc-green opacity-55" />
      <Brackets sz={20} />
      {/* Icône plat au centre */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div style={{
          width: 48, height: 48, borderRadius: '50%',
          border: '2px solid rgba(29,158,117,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(29,158,117,0.2)' }} />
        </div>
      </div>
    </div>
  )

  if (stepNum === 5) return (
    // CTA — cadre global + bande du bas
    <>
      <div className="absolute rounded-[12px]" style={{ top: '8%', left: '4%', right: '4%', bottom: '20%', border: '1px solid rgba(29,158,117,0.25)' }}>
        <Brackets sz={18} opacity={0.5} />
      </div>
      <div className="absolute rounded-[10px]" style={{ bottom: '8%', left: '8%', right: '8%', height: '13%', border: '2px solid #1D9E75', opacity: 0.85 }}>
        {/* Arrow inside CTA zone */}
        <div className="absolute inset-0 flex items-center justify-center gap-2">
          <div style={{ width: 28, height: 2, background: PC_GREEN, borderRadius: 1, opacity: 0.7 }} />
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M9 3L12 6L9 9M1 6h11" stroke={PC_GREEN} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    </>
  )

  return null
}

// ── Labels de cadrage ─────────────────────────────────────────────────────────
const FRAME_LABELS = {
  1: 'Plan large — contexte restaurant',
  2: 'Centre ton sujet dans le cadre',
  3: 'Rapproche-toi à ~15cm du plat',
  4: 'Révèle le plat final ici',
  5: 'Texte CTA en bas de l\'écran',
}

// ── Composant principal ───────────────────────────────────────────────────────
export default function FilmingMode({ script, onClose }) {
  const videoRef = useRef(null)
  const streamRef = useRef(null)

  const [stepIdx, setStepIdx]       = useState(0)       // 0 = intro, 1-N = étapes
  const [phase, setPhase]           = useState('intro') // intro|ready|countdown|pause|done
  const [countdown, setCountdown]   = useState(null)
  const [totalDur, setTotalDur]     = useState(null)
  const [cameraReady, setCameraReady] = useState(false)
  const [cameraError, setCameraError] = useState(false)

  const step     = script[stepIdx - 1]
  const nextStep = script[stepIdx]        // prochain (0-indexed = stepIdx)
  const isLast   = stepIdx === script.length

  // ── Caméra ──────────────────────────────────────────────────────────────
  useEffect(() => {
    navigator.mediaDevices?.getUserMedia({
      video: { facingMode: 'environment', width: { ideal: 1920 } },
      audio: false,
    })
      .then((stream) => {
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play().catch(() => {})
        }
        setCameraReady(true)
      })
      .catch(() => setCameraError(true))

    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop())
    }
  }, [])

  // ── Countdown tick ──────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'countdown' || countdown === null) return
    if (countdown <= 0) { setPhase('pause'); return }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [phase, countdown])

  // ── Actions ─────────────────────────────────────────────────────────────
  const startFilming = () => { setStepIdx(1); setPhase('ready') }

  const startCountdown = () => {
    const dur = parseDurationMax(step?.duration)
    setTotalDur(dur)
    setCountdown(dur)
    setPhase('countdown')
  }

  const pauseCountdown = () => {
    setPhase('ready')
  }

  const goNextStep = () => {
    if (isLast) { setPhase('done'); return }
    setStepIdx((s) => s + 1)
    setPhase('ready')
    setCountdown(null)
    setTotalDur(null)
  }

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 bg-black overflow-hidden select-none">

      {/* Fond caméra */}
      <video
        ref={videoRef}
        autoPlay playsInline muted
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${cameraReady ? 'opacity-100' : 'opacity-0'}`}
      />
      {/* Overlay sombre sur la caméra */}
      {(cameraReady || cameraError) && (
        <div className="absolute inset-0 bg-black/40" />
      )}
      {/* Fond de fallback si pas de caméra */}
      {!cameraReady && !cameraError && (
        <div className="absolute inset-0 bg-[#0A0F0C]" />
      )}
      {cameraError && (
        <div className="absolute inset-0 bg-[#0A0F0C]" />
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          INTRO
      ═══════════════════════════════════════════════════════════════════ */}
      {phase === 'intro' && (
        <div className="absolute inset-0 flex flex-col">
          {/* Close */}
          <div className="px-5 pt-12 pb-0 flex justify-end">
            <button onClick={onClose} className="text-white/60 text-[13px] font-semibold px-3 py-2 rounded-pill bg-black/30">
              Fermer ✕
            </button>
          </div>

          <div className="flex-1 flex flex-col justify-center px-7">
            <div className="text-[52px] mb-5 leading-none">🎬</div>
            <h2 className="text-[30px] font-black text-white tracking-[-0.04em] mb-2 leading-tight">
              Mode Tournage
            </h2>
            <p className="text-[14px] text-white/55 leading-relaxed mb-8">
              {script.length} plans guidés · l'app compte le temps.<br/>
              Suis les cadres et enregistre chaque étape.
            </p>

            {/* Preview des étapes */}
            <div className="space-y-[10px] mb-8">
              {script.map((s) => (
                <div key={s.step} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-pc-green/20 border border-pc-green/40 flex items-center justify-center flex-shrink-0">
                    <span className="text-[10px] font-black text-pc-green">{s.step}</span>
                  </div>
                  <span className="text-[13px] text-white/80 font-medium flex-1">{s.action}</span>
                  <span className="text-[11px] text-white/35 font-medium">{s.duration}</span>
                </div>
              ))}
            </div>

            {cameraError && (
              <div className="bg-white/5 border border-white/10 rounded-elem px-4 py-3 mb-5">
                <p className="text-[12px] text-white/50">
                  📵 Caméra non accessible — le guide de cadrage fonctionne quand même.
                </p>
              </div>
            )}
          </div>

          <div className="px-6 pb-14">
            <button
              onClick={startFilming}
              className="w-full bg-pc-green text-white font-black text-[15px] py-[15px] rounded-btn hover:bg-pc-green-dark transition-colors flex items-center justify-center gap-2"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <polygon points="3,1 15,8 3,15" fill="white"/>
              </svg>
              Commencer le tournage
            </button>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          READY / COUNTDOWN
      ═══════════════════════════════════════════════════════════════════ */}
      {(phase === 'ready' || phase === 'countdown') && step && (
        <div className="absolute inset-0 flex flex-col">

          {/* HUD supérieur */}
          <div
            className="relative z-20 px-5 flex items-center justify-between"
            style={{ paddingTop: 'env(safe-area-inset-top, 48px)', paddingBottom: 12, background: 'linear-gradient(to bottom, rgba(0,0,0,0.65) 0%, transparent 100%)' }}
          >
            {/* Quitter */}
            <button onClick={onClose} className="text-white/60 text-[12px] font-semibold flex items-center gap-1">
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M2 2l9 9M11 2L2 11"/>
              </svg>
              Quitter
            </button>

            {/* Step indicator */}
            <div className="text-center">
              <div className="text-[10px] text-white/45 font-semibold tracking-[0.06em] uppercase mb-[1px]">Étape</div>
              <div className="text-white font-black text-[16px] leading-none">{stepIdx} / {script.length}</div>
            </div>

            {/* Countdown ou horloge idle */}
            {phase === 'countdown' ? (
              <CountdownRing key={stepIdx} total={totalDur} remaining={countdown} onTap={pauseCountdown} />
            ) : (
              <button
                onClick={startCountdown}
                className="w-14 h-14 rounded-full border-2 border-white/25 flex items-center justify-center hover:border-pc-green transition-colors flex-shrink-0"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.8" strokeLinecap="round">
                  <circle cx="9" cy="10" r="7"/>
                  <path d="M9 7v3.5l2.5 1.5"/>
                  <path d="M6.5 1.5h5M9 1.5v2"/>
                </svg>
              </button>
            )}
          </div>

          {/* Zone caméra + guides de cadrage */}
          <div className="flex-1 relative z-10">
            <FrameGuide stepNum={stepIdx} />

            {/* Label de cadrage */}
            <div className="absolute bottom-[8%] left-0 right-0 flex justify-center px-6">
              <div
                className="rounded-pill px-5 py-[9px]"
                style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
              >
                <p className="text-white font-semibold text-[13px] text-center">
                  {FRAME_LABELS[stepIdx] || ''}
                </p>
              </div>
            </div>
          </div>

          {/* Barre du bas */}
          <div
            className="relative z-20 px-5 pb-10 pt-5"
            style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.80) 0%, transparent 100%)' }}
          >
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-[5px]">
                <span className="text-white font-black text-[18px] tracking-[-0.03em] leading-tight">{step.action}</span>
                <span className="text-[10px] font-bold bg-white/10 text-white/55 rounded-[5px] px-[8px] py-[3px]">{step.duration}</span>
              </div>
              <p className="text-white/60 text-[12px] leading-[1.6]">{step.description}</p>
            </div>

            {/* Tip */}
            <div className="bg-white/5 border border-white/10 rounded-elem px-3 py-[8px] mb-4">
              <p className="text-[11px] text-white/50 leading-[1.5]">💡 {step.tip}</p>
            </div>

            {phase === 'ready' ? (
              <button
                onClick={startCountdown}
                className="w-full bg-pc-green text-white font-black text-[14px] py-[14px] rounded-btn flex items-center justify-center gap-2 hover:bg-pc-green-dark transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <polygon points="2,1 13,7 2,13" fill="white"/>
                </svg>
                Démarrer le chrono
              </button>
            ) : (
              <button
                onClick={pauseCountdown}
                className="w-full bg-white/10 text-white font-bold text-[14px] py-[14px] rounded-btn border border-white/15 flex items-center justify-center gap-2"
              >
                <svg width="12" height="14" viewBox="0 0 12 14" fill="white">
                  <rect x="0" y="0" width="4" height="14" rx="1"/>
                  <rect x="8" y="0" width="4" height="14" rx="1"/>
                </svg>
                Pause
              </button>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          PAUSE — chrono terminé, passer à l'étape suivante
      ═══════════════════════════════════════════════════════════════════ */}
      {phase === 'pause' && (
        <div className="absolute inset-0 flex flex-col" style={{ background: 'rgba(0,0,0,0.82)' }}>

          {/* Fermer */}
          <div className="px-5 pt-12 flex justify-end">
            <button onClick={onClose} className="text-white/50 text-[12px] font-semibold">Quitter</button>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center px-8">
            {/* Icône pause */}
            <div className="w-20 h-20 rounded-full bg-white/8 border-2 border-white/20 flex items-center justify-center mb-6">
              <svg width="28" height="30" viewBox="0 0 28 30" fill="white">
                <rect x="0" y="0" width="10" height="30" rx="2"/>
                <rect x="18" y="0" width="10" height="30" rx="2"/>
              </svg>
            </div>

            <h2 className="text-[30px] font-black text-white tracking-[-0.04em] mb-2 text-center">
              {isLast ? '🎉 Dernier plan !' : 'Plan terminé'}
            </h2>
            <p className="text-[13px] text-white/50 text-center mb-8 leading-relaxed">
              {isLast
                ? 'Tu as filmé les 5 étapes.\nPasse en montage !'
                : 'Mémorise le prochain cadrage\navant de relancer.'}
            </p>

            {/* Preview prochaine étape */}
            {!isLast && nextStep && (
              <div
                className="w-full rounded-card border border-white/12 px-5 py-5 mb-8"
                style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(10px)' }}
              >
                <div className="text-[10px] text-white/35 font-bold uppercase tracking-[0.06em] mb-3">
                  Prochaine étape
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-7 h-7 rounded-full bg-pc-green flex items-center justify-center flex-shrink-0">
                    <span className="text-[12px] font-black text-white">{nextStep.step}</span>
                  </div>
                  <span className="text-white font-black text-[16px] tracking-[-0.02em] flex-1">{nextStep.action}</span>
                  <span className="text-[11px] text-white/35 font-medium">{nextStep.duration}</span>
                </div>
                <p className="text-white/55 text-[12px] leading-[1.6] pl-10">{nextStep.description}</p>

                {/* Tip */}
                <div className="mt-3 pl-10">
                  <p className="text-[11px] text-pc-green leading-[1.5]">💡 {nextStep.tip}</p>
                </div>
              </div>
            )}
          </div>

          <div className="px-6 pb-14">
            {isLast ? (
              <button
                onClick={() => setPhase('done')}
                className="w-full bg-pc-green text-white font-black text-[15px] py-[15px] rounded-btn flex items-center justify-center gap-2"
              >
                Terminer le tournage 🎬
              </button>
            ) : (
              <button
                onClick={goNextStep}
                className="w-full bg-pc-green text-white font-black text-[15px] py-[15px] rounded-btn flex items-center justify-center gap-2 hover:bg-pc-green-dark transition-colors"
              >
                Étape suivante
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 8h10M10 5l3 3-3 3"/>
                </svg>
              </button>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          DONE
      ═══════════════════════════════════════════════════════════════════ */}
      {phase === 'done' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center px-8 bg-[#0A0F0C]">
          <div className="text-[72px] mb-6 leading-none">🎬</div>
          <h2 className="text-[30px] font-black text-white tracking-[-0.04em] mb-3 text-center">
            Tournage terminé !
          </h2>
          <p className="text-[14px] text-white/50 text-center leading-relaxed mb-10">
            {script.length} plans filmés.<br/>
            Monte ta vidéo et poste !
          </p>

          {/* Récap des étapes */}
          <div className="w-full space-y-2 mb-10">
            {script.map((s) => (
              <div key={s.step} className="flex items-center gap-3 bg-white/5 rounded-elem px-4 py-3">
                <div className="w-6 h-6 rounded-full bg-pc-green flex items-center justify-center flex-shrink-0">
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="text-[13px] text-white/75 font-medium">{s.action}</span>
              </div>
            ))}
          </div>

          <button
            onClick={onClose}
            className="w-full bg-pc-green text-white font-black text-[15px] py-[14px] rounded-btn hover:bg-pc-green-dark transition-colors"
          >
            Retour au script
          </button>
        </div>
      )}
    </div>
  )
}
