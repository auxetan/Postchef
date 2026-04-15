import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAppStore from '../store/useAppStore.js'
import useToastStore from '../store/useToastStore.js'
import { PLANS, PLAN_DISPLAY_NAMES, getFeature } from '../utils/plans.js'
import useAuth from '../hooks/useAuth.js'
import { supabase } from '../lib/supabaseClient.js'

const PRO_FEATURES = [
  'Idées IA illimitées · toutes plateformes',
  'Brief visuel + import carte menu',
  'RestaurantBrain complet (avis Google)',
  'Photo IA DALL-E · 30/mois',
  'Analytics avancé + heatmap',
  '20 Reels Studio / mois',
]

const PLAN_FEATURES = {
  starter: ['5 idées IA / semaine', '1 plateforme', '3 posts / semaine', 'Essai 7 jours gratuit'],
  pro_monthly: PRO_FEATURES,
  pro_annual:  PRO_FEATURES,
  premium:     ['Tout illimité sans exception', 'Photos DALL-E illimitées', 'Reels Studio illimités', 'Chef IA — assistant conversationnel', 'Support dédié 7j/7'],
}

const PLATFORMS_CONNECT = [
  { name: 'TikTok', soon: false, icon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 000 12.68 6.34 6.34 0 006.33-6.34V8.69a8.26 8.26 0 004.84 1.55V6.79a4.85 4.85 0 01-1.07-.1z"/>
    </svg>
  )},
  { name: 'Instagram', soon: false, icon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
    </svg>
  )},
  { name: 'Facebook', soon: true, icon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  )},
]

function Rule({ children }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <span className="pc-section-label">{children}</span>
      <div className="flex-1 h-px bg-pc-rule" />
    </div>
  )
}

