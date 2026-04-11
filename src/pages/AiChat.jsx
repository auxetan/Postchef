import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useAppStore from '../store/useAppStore.js'
import useFeatureAccess from '../hooks/useFeatureAccess.js'

const SUGGESTIONS = [
  'Quels hashtags utiliser pour mon resto ?',
  'Idée de caption pour un plat du jour',
  'Comment améliorer mon engagement TikTok ?',
  'Stratégie de contenu pour la semaine',
]

function Message({ role, content }) {
  const isUser = role === 'user'
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-[#7C3AED] flex items-center justify-center flex-shrink-0 mr-2 mt-[2px]">
          <svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 2C6.13 2 3 5.13 3 9c0 2.39 1.19 4.5 3 5.74V17a1 1 0 001 1h6a1 1 0 001-1v-2.26C15.81 13.5 17 11.39 17 9c0-3.87-3.13-7-7-7z"/>
          </svg>
        </div>
      )}
      <div
        className={`max-w-[78%] px-4 py-[10px] rounded-[16px] text-[13px] leading-[1.6]
          ${isUser
            ? 'bg-pc-ink text-white rounded-br-[4px]'
            : 'bg-pc-surface border border-pc-border text-pc-ink rounded-bl-[4px]'
          }`}
      >
        {content}
      </div>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex justify-start mb-3">
      <div className="w-7 h-7 rounded-full bg-[#7C3AED] flex items-center justify-center flex-shrink-0 mr-2 mt-[2px]">
        <svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 2C6.13 2 3 5.13 3 9c0 2.39 1.19 4.5 3 5.74V17a1 1 0 001 1h6a1 1 0 001-1v-2.26C15.81 13.5 17 11.39 17 9c0-3.87-3.13-7-7-7z"/>
        </svg>
      </div>
      <div className="bg-pc-surface border border-pc-border rounded-[16px] rounded-bl-[4px] px-4 py-[12px] flex items-center gap-[5px]">
        <span className="w-[6px] h-[6px] rounded-full bg-pc-ink-4 animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-[6px] h-[6px] rounded-full bg-pc-ink-4 animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-[6px] h-[6px] rounded-full bg-pc-ink-4 animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  )
}

// Simulated AI responses (to be replaced with real API calls)
function getAIResponse(userMessage, restaurantName) {
  const msg = userMessage.toLowerCase()
  if (msg.includes('hashtag')) {
    return `Pour ${restaurantName || 'ton resto'}, voici une sélection de hashtags efficaces :\n\n**Locaux :** #restomarseille #foodmarseille #cuisinelocale\n\n**Génériques :** #foodphotography #restofrancais #bonappetit #foodie\n\n**TikTok :** #cheflife #cuisinefrancaise #restolife\n\nMixe 3-5 hashtags locaux + 2-3 génériques pour maximiser ta portée. Évite les hashtags trop génériques (>50M posts).`
  }
  if (msg.includes('caption') || msg.includes('légende')) {
    return `Voici une caption percutante pour un plat du jour :\n\n*"Ce matin, on s'est levés tôt pour ça 👨‍🍳 Notre [plat] maison, fait avec [ingrédient local]. Disponible midi seulement — dépêche-toi !*\n\nConseils :\n• Commence par un hook émotionnel ou une question\n• Mentionne un ingrédient ou une technique spécifique\n• Crée de l'urgence (midi seulement, dernières places…)\n• Termine par un appel à l'action clair`
  }
  if (msg.includes('tiktok') || msg.includes('engagement')) {
    return `Pour booster ton engagement TikTok :\n\n**Les 3 formats qui marchent le mieux pour les restos :**\n1. *POV : tu arrives dans mon resto* — immersif, fort taux d'achèvement\n2. *Before/After d'un plat* — satisfaisant, très partageable\n3. *"Ce que les locaux commandent vs les touristes"* — crée du débat\n\n**Timing :** poste entre 11h-13h ou 18h-20h\n\n**Fréquence :** 3-5 vidéos par semaine pour déclencher l'algo`
  }
  if (msg.includes('stratégie') || msg.includes('semaine')) {
    return `Voici un plan de contenu pour la semaine :\n\n**Lundi** — Plat du jour en vidéo courte (TikTok + Instagram)\n**Mardi** — Coulisses de la cuisine (stories)\n**Mercredi** — Avis client mis en avant (carousel)\n**Jeudi** — POV client qui découvre ton resto\n**Vendredi** — Spécialité du week-end en format Reel\n\nObjectif : 1 post/jour sur Instagram + 3 vidéos/semaine sur TikTok.`
  }
  return `Super question ! En tant que Chef IA spécialisé pour ${restaurantName || 'ton restaurant'}, je peux t'aider sur :\n\n• **Contenu** — idées de posts, captions, scripts vidéo\n• **Stratégie** — calendrier, fréquence, plateformes\n• **Hashtags** — sélection personnalisée pour ta ville et ton type de cuisine\n• **Tendances** — formats qui fonctionnent en ce moment\n\nDis-moi ce dont tu as besoin !`
}

