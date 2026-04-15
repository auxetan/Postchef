/**
 * OAuthButtons — Boutons Google + Apple pour Login et Signup.
 * Encapsule l'appel signInWithOAuth + états loading/erreur.
 */
import { useState } from 'react'
import useAuth from '../../hooks/useAuth.js'

export default function OAuthButtons() {
  const { signInWithOAuth, isDemoMode } = useAuth()
  const [loadingProvider, setLoadingProvider] = useState(null)
  const [error, setError] = useState('')

  const handleOAuth = async (provider) => {
    setLoadingProvider(provider)
    setError('')
    const { error: oauthError } = await signInWithOAuth({ provider })
    if (oauthError) {
      setError(oauthError.message || `Connexion ${provider} impossible.`)
      setLoadingProvider(null)
    }
    // Pas de setLoading(null) en cas de succès : la page va se rediriger
  }

  if (isDemoMode) return null

  return (
    <div>
      {/* Séparateur */}
      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px bg-pc-rule" />
        <span className="text-[11px] font-semibold text-pc-ink-4">ou continuer avec</span>
        <div className="flex-1 h-px bg-pc-rule" />
      </div>

      {/* Boutons */}
      <div className="flex flex-col gap-3">
        {/* Google */}
        <button
          type="button"
          onClick={() => handleOAuth('google')}
          disabled={!!loadingProvider}
          className="w-full flex items-center justify-center gap-3 py-[12px] rounded-btn border border-pc-border bg-pc-surface text-[14px] font-semibold text-pc-ink hover:bg-pc-bg transition-colors disabled:opacity-50"
        >
          {loadingProvider === 'google' ? (
            <span className="w-5 h-5 rounded-full border-2 border-pc-ink-4 border-t-pc-green animate-spin" />
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
          )}
          Continuer avec Google
        </button>

        {/* Apple */}
        <button
          type="button"
          onClick={() => handleOAuth('apple')}
          disabled={!!loadingProvider}
          className="w-full flex items-center justify-center gap-3 py-[12px] rounded-btn border border-pc-border bg-pc-ink text-[14px] font-semibold text-white hover:bg-pc-ink-2 transition-colors disabled:opacity-50"
        >
          {loadingProvider === 'apple' ? (
            <span className="w-5 h-5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
          ) : (
            <svg width="18" height="20" viewBox="0 0 814 1000" fill="white">
              <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-47.4-148.2-108C27 439.6 7 340.8 7 250c0-154.6 100-236.3 191.5-236.3 50.7 0 93.1 32.8 124.8 32.8 30.3 0 78-35.1 135.7-35.1 21.1 0 108.2 1.9 163.8 80.5zM555.8 77c-23.9 28.1-50.5 51.8-91.5 51.8-4.4 0-8.9-.3-13.4-1.1-.9-3.8-1.3-7.7-1.3-11.7 0-31.4 16.2-61.7 34.2-81.7 22-24.5 59-42.8 90.6-44.2.9 4.3 1.3 8.5 1.3 12.8 0 31.3-13.7 63.2-19.9 73.1z"/>
            </svg>
          )}
          Continuer avec Apple
        </button>
      </div>

      {error && (
        <div className="mt-3 rounded-elem border border-pc-danger-light bg-pc-danger-bg px-4 py-3 text-[12px] text-pc-danger-dark">
          {error}
        </div>
      )}
    </div>
  )
}
