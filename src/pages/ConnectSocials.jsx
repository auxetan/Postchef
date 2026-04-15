/**
 * ConnectSocials
 * Page de gestion des connexions réseaux sociaux via Ayrshare.
 * Accessible depuis Compte → "Réseaux sociaux".
 */
import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import useToastStore from '../store/useToastStore.js'
import useAppStore   from '../store/useAppStore.js'
import { supabase }  from '../lib/supabaseClient.js'

// ── Données plateforme ────────────────────────────────────────────────────────
const PLATFORMS = [
  {
    id: 'instagram',
    label: 'Instagram',
    color: 'text-[#E1306C]',
    bg:    'bg-[#fdf2f7]',
    border:'border-[#f5c2d8]',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
      </svg>
    ),
  },
  {
    id: 'tiktok',
    label: 'TikTok',
    color: 'text-pc-ink',
    bg:    'bg-pc-bg',
    border:'border-pc-border',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 000 12.68 6.34 6.34 0 006.33-6.34V8.69a8.26 8.26 0 004.84 1.55V6.79a4.85 4.85 0 01-1.07-.1z"/>
      </svg>
    ),
  },
  {
    id: 'facebook',
    label: 'Facebook',
    color: 'text-[#1877F2]',
    bg:    'bg-[#f0f5ff]',
    border:'border-[#bfd0f5]',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
  },
]