export default function AiChat() {
  const navigate = useNavigate()
  const { can } = useFeatureAccess()
  const onboarding = useAppStore((s) => s.onboarding)
  const setPlan = useAppStore((s) => s.setPlan)
  const restaurantName = onboarding.restaurant.name || 'ton restaurant'

  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Bonjour ! Je suis Chef IA, ton assistant personnel pour ${restaurantName}. Je peux t'aider avec ta stratégie de contenu, tes hashtags, tes captions ou n'importe quelle question sur ton restaurant.\n\nQue puis-je faire pour toi ?`,
    },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const sendMessage = (text) => {
    const content = (text || input).trim()
    if (!content) return
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content }])
    setIsTyping(true)
    setTimeout(() => {
      setIsTyping(false)
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: getAIResponse(content, restaurantName) },
      ])
    }, 1200 + Math.random() * 800)
  }

  if (!can('aiChat')) {
    return (
      <div className="min-h-screen bg-pc-bg flex flex-col">
        <div className="bg-pc-surface border-b border-pc-border px-6 pt-7 pb-5 sticky top-0 z-30">
          <div className="max-w-2xl mx-auto flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="text-pc-ink-4 hover:text-pc-ink transition-colors">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M12 4l-7 6 7 6"/>
              </svg>
            </button>
            <h1 className="text-[22px] font-black tracking-[-0.04em] text-pc-ink leading-none">Chef IA</h1>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="max-w-sm w-full text-center">
            <div className="w-16 h-16 rounded-full bg-[#7C3AED]/10 flex items-center justify-center mx-auto mb-5">
              <svg width="28" height="28" viewBox="0 0 20 20" fill="none" stroke="#7C3AED" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 2C6.13 2 3 5.13 3 9c0 2.39 1.19 4.5 3 5.74V17a1 1 0 001 1h6a1 1 0 001-1v-2.26C15.81 13.5 17 11.39 17 9c0-3.87-3.13-7-7-7z"/>
                <path d="M7.5 17.5h5"/>
              </svg>
            </div>
            <span className="inline-block text-[10px] font-bold text-[#7C3AED] border border-[#7C3AED]/30 bg-[#7C3AED]/8 px-3 py-[4px] rounded-full mb-3">
              Exclusif Premium
            </span>
            <h2 className="text-[22px] font-black tracking-[-0.04em] text-pc-ink mb-3 leading-tight">
              Ton assistant restaurant IA
            </h2>
            <p className="text-[13px] text-pc-ink-3 leading-[1.7] mb-6">
              Pose n'importe quelle question sur ta stratégie de contenu, tes hashtags, tes captions ou ton menu. Chef IA connaît ton restaurant et répond en quelques secondes.
            </p>
            <div className="space-y-2 mb-6 text-left">
              {SUGGESTIONS.map((s) => (
                <div key={s} className="flex items-center gap-3 bg-pc-surface border border-pc-border rounded-elem px-4 py-3">
                  <div className="w-[6px] h-[6px] rounded-full bg-[#7C3AED] flex-shrink-0" />
                  <p className="text-[12px] text-pc-ink-2 italic">"{s}"</p>
                </div>
              ))}
            </div>
            <button
              onClick={() => { setPlan('premium'); navigate('/app/account') }}
              className="w-full py-[14px] rounded-btn bg-[#7C3AED] text-white text-[14px] font-black hover:bg-[#6D28D9] transition-colors"
              style={{ boxShadow: '0 4px 20px rgba(124,58,237,0.3)' }}
            >
              Passer au Premium — 99€/mois
            </button>
            <button onClick={() => navigate(-1)} className="mt-3 text-[12px] text-pc-ink-4 hover:text-pc-ink transition-colors">
              Retour
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-pc-bg flex flex-col">

      {/* Header */}
      <div className="bg-pc-surface border-b border-pc-border px-6 pt-7 pb-4 sticky top-0 z-30">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-pc-ink-4 hover:text-pc-ink transition-colors">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M12 4l-7 6 7 6"/>
            </svg>
          </button>
          <div className="w-8 h-8 rounded-full bg-[#7C3AED] flex items-center justify-center flex-shrink-0">
            <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 2C6.13 2 3 5.13 3 9c0 2.39 1.19 4.5 3 5.74V17a1 1 0 001 1h6a1 1 0 001-1v-2.26C15.81 13.5 17 11.39 17 9c0-3.87-3.13-7-7-7z"/>
            </svg>
          </div>
          <div>
            <p className="text-[14px] font-black text-pc-ink leading-none">Chef IA</p>
            <p className="text-[10px] text-[#7C3AED] font-semibold mt-[1px]">En ligne · Premium</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-5 pb-32 max-w-2xl mx-auto w-full">
        {messages.map((msg, i) => (
          <Message key={i} role={msg.role} content={msg.content} />
        ))}
        {isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {messages.length === 1 && !isTyping && (
        <div className="fixed bottom-[72px] left-0 right-0 px-5 pb-3 max-w-2xl mx-auto">
          <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => sendMessage(s)}
                className="flex-shrink-0 bg-pc-surface border border-pc-border rounded-full px-3 py-[7px] text-[11px] font-semibold text-pc-ink-2 hover:border-[#7C3AED] hover:text-[#7C3AED] transition-colors whitespace-nowrap"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="fixed bottom-0 left-0 right-0 bg-pc-surface border-t border-pc-border px-4 py-3 max-w-2xl mx-auto w-full"
        style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}>
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                sendMessage()
              }
            }}
            placeholder="Pose ta question à Chef IA..."
            rows={1}
            className="flex-1 bg-pc-bg border border-pc-border rounded-[20px] px-4 py-[10px] text-[13px] text-pc-ink placeholder:text-pc-ink-4 focus:outline-none focus:border-[#7C3AED] transition-colors resize-none overflow-hidden leading-[1.5]"
            style={{ maxHeight: '100px' }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || isTyping}
            className="w-9 h-9 rounded-full bg-[#7C3AED] flex items-center justify-center flex-shrink-0 disabled:opacity-40 active:scale-95 transition-all"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 8h10M9 4l4 4-4 4"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
