import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import useAppStore from '../store/useAppStore.js'
import useFeatureAccess from '../hooks/useFeatureAccess.js'
import { requestChefIA } from '../utils/serverApi.js'

// ── Rate limit client : max 3 generate_image / heure ────────────────────────
const imageTimestamps = []
function canGenerateImage() {
  const now = Date.now()
  const cutoff = now - 3_600_000
  while (imageTimestamps.length && imageTimestamps[0] < cutoff) imageTimestamps.shift()
  return imageTimestamps.length < 3
}
function recordImageGenerated() {
  imageTimestamps.push(Date.now())
}

const SUGGESTIONS = [
  'Crée une idée de reel pour ce soir',
  'Planifie un post pour samedi prochain',
  'Génère une photo de notre plat signature',
  'Stratégie de contenu pour cette semaine',
]

// ── Composants de messages ───────────────────────────────────────────────────

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
        className={`max-w-[78%] px-4 py-[10px] rounded-[16px] text-[13px] leading-[1.6] whitespace-pre-wrap
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

function ActionCard({ action, onNavigate }) {
  const { type, data } = action

  if (type === 'create_idea') {
    return (
      <div className="flex justify-start mb-3">
        <div className="w-7 h-7 rounded-full bg-[#7C3AED] flex items-center justify-center flex-shrink-0 mr-2 mt-[2px] opacity-0" />
        <div className="max-w-[78%] bg-[#F5F3FF] border border-[#C4B5FD] rounded-[16px] rounded-bl-[4px] px-4 py-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-4 h-4 rounded-full bg-[#7C3AED] flex items-center justify-center flex-shrink-0">
              <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                <path d="M2 5l2.5 2.5L8 2" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="text-[11px] font-bold text-[#7C3AED] uppercase tracking-wide">Idée créée</span>
          </div>
          <p className="text-[13px] font-semibold text-pc-ink leading-snug mb-1">"{data.hook}"</p>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-medium bg-[#EDE9FE] text-[#7C3AED] px-2 py-[2px] rounded-full">{data.format}</span>
            <span className="text-[10px] text-pc-ink-4">{data.plateforme}</span>
          </div>
          {data.brief && <p className="text-[12px] text-pc-ink-3 leading-[1.5]">{data.brief}</p>}
          <button
            onClick={() => onNavigate('/app/ideas')}
            className="mt-3 text-[11px] font-bold text-[#7C3AED] hover:underline"
          >
            Voir dans Idées →
          </button>
        </div>
      </div>
    )
  }

  if (type === 'add_calendar_event') {
    const dateLabel = data.date
      ? new Date(data.date + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
      : data.date
    return (
      <div className="flex justify-start mb-3">
        <div className="w-7 h-7 rounded-full bg-[#7C3AED] flex items-center justify-center flex-shrink-0 mr-2 mt-[2px] opacity-0" />
        <div className="max-w-[78%] bg-[#F0FDF4] border border-[#86EFAC] rounded-[16px] rounded-bl-[4px] px-4 py-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-4 h-4 rounded-full bg-[#16A34A] flex items-center justify-center flex-shrink-0">
              <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                <path d="M2 5l2.5 2.5L8 2" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="text-[11px] font-bold text-[#16A34A] uppercase tracking-wide">Planifié</span>
          </div>
          <p className="text-[13px] font-semibold text-pc-ink leading-snug mb-1">{data.type}</p>
          <div className="flex items-center gap-2 mb-2">
            <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="#16A34A" strokeWidth="1.8" strokeLinecap="round">
              <rect x="2" y="3" width="12" height="11" rx="2"/>
              <path d="M5 2v2M11 2v2M2 7h12"/>
            </svg>
            <span className="text-[12px] text-[#16A34A] font-medium">{dateLabel}</span>
            <span className="text-[10px] font-medium bg-[#DCFCE7] text-[#16A34A] px-2 py-[2px] rounded-full">{data.format}</span>
          </div>
          {data.brief && <p className="text-[12px] text-pc-ink-3 leading-[1.5]">{data.brief}</p>}
          <button
            onClick={() => onNavigate('/app/calendar')}
            className="mt-3 text-[11px] font-bold text-[#16A34A] hover:underline"
          >
            Voir dans Calendrier →
          </button>
        </div>
      </div>
    )
  }

  if (type === 'generate_image') {
    return (
      <div className="flex justify-start mb-3">
        <div className="w-7 h-7 rounded-full bg-[#7C3AED] flex items-center justify-center flex-shrink-0 mr-2 mt-[2px] opacity-0" />
        <div className="max-w-[78%] bg-pc-surface border border-pc-border rounded-[16px] rounded-bl-[4px] overflow-hidden">
          <img
            src={data.url}
            alt={data.dish_name || 'Image générée'}
            className="w-full object-cover"
            style={{ maxHeight: 260 }}
          />
          {data.dish_name && (
            <div className="px-3 py-2 text-[11px] text-pc-ink-4">{data.dish_name}</div>
          )}
        </div>
      </div>
    )
  }

  return null
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

// ── System prompt ────────────────────────────────────────────────────────────

function buildSystemPrompt(restaurant) {
  const { name, city, cuisineTypes = [], specialite, couverts } = restaurant
  const today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
  return `Tu es Chef IA, assistant personnel de contenu pour restaurants, intégré à l'app PostChef.
Tu connais le restaurant de l'utilisateur et tu réponds de façon concrète, directe et actionnable.

Restaurant : ${name || 'non renseigné'}
Ville : ${city || 'non renseignée'}
Cuisine : ${cuisineTypes.length ? cuisineTypes.join(', ') : 'non renseignée'}
Spécialité : ${specialite || 'non renseignée'}
Couverts : ${couverts || 'non renseigné'}
Date du jour : ${today}

Outils disponibles :
- create_idea : crée et ajoute une idée dans la liste Idées de l'utilisateur
- add_calendar_event : planifie un post dans le Calendrier de l'utilisateur
- generate_image : génère une image IA d'un plat (limité à 3/heure)

Règles :
- Réponds toujours en français, de façon concise et pratique.
- Quand l'utilisateur demande de créer une idée, une caption, un post → utilise create_idea.
- Quand l'utilisateur demande de planifier, programmer un post à une date → utilise add_calendar_event.
- Quand l'utilisateur demande explicitement une image ou photo générée → utilise generate_image.
- Pour les hashtags et captions simples, réponds avec du texte, pas besoin d'outil.
- Adapte les contenus à la cuisine et à la ville du restaurant.
- Réponses courtes (max 150 mots), sauf si l'utilisateur demande plus.`
}