// ── Composant principal ───────────────────────────────────────────────────────
export default function ConnectSocials() {
  const navigate = useNavigate()
  const toast    = useToastStore((s) => s.toast)

  // Connexions chargées depuis Supabase
  const [connections, setConnections]   = useState({}) // { instagram: {...}, tiktok: {...} }
  const [loadingPlatform, setLoadingPlatform] = useState(null)
  const [fetching, setFetching]         = useState(true)

  // ── Charger les connexions depuis Supabase ────────────────────────────────
  const loadConnections = useCallback(async () => {
    if (!supabase) { setFetching(false); return }
    const { data, error } = await supabase
      .from('social_connections')
      .select('platform, display_name, status, connected_at')

    if (error) {
      console.error('[ConnectSocials] load error', error)
    } else {
      const map = {}
      for (const row of (data || [])) map[row.platform] = row
      setConnections(map)
    }
    setFetching(false)
  }, [])

  useEffect(() => { loadConnections() }, [loadConnections])

  // ── Connecter une plateforme ───────────────────────────────────────────────
  const handleConnect = async (platformId) => {
    if (!supabase) { toast('Supabase non configuré'); return }

    setLoadingPlatform(platformId)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) { toast('Session expirée — reconnecte-toi'); return }

      const res = await fetch('/api/ayrshare/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ platform: platformId }),
      })

      const data = await res.json()
      if (!res.ok) {
        toast(data?.error?.message || 'Impossible de générer le lien de connexion')
        return
      }

      // Sauvegarder la connexion (statut pending jusqu'au callback Ayrshare)
      await supabase
        .from('social_connections')
        .upsert({
          user_id:              session.user.id,
          platform:             platformId,
          ayrshare_profile_key: data.profileKey,
          display_name:         PLATFORMS.find((p) => p.id === platformId)?.label || platformId,
          status:               'connected',
        }, { onConflict: 'user_id,platform' })

      // Ouvrir la page OAuth Ayrshare dans un nouvel onglet
      window.open(data.connectUrl, '_blank', 'noopener,noreferrer')
      toast(`Fenêtre de connexion ${PLATFORMS.find((p) => p.id === platformId)?.label} ouverte ✓`)

      // Recharger les connexions après un court délai
      setTimeout(loadConnections, 2000)
    } catch (err) {
      console.error('[ConnectSocials] connect error', err)
      toast('Erreur réseau — réessaie')
    } finally {
      setLoadingPlatform(null)
    }
  }

  // ── Déconnecter une plateforme ────────────────────────────────────────────
  const handleDisconnect = async (platformId) => {
    if (!supabase) return
    setLoadingPlatform(platformId)
    try {
      const { error } = await supabase
        .from('social_connections')
        .update({ status: 'disconnected' })
        .eq('platform', platformId)

      if (error) throw error

      setConnections((prev) => {
        const next = { ...prev }
        if (next[platformId]) next[platformId] = { ...next[platformId], status: 'disconnected' }
        return next
      })
      toast(`${PLATFORMS.find((p) => p.id === platformId)?.label} déconnecté`)
    } catch (err) {
      console.error('[ConnectSocials] disconnect error', err)
      toast('Erreur lors de la déconnexion')
    } finally {
      setLoadingPlatform(null)
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-pc-bg">

      {/* Header */}
      <div className="bg-pc-surface border-b border-pc-border px-6 pt-7 pb-5 sticky top-0 z-30">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => navigate('/app/account')}
            className="flex items-center gap-1 text-[13px] font-semibold text-pc-ink-4 mb-3 hover:text-pc-ink transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M9 2L4 7l5 5" />
            </svg>
            Compte
          </button>
          <h1 className="text-[26px] font-black tracking-[-0.04em] text-pc-ink leading-none">Réseaux sociaux</h1>
          <p className="text-[12px] text-pc-ink-4 mt-[6px] font-medium">Connecte tes comptes pour publier depuis PostChef</p>
        </div>
      </div>

      <div className="px-6 py-7 max-w-2xl mx-auto space-y-4 pb-28">

        {/* Info box */}
        <div className="bg-pc-blue-light border border-pc-blue-border rounded-elem px-4 py-3">
          <div className="flex gap-3 items-start">
            <svg className="flex-shrink-0 mt-[2px]" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="8" cy="8" r="6"/><path d="M8 5v3M8 10.5v.5"/>
            </svg>
            <p className="text-[12px] text-pc-blue-dark leading-[1.6]">
              La connexion s'effectue via <strong>Ayrshare</strong>, un service tiers sécurisé.
              Une fenêtre OAuth s'ouvre dans un nouvel onglet. Suis les instructions, puis reviens ici.
            </p>
          </div>
        </div>

        {/* Platform cards */}
        {fetching ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 rounded-full border-2 border-pc-green border-t-transparent animate-spin" />
          </div>
        ) : (
          <div className="space-y-3">
            {PLATFORMS.map((platform) => {
              const conn      = connections[platform.id]
              const connected = conn?.status === 'connected'
              const isLoading = loadingPlatform === platform.id

              return (
                <div
                  key={platform.id}
                  className={`bg-pc-surface rounded-card border p-5 flex items-center gap-4 transition-all
                    ${connected ? `${platform.border}` : 'border-pc-border'}`}
                >
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-[10px] flex items-center justify-center flex-shrink-0 ${platform.bg} ${platform.color}`}>
                    {platform.icon}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-bold text-pc-ink">{platform.label}</div>
                    {connected ? (
                      <div className="text-[11px] text-pc-ink-4 mt-[2px] flex items-center gap-1">
                        <span className="w-[6px] h-[6px] rounded-full bg-pc-green inline-block" />
                        Connecté
                        {conn?.display_name && conn.display_name !== platform.label && (
                          <span className="ml-1">· {conn.display_name}</span>
                        )}
                      </div>
                    ) : (
                      <div className="text-[11px] text-pc-ink-4 mt-[2px]">Non connecté</div>
                    )}
                  </div>

                  {/* Action */}
                  {connected ? (
                    <button
                      onClick={() => handleDisconnect(platform.id)}
                      disabled={isLoading}
                      className="text-[12px] font-semibold text-pc-danger border border-pc-danger-light rounded-pill px-4 py-[7px] hover:bg-pc-danger-bg transition-colors disabled:opacity-50 flex-shrink-0"
                    >
                      {isLoading ? '…' : 'Déconnecter'}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleConnect(platform.id)}
                      disabled={isLoading}
                      className="text-[12px] font-semibold text-white bg-pc-green rounded-pill px-4 py-[7px] hover:bg-pc-green-dark transition-colors disabled:opacity-50 flex-shrink-0"
                    >
                      {isLoading ? (
                        <span className="flex items-center gap-1">
                          <span className="w-3 h-3 rounded-full border border-white border-t-transparent animate-spin" />
                          Connexion…
                        </span>
                      ) : 'Connecter'}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Refresh tip */}
        <button
          onClick={loadConnections}
          className="text-[12px] font-semibold text-pc-ink-4 flex items-center gap-1 hover:text-pc-green transition-colors mx-auto block"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 6A5 5 0 0110.5 3.5M11 6a5 5 0 01-9.5 2.5M11 3v3h-3M1 9V6h3"/>
          </svg>
          Actualiser le statut
        </button>

      </div>
    </div>
  )
}
