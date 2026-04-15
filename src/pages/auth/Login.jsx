import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AuthShell from '../../components/auth/AuthShell.jsx'
import OAuthButtons from '../../components/auth/OAuthButtons.jsx'
import useAuth from '../../hooks/useAuth.js'

const inputClass = 'w-full bg-pc-bg border border-pc-border rounded-btn px-4 py-[12px] text-[14px] text-pc-ink placeholder:text-pc-ink-4 focus:outline-none focus:border-pc-green focus:ring-2 focus:ring-pc-green/10 transition-all'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { signIn, isConfigured, isDemoMode } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    const { error: signInError } = await signIn({ email, password })

    if (signInError) {
      setError(signInError.message || 'Connexion impossible.')
      setLoading(false)
      return
    }

    navigate(location.state?.from || '/app', { replace: true })
  }

  return (
    <AuthShell
      eyebrow="Connexion"
      title="Retrouve ton espace PostChef."
      subtitle="Connecte-toi pour reprendre ton onboarding, tes idées, ton calendrier et tes réglages depuis n’importe quel appareil."
      footer={
        <p className="text-[12px] text-pc-ink-4">
          Pas encore de compte ?{' '}
          <Link to="/signup" className="font-bold text-pc-green hover:underline">
            Créer un compte
          </Link>
        </p>
      }
    >
      {!isConfigured && isDemoMode && (
        <div className="rounded-card border border-pc-amber-border bg-pc-amber-light px-4 py-3 text-[12px] text-pc-amber-text leading-[1.6]">
          Supabase n’est pas encore configuré. Le formulaire fonctionne en mode démo local pour continuer le chantier sans bloquer l’app.
        </div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="pc-section-label block mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            placeholder="marco@latrattoria.fr"
            required
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="pc-section-label block">Mot de passe</label>
            <Link to="/forgot-password" className="text-[12px] font-semibold text-pc-green hover:underline">
              Mot de passe oublié ?
            </Link>
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
            placeholder="••••••••"
            required={!isDemoMode}
          />
        </div>

        {error && (
          <div className="rounded-elem border border-pc-danger-light bg-pc-danger-bg px-4 py-3 text-[12px] text-pc-danger-dark">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !email}
          className="w-full py-[13px] rounded-btn bg-pc-green text-white text-[14px] font-black hover:bg-pc-green-dark transition-colors disabled:opacity-50"
        >
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>
      </form>

      <OAuthButtons />
    </AuthShell>
  )
}