export default function Account() {
  const navigate = useNavigate()
  const { signOut, syncStatus, user: authUser } = useAuth()
  const user = useAppStore((s) => s.user)
  const onboarding = useAppStore((s) => s.onboarding)
  const updateRestaurant = useAppStore((s) => s.updateRestaurant)
  const setPlan = useAppStore((s) => s.setPlan)
  const resetSessionState = useAppStore((s) => s.resetSessionState)
  const toast = useToastStore((s) => s.toast)

  const [name, setName] = useState(onboarding.restaurant.name || '')
  const [city, setCity] = useState(onboarding.restaurant.city || '')
  const [saved, setSaved] = useState(false)
  const [notifOn, setNotifOn] = useState(() => localStorage.getItem('pc_notif') === '1')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [billing, setBilling] = useState(
    user.plan === 'pro_monthly' ? 'monthly' : 'annual'
  )
  const [logoutLoading, setLogoutLoading] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')

  // Réseaux sociaux
  const socialConnections  = useAppStore((s) => s.socialConnections)
  const setSocialProfileKey = useAppStore((s) => s.setSocialProfileKey)
  const setSocialConnected  = useAppStore((s) => s.setSocialConnected)
  const [connectingPlatform, setConnectingPlatform] = useState(null)
  const [checkingStatus, setCheckingStatus] = useState(false)

  const profileKey    = socialConnections?.profileKey
  const connectedList = socialConnections?.connected || []
  const lastChecked   = socialConnections?.lastChecked

  const currentPlan = user.plan || 'starter'
  const usage       = useAppStore((s) => s.usage)

  // Quotas calculés pour l'affichage
  const ideasMax    = getFeature(currentPlan, 'ideasPerWeek')
  const ideasUsed   = usage.ideasUsedThisWeek ?? 0

  const photoMax    = getFeature(currentPlan, 'dishPhotoPerMonth')
  const photoUsed   = usage.dishPhotoUsedThisMonth ?? 0

  const brainMax    = getFeature(currentPlan, 'restaurantBrainPerMonth')
  const brainUsed   = usage.restaurantBrainUsedThisMonth ?? 0

  const calMax      = getFeature(currentPlan, 'calendarPostsPerWeek')
  const posts       = useAppStore((s) => s.posts)

  const scriptMax   = getFeature(currentPlan, 'videoScriptPerMonth')
  const scriptUsed  = usage.videoScriptUsedThisMonth ?? 0

  const captionMax  = getFeature(currentPlan, 'captionPerMonth')
  const captionUsed = usage.captionUsedThisMonth ?? 0

  const handleSave = () => {
    updateRestaurant({ name, city })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleLogout = async () => {
    setLogoutLoading(true)
    await signOut()
    setLogoutLoading(false)
    navigate('/login', { replace: true })
  }

  const handleNotifToggle = async () => {
    if (!notifOn) {
      if (!('Notification' in window)) {
        toast('Notifications non supportées sur ce navigateur')
        return
      }
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        setNotifOn(true)
        localStorage.setItem('pc_notif', '1')
        toast('Notifications activées ✓')
      } else {
        toast('Permission refusée — active-la dans les réglages du navigateur')
      }
    } else {
      setNotifOn(false)
      localStorage.removeItem('pc_notif')
    }
  }

  // B2 — Upgrade plan : bloqué côté client jusqu'à intégration Stripe
  const handleUpgradePlan = () => {
    toast('Paiement bientôt disponible — contacte-nous à contact@postchef.fr pour activer ton plan')
  }

  async function getAuthToken() {
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token || null
  }

  const handleConnectPlatform = async () => {
    setConnectingPlatform('loading')
    try {
      const token = await getAuthToken()
      const res = await fetch('/api/ayrshare-connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ profileKey: profileKey || undefined }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error?.message || 'Erreur de connexion')

      setSocialProfileKey(data.profileKey)
      window.open(data.socialManagerUrl, '_blank', 'noopener,noreferrer')
      toast('Page de connexion ouverte — connecte tes réseaux puis clique "Vérifier" ici')
    } catch (err) {
      toast(`Erreur : ${err.message}`)
    } finally {
      setConnectingPlatform(null)
    }
  }

  const handleCheckStatus = async () => {
    if (!profileKey) {
      toast('Commence par cliquer "Connecter mes réseaux"')
      return
    }
    setCheckingStatus(true)
    try {
      const token = await getAuthToken()
      const res = await fetch('/api/ayrshare-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ profileKey }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error?.message || 'Erreur de vérification')

      setSocialConnected(data.connected || [])
      if (data.connected?.length) {
        toast(`Connecté : ${data.connected.join(', ')} ✓`)
      } else {
        toast('Aucun réseau connecté pour l\'instant — connecte-les depuis la page Ayrshare')
      }
    } catch (err) {
      toast(`Erreur : ${err.message}`)
    } finally {
      setCheckingStatus(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'SUPPRIMER') return
    setDeleteLoading(true)
    try {
      // B3 — Supprimer toutes les données Supabase avant signOut
      const { data: { session } } = await (await import('../lib/supabaseClient.js')).supabase.auth.getSession()
      if (session?.access_token) {
        await fetch('/api/delete-account', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({}),
        })
      }
      await signOut()
      resetSessionState()
      navigate('/', { replace: true })
    } catch {
      toast('Erreur lors de la suppression — réessaie')
      setDeleteLoading(false)
    }
  }

  const inputClass = 'w-full bg-pc-bg border border-pc-border rounded-btn px-4 py-[12px] text-[14px] text-pc-ink placeholder:text-pc-ink-4 focus:outline-none focus:border-pc-ink focus:bg-pc-surface transition-all'
  const labelClass = 'pc-section-label block mb-[8px]'

  return (
    <div className="min-h-screen bg-pc-bg">

      {/* Header */}
      <div className="bg-pc-surface border-b border-pc-border px-6 pt-7 pb-5 sticky top-0 z-30">
        <div className="max-w-2xl mx-auto lg:max-w-3xl">
          <h1 className="text-[26px] font-black tracking-[-0.04em] text-pc-ink leading-none">Compte</h1>
          <p className="text-[12px] text-pc-ink-4 mt-[6px] font-medium">
            {onboarding.restaurant.name || 'Ton restaurant'}
          </p>
        </div>
      </div>

      <div className="px-6 py-7 max-w-2xl mx-auto lg:max-w-3xl lg:px-8 lg:py-8 space-y-8">

        {/* Profil */}
        <section>
          <Rule>Profil restaurant</Rule>
          <div className="bg-pc-surface border border-pc-border rounded-card px-5 py-4 mb-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[13px] font-semibold text-pc-ink">{authUser?.email || user.email || 'Compte connecté'}</p>
                <p className="text-[11px] text-pc-ink-4 mt-[2px]">
                  {syncStatus === 'saving'
                    ? 'Synchronisation en cours...'
                    : syncStatus === 'ready'
                      ? 'Synchronisé avec le serveur'
                      : syncStatus === 'demo'
                        ? 'Mode démo local'
                        : 'Session active'}
                </p>
              </div>
              <button
                onClick={handleLogout}
                disabled={logoutLoading}
                className="text-[12px] font-bold text-pc-ink border border-pc-border rounded-btn px-4 py-[8px] hover:bg-pc-bg transition-colors disabled:opacity-50"
              >
                {logoutLoading ? 'Déconnexion...' : 'Se déconnecter'}
              </button>
            </div>
          </div>
          <div className="space-y-3 mb-5">
            <div>
              <label className={labelClass}>Nom</label>
              <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} placeholder="La Trattoria" />
            </div>
            <div>
              <label className={labelClass}>Ville</label>
              <input className={inputClass} value={city} onChange={(e) => setCity(e.target.value)} placeholder="Marseille" />
            </div>
          </div>
          <button onClick={handleSave}
            className={`px-5 py-[10px] rounded-btn text-[13px] font-bold transition-all
              ${saved ? 'bg-pc-green-light text-pc-green border border-pc-green/30' : 'bg-pc-ink text-white hover:bg-pc-ink-2'}`}>
            {saved ? '✓ Sauvegardé' : 'Sauvegarder'}
          </button>
        </section>

        {/* Abonnement */}
        <section>
          <Rule>Abonnement</Rule>

          {/* Current plan summary */}
          <div className="bg-pc-surface border border-pc-border rounded-card px-5 py-5 mb-4">
            <div className="flex items-baseline justify-between mb-4">
              <div>
                <p className="pc-section-label mb-1">Plan actuel</p>
                <p className="text-[20px] font-black tracking-[-0.03em] text-pc-ink">{PLAN_DISPLAY_NAMES[currentPlan]}</p>
              </div>
              {currentPlan !== 'starter' && (
                <span className="text-[11px] font-bold text-pc-green border border-pc-green/30 bg-pc-green-light rounded-[6px] px-3 py-[4px]">
                  Actif
                </span>
              )}
            </div>
            <div className="space-y-[8px]">
              {(PLAN_FEATURES[currentPlan] || []).map((f) => (
                <div key={f} className="flex items-center gap-[10px] text-[13px] text-pc-ink-2">
                  <div className="w-[5px] h-[5px] rounded-full bg-pc-ink flex-shrink-0" />
                  {f}
                </div>
              ))}
            </div>
          </div>

          {/* Upgrade options — shown if not Premium */}
          {currentPlan !== 'premium' && (
            <div className="mt-4">
              <p className="pc-section-label mb-3">Changer de plan · démo</p>

              {/* Billing toggle (shown for non-starter) */}
              {(currentPlan === 'pro_monthly' || currentPlan === 'pro_annual' || currentPlan === 'starter') && (
                <div className="flex items-center justify-center mb-4">
                  <div className="flex bg-pc-bg border border-pc-border rounded-[12px] p-1 gap-1">
                    <button
                      onClick={() => setBilling('monthly')}
                      className={`px-4 py-[7px] rounded-[9px] text-[11px] font-bold transition-all ${
                        billing === 'monthly'
                          ? 'bg-pc-surface shadow-sm text-pc-ink border border-pc-border'
                          : 'text-pc-ink-4'
                      }`}
                    >
                      Mensuel · 29€
                    </button>
                    <button
                      onClick={() => setBilling('annual')}
                      className={`px-4 py-[7px] rounded-[9px] text-[11px] font-bold transition-all flex items-center gap-[6px] ${
                        billing === 'annual'
                          ? 'bg-pc-ink shadow-sm text-white'
                          : 'text-pc-ink-4'
                      }`}
                    >
                      Annuel · 19€
                      <span className={`text-[8px] font-bold px-[5px] py-[1px] rounded-full ${
                        billing === 'annual' ? 'bg-white/20 text-white' : 'bg-pc-green/15 text-pc-green'
                      }`}>−35%</span>
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 lg:grid-cols-3">
                {/* Pro */}
                <button
                  onClick={handleUpgradePlan}
                  className={`border-2 rounded-card px-3 py-4 text-left transition-all ${
                    (currentPlan === 'pro_monthly' || currentPlan === 'pro_annual')
                      ? 'border-pc-green bg-pc-green text-white'
                      : 'bg-pc-surface border-pc-border hover:border-pc-green/50'
                  }`}
                >
                  <div className={`text-[11px] font-bold leading-tight mb-1 ${
                    (currentPlan === 'pro_monthly' || currentPlan === 'pro_annual') ? 'text-white/80' : 'text-pc-ink-2'
                  }`}>Pro</div>
                  <div className={`text-[16px] font-black tracking-[-0.03em] ${
                    (currentPlan === 'pro_monthly' || currentPlan === 'pro_annual') ? 'text-white' : 'text-pc-ink'
                  }`}>
                    {billing === 'annual' ? '19€' : '29€'}
                  </div>
                  <div className={`text-[9px] font-medium mt-[1px] ${
                    (currentPlan === 'pro_monthly' || currentPlan === 'pro_annual') ? 'text-white/60' : 'text-pc-ink-4'
                  }`}>/mois</div>
                </button>

                {/* Premium */}
                <button
                  onClick={handleUpgradePlan}
                  className="border-2 rounded-card px-3 py-4 text-left transition-all bg-pc-surface border-pc-border hover:border-[#7C3AED]/50 relative overflow-hidden"
                >
                  <div className="absolute top-2 right-2 text-[8px] font-bold text-[#7C3AED] bg-[#7C3AED]/10 px-[5px] py-[2px] rounded-full">
                    IA
                  </div>
                  <div className="text-[11px] font-bold leading-tight mb-1 text-[#7C3AED]">Premium</div>
                  <div className="text-[16px] font-black tracking-[-0.03em] text-pc-ink">99€</div>
                  <div className="text-[9px] font-medium mt-[1px] text-pc-ink-4">/mois</div>
                </button>
              </div>
            </div>
          )}
        </section>

        {/* ── FAQ Facturation ──────────────────────────────── */}
        <section>
          <Rule>Questions fréquentes</Rule>
          <div className="space-y-2">
            {[
              {
                q: 'Puis-je annuler à tout moment ?',
                a: "Oui. Tu peux annuler depuis cette page ou par email. Ton accès reste actif jusqu'à la fin de la période payée. Aucun frais d'annulation.",
              },
              {
                q: "L'essai 7 jours est vraiment gratuit ?",
                a: "Complètement. Aucune CB requise pour démarrer. Si tu décides de continuer, tu choisis ton plan à la fin des 7 jours.",
              },
              {
                q: 'Quand suis-je prélevé ?',
                a: "Le premier prélèvement a lieu le jour de ton passage au plan payant. Ensuite, chaque mois (ou chaque année si tu choisis le plan annuel) à la même date.",
              },
              {
                q: 'Mes données sont-elles conservées si je change de plan ?',
                a: "Oui. Tes posts, idées et paramètres sont conservés indépendamment de ton plan. Si tu passes de Pro à Starter, tes données existantes restent accessibles.",
              },
            ].map((item) => (
              <FaqItem key={item.q} question={item.q} answer={item.a} />
            ))}
          </div>
        </section>

        {/* ── Chef IA ──────────────────────────────────────── */}
        <section>
          <Rule>Chef IA</Rule>
          {currentPlan === 'premium' ? (
            <button
              onClick={() => navigate('/app/chef-ia')}
              className="w-full bg-gradient-to-br from-[#7C3AED] to-[#5B21B6] rounded-card px-5 py-5 text-left active:scale-[0.99] transition-transform"
              style={{ boxShadow: '0 4px 20px rgba(124,58,237,0.25)' }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 2C6.13 2 3 5.13 3 9c0 2.39 1.19 4.5 3 5.74V17a1 1 0 001 1h6a1 1 0 001-1v-2.26C15.81 13.5 17 11.39 17 9c0-3.87-3.13-7-7-7z"/>
                    <path d="M7.5 17.5h5"/>
                  </svg>
                </div>
                <div>
                  <p className="text-[14px] font-black text-white leading-none">Parler à Chef IA</p>
                  <p className="text-[11px] text-white/60 mt-[3px]">Ton assistant restaurant personnel</p>
                </div>
                <div className="ml-auto">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                    <path d="M6 3l5 5-5 5"/>
                  </svg>
                </div>
              </div>
              <p className="text-[12px] text-white/70 leading-relaxed">
                Pose n'importe quelle question sur ton resto, ta stratégie de contenu, tes hashtags...
              </p>
            </button>
          ) : (
            <div className="bg-pc-surface border border-pc-border rounded-card px-5 py-5 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[#7C3AED]/5 to-transparent pointer-events-none" />
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#7C3AED]/10 flex items-center justify-center flex-shrink-0">
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="#7C3AED" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 2C6.13 2 3 5.13 3 9c0 2.39 1.19 4.5 3 5.74V17a1 1 0 001 1h6a1 1 0 001-1v-2.26C15.81 13.5 17 11.39 17 9c0-3.87-3.13-7-7-7z"/>
                    <path d="M7.5 17.5h5"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-[6px]">
                    <p className="text-[14px] font-black text-pc-ink">Chef IA</p>
                    <span className="text-[9px] font-bold text-[#7C3AED] border border-[#7C3AED]/30 bg-[#7C3AED]/8 px-[8px] py-[2px] rounded-full">Premium</span>
                  </div>
                  <p className="text-[12px] text-pc-ink-3 leading-[1.6] mb-4">
                    Un assistant IA dédié à ton restaurant. Pose-lui toutes tes questions sur ta stratégie de contenu, tes hashtags, tes recettes ou ton menu.
                  </p>
                  <button
                    onClick={handleUpgradePlan}
                    className="text-[12px] font-bold text-white bg-[#7C3AED] px-4 py-[9px] rounded-btn hover:bg-[#6D28D9] transition-colors"
                  >
                    Passer au Premium — 99€/mois
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* ── Consommation IA ──────────────────────────────── */}
        <section>
          <Rule>Consommation IA ce cycle</Rule>
          <div className="space-y-2">

            {/* Idées */}
            <UsageMeter
              label="Idées IA"
              sub="Reset lundi"
              used={ideasUsed}
              max={ideasMax}
            />

            {/* Photos DALL-E — Pro Annual uniquement */}
            {photoMax > 0 && (
              <UsageMeter
                label="Photos DALL-E"
                sub="Reset 1er du mois"
                used={photoUsed}
                max={photoMax}
              />
            )}

            {/* Analyses RestaurantBrain */}
            {brainMax > 0 && (
              <UsageMeter
                label="Analyses restaurant"
                sub="Reset 1er du mois"
                used={brainUsed}
                max={brainMax}
              />
            )}

            {/* Scripts vidéo */}
            {scriptMax > 0 && (
              <UsageMeter
                label="Scripts vidéo IA"
                sub="Reset 1er du mois"
                used={scriptUsed}
                max={scriptMax}
              />
            )}

            {/* Légendes QuickCapture */}
            {captionMax > 0 && (
              <UsageMeter
                label="Légendes photo IA"
                sub="Reset 1er du mois"
                used={captionUsed}
                max={captionMax}
              />
            )}

            {/* Posts calendrier */}
            {calMax !== Infinity && (
              <UsageMeter
                label="Posts calendrier"
                sub={`${calMax}/semaine max`}
                used={posts.length}
                max={calMax}
                noBar
              />
            )}
          </div>
        </section>

        {/* Plateformes */}
        <section>
          <Rule>Plateformes</Rule>

          {/* Bouton principal de connexion + vérification */}
          <div className="bg-pc-surface border border-pc-border rounded-card px-5 py-4 mb-3">
            <p className="text-[13px] font-semibold text-pc-ink mb-1">Connexion des réseaux sociaux</p>
            <p className="text-[11px] text-pc-ink-4 leading-relaxed mb-4">
              Connecte tes comptes Instagram, TikTok ou Facebook pour pouvoir publier directement depuis PostChef.
            </p>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={handleConnectPlatform}
                disabled={connectingPlatform === 'loading'}
                className="text-[12px] font-bold text-white bg-pc-ink px-4 py-[9px] rounded-btn hover:bg-pc-ink-2 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {connectingPlatform === 'loading' ? (
                  <>
                    <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round"/>
                    </svg>
                    Connexion…
                  </>
                ) : profileKey ? (
                  'Gérer mes réseaux'
                ) : (
                  'Connecter mes réseaux'
                )}
              </button>
              {profileKey && (
                <button
                  onClick={handleCheckStatus}
                  disabled={checkingStatus}
                  className="text-[12px] font-bold text-pc-ink border border-pc-border px-4 py-[9px] rounded-btn hover:bg-pc-bg transition-colors disabled:opacity-50"
                >
                  {checkingStatus ? 'Vérification…' : 'Vérifier la connexion'}
                </button>
              )}
            </div>
            {lastChecked && (
              <p className="text-[10px] text-pc-ink-4 mt-2">
                Dernière vérification : {new Date(lastChecked).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </p>
            )}
          </div>

          {/* Liste des plateformes avec statut */}
          <div className="bg-pc-surface border border-pc-border rounded-card divide-y divide-pc-rule">
            {PLATFORMS_CONNECT.map((p) => {
              const isConnected = connectedList.includes(p.name)
              return (
                <div key={p.name} className="flex items-center justify-between px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-[8px] border flex items-center justify-center
                      ${isConnected ? 'bg-pc-green-light border-pc-green/30 text-pc-green' : 'bg-pc-bg border-pc-rule text-pc-ink-2'}`}>
                      {p.icon}
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-pc-ink">{p.name}</p>
                      <p className={`text-[11px] ${isConnected ? 'text-pc-green font-medium' : 'text-pc-ink-4'}`}>
                        {p.soon ? 'Bientôt disponible' : isConnected ? 'Connecté ✓' : 'Non connecté'}
                      </p>
                    </div>
                  </div>
                  {p.soon ? (
                    <span className="text-[10px] font-bold bg-[#fef3c7] text-[#92400e] px-[10px] py-[4px] rounded-[6px]">Bientôt</span>
                  ) : isConnected ? (
                    <span className="text-[10px] font-bold bg-pc-green-light text-pc-green px-[10px] py-[4px] rounded-[6px] border border-pc-green/20">Actif</span>
                  ) : (
                    <span className="text-[10px] font-medium text-pc-ink-4">Non configuré</span>
                  )}
                </div>
              )
            })}
          </div>
        </section>

        {/* Notifications */}
        <section>
          <Rule>Préférences</Rule>
          <div className="bg-pc-surface border border-pc-border rounded-card px-5 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[13px] font-semibold text-pc-ink">Notifications push</p>
                <p className="text-[12px] text-pc-ink-4 mt-[2px]">{notifOn ? 'Rappel chaque lundi matin' : 'Désactivé'}</p>
              </div>
              <button
                onClick={handleNotifToggle}
                className={`w-[44px] h-6 rounded-full transition-colors duration-150 relative flex-shrink-0 ${notifOn ? 'bg-pc-green' : 'bg-pc-border'}`}
              >
                <span className={`w-[18px] h-[18px] bg-white rounded-full absolute top-[3px] shadow-sm transition-all duration-150 ${notifOn ? 'left-[23px]' : 'left-[3px]'}`} />
              </button>
            </div>
          </div>
        </section>

        {/* Danger zone */}
        <section>
          <Rule>Zone dangereuse</Rule>
          <div className="bg-pc-surface border border-[#fecaca] rounded-card px-5 py-5">
            <p className="text-[13px] text-pc-ink-2 mb-4 leading-relaxed">
              La suppression de ton compte est définitive et irréversible. Toutes tes données seront effacées.
            </p>
            <button onClick={() => setShowDeleteModal(true)}
              className="text-[13px] font-bold text-[#ef4444] border border-[#fecaca] rounded-btn px-4 py-[9px] hover:bg-[#fef2f2] transition-colors">
              Supprimer mon compte
            </button>
          </div>
        </section>

      </div>

      {/* Delete modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 px-5 pb-5 sm:pb-0">
          <div className="bg-pc-surface rounded-card p-6 max-w-sm w-full border border-pc-border">
            <h3 className="text-[18px] font-black tracking-[-0.03em] text-pc-ink mb-2">Supprimer le compte ?</h3>
            <p className="text-[13px] text-pc-ink-3 leading-[1.6] mb-4">
              Toutes tes données seront supprimées définitivement et irrémédiablement — posts, idées, historique, compte.
            </p>
            <p className="text-[12px] font-semibold text-pc-ink mb-2">
              Tape <span className="font-black text-[#ef4444]">SUPPRIMER</span> pour confirmer
            </p>
            <input
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="SUPPRIMER"
              className="w-full bg-pc-bg border border-pc-border rounded-btn px-4 py-[10px] text-[13px] text-pc-ink placeholder:text-pc-ink-4 focus:outline-none focus:border-[#ef4444] transition-all mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setShowDeleteModal(false); setDeleteConfirmText('') }}
                className="flex-1 py-[11px] rounded-btn border border-pc-border text-[13px] font-semibold text-pc-ink-2 hover:bg-pc-bg transition-colors">
                Annuler
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteLoading || deleteConfirmText !== 'SUPPRIMER'}
                className="flex-1 py-[11px] rounded-btn bg-[#ef4444] text-white text-[13px] font-bold hover:bg-[#dc2626] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {deleteLoading ? 'Suppression...' : 'Supprimer définitivement'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── FaqItem ───────────────────────────────────────────────────────────────────
function FaqItem({ question, answer }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="bg-pc-surface border border-pc-border rounded-elem overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-[14px] text-left"
        aria-expanded={open}
      >
        <span className="text-[13px] font-semibold text-pc-ink pr-4">{question}</span>
        <svg
          width="14" height="14" viewBox="0 0 14 14" fill="none"
          stroke="#737373" strokeWidth="2" strokeLinecap="round"
          className={`flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        >
          <path d="M2 5l5 5 5-5" />
        </svg>
      </button>
      {open && (
        <div className="px-4 pb-[14px] text-[12px] text-pc-ink-3 leading-[1.65]">
          {answer}
        </div>
      )}
    </div>
  )
}

// ── UsageMeter ────────────────────────────────────────────────────────────────
function UsageMeter({ label, sub, used, max, noBar = false }) {
  const isUnlimited = max === Infinity
  const pct         = isUnlimited ? 0 : Math.min((used / max) * 100, 100)
  const almostOut   = !isUnlimited && pct >= 80
  const exhausted   = !isUnlimited && used >= max

  return (
    <div className={`bg-pc-surface border rounded-elem px-4 py-3
      ${exhausted ? 'border-[#fca5a5]' : almostOut ? 'border-[#fde68a]' : 'border-pc-border'}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[12px] font-semibold text-pc-ink">{label}</span>
        <span className={`text-[11px] font-bold pc-num
          ${exhausted ? 'text-[#ef4444]' : almostOut ? 'text-[#d97706]' : 'text-pc-ink-4'}`}>
          {isUnlimited ? (
            <span className="text-pc-green">∞ illimité</span>
          ) : (
            `${used} / ${max}`
          )}
        </span>
      </div>
      {!noBar && !isUnlimited && (
        <div className="h-[3px] bg-pc-rule rounded-full overflow-hidden mb-1">
          <div
            className={`h-full rounded-full transition-all duration-500
              ${exhausted ? 'bg-[#ef4444]' : almostOut ? 'bg-[#f59e0b]' : 'bg-pc-green'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
      <div className="text-[10px] text-pc-ink-4">{sub}</div>
    </div>
  )
}