// ── Paywall ──────────────────────────────────────────────────────────────────

function PremiumWall({ onUpgrade, onBack }) {
  return (
    <div className="min-h-screen bg-pc-bg flex flex-col">
      <div className="bg-pc-surface border-b border-pc-border px-6 pt-7 pb-5 sticky top-0 z-30">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button onClick={onBack} className="text-pc-ink-4 hover:text-pc-ink transition-colors">
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
            Chef IA peut créer des idées, planifier des posts et générer des images — directement depuis la conversation.
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
            onClick={onUpgrade}
            className="w-full py-[14px] rounded-btn bg-[#7C3AED] text-white text-[14px] font-black hover:bg-[#6D28D9] transition-colors"
            style={{ boxShadow: '0 4px 20px rgba(124,58,237,0.3)' }}
          >
            Passer au Premium — 99€/mois
          </button>
          <button onClick={onBack} className="mt-3 text-[12px] text-pc-ink-4 hover:text-pc-ink transition-colors">
            Retour
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main component ───────────────────────────────────────────────────────────

export default function AiChat() {
  const navigate = useNavigate()
  const { can } = useFeatureAccess()
  const onboarding = useAppStore((s) => s.onboarding)
  const setPlan    = useAppStore((s) => s.setPlan)
  const addPost    = useAppStore((s) => s.addPost)
  const addIdea    = useAppStore((s) => s.addIdea)

  const restaurant     = onboarding.restaurant || {}
  const restaurantName = restaurant.name || 'ton restaurant'
  const systemPrompt   = buildSystemPrompt(restaurant)

  // Each entry is either { role, content } or { role: 'action', action: {...} }
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Bonjour ! Je suis Chef IA, ton assistant pour ${restaurantName}.\n\nJe peux créer des idées, planifier des posts dans ton calendrier et générer des images — dis-moi ce que tu veux faire !`,
    },
  ])
  const [input, setInput]       = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [error, setError]       = useState(null)
  const messagesEndRef = useRef(null)
  const inputRef       = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const applyActions = useCallback((actions) => {
    for (const action of actions) {
      if (action.type === 'create_idea') {
        addIdea(action.data)
      } else if (action.type === 'add_calendar_event') {
        addPost(action.data)
      }
      // generate_image is display-only (URL in action.data)
    }
  }, [addIdea, addPost])

  const sendMessage = async (text) => {
    const content = (text || input).trim()
    if (!content || isTyping) return
    setInput('')
    setError(null)

    const userMsg = { role: 'user', content }
    const nextMessages = [...messages, userMsg]
    setMessages(nextMessages)
    setIsTyping(true)

    try {
      // Build history for API: only role/content pairs (skip action entries)
      const history = nextMessages
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .slice(1) // skip initial greeting

      const data = await requestChefIA({ messages: history, system: systemPrompt })

      // Track image generation rate limit
      const imageActions = (data.actions || []).filter((a) => a.type === 'generate_image')
      imageActions.forEach(() => recordImageGenerated())

      // Apply store actions
      applyActions(data.actions || [])

      // Build new entries: text reply + action cards
      const newEntries = []
      if (data.text) {
        newEntries.push({ role: 'assistant', content: data.text })
      }
      for (const action of data.actions || []) {
        newEntries.push({ role: 'action', action })
      }

      setMessages((prev) => [...prev, ...newEntries])
    } catch {
      setError('Chef IA est momentanément indisponible. Réessaie dans un instant.')
      setMessages((prev) => prev.filter((m) => m !== userMsg || m.role !== 'user'))
    } finally {
      setIsTyping(false)
    }
  }

  if (!can('aiChat')) {
    return (
      <PremiumWall
        onUpgrade={() => { setPlan('premium'); navigate('/app/account') }}
        onBack={() => navigate(-1)}
      />
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
            <p className="text-[10px] text-[#7C3AED] font-semibold mt-[1px]">
              {isTyping ? 'En train de répondre…' : 'En ligne · Premium'}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-5 pb-32 max-w-2xl mx-auto w-full">
        {messages.map((msg, i) => {
          if (msg.role === 'action') {
            return <ActionCard key={i} action={msg.action} onNavigate={navigate} />
          }
          return <Message key={i} role={msg.role} content={msg.content} />
        })}
        {isTyping && <TypingIndicator />}
        {error && (
          <div className="flex justify-start mb-3">
            <div className="max-w-[78%] px-4 py-[10px] rounded-[16px] rounded-bl-[4px] bg-[#fef2f2] border border-[#fecaca] text-[12px] text-[#ef4444]">
              {error}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions — affichées uniquement au démarrage */}
      {messages.length === 1 && !isTyping && (
        <div className="fixed bottom-[72px] left-0 right-0 px-5 pb-3 max-w-2xl mx-auto">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
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
      <div
        className="fixed bottom-0 left-0 right-0 bg-pc-surface border-t border-pc-border px-4 py-3 max-w-2xl mx-auto w-full"
        style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}
      >
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
            }}
            placeholder="Crée une idée, planifie un post, génère une image…"
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
