import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthShell from '../../components/auth/AuthShell.jsx'
import OAuthButtons from '../../components/auth/OAuthButtons.jsx'
import useAuth from '../../hooks/useAuth.js'

const inputClass = 'w-full bg-pc-bg border border-pc-border rounded-btn px-4 py-[12px] text-[14px] text-pc-ink placeholder:text-pc-ink-4 focus:outline-none focus:border-pc-green focus:ring-2 focus:ring-pc-green/10 transition-all'

export default function Signup() {
  const navigate = useNavigate()
  const { signUp, isConfigured, isDemoMode } = useAuth()
  const [firstName, setFirstName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    setNotice('')

    const { error: signUpError, needsEmailConfirmation } = await signUp({
      email,
      password,
      firstName,
    })

    if (signUpError) {
      setError(signUpError.message || 'Création du compte impossible.')
      setLoading(false)
      return
    }

    if (needsEmailConfirmation) {
      setNotice('Compte créé. Vérifie ton email pour confirmer ton inscription avant de continuer.')
      setLoading(false)
      return
    }

    navigate('/onboarding', { replace: true })
  }

  return (
    <AuthShell
      eyebrow="Inscription"
      title="Crée ton espace PostChef."
      subtitle="On attache ton onboarding, ton calendrier et ta stratégie contenu à un vrai compte pour éviter de repartir de zéro."
      footer={
        <p className="text-[12px] text-pc-ink-4">
          Déjà inscrit ?{' '}
          <Link to="/login" className="font-bold text-pc-green hover:underline">
            Se connecter
          </Link>
        </p>
      }
    >
      {!isConfigured && isDemoMode && (
        <div className="rounded-card border border-pc-amber-border bg-pc-amber-light px-4 py-3 text-[12px] text-pc-amber-text leading-[1.6]">
          Supabase n’est pas encore configuré. L’inscription crée une session de démo locale pour continuer le développement.
        </div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="pc-section-label block mb-2">Prénom</label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className={inputClass}
            placeholder="Marco"
            required
          />
        </div>

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
          <label className="pc-section-label block mb-2">Mot de passe</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
            placeholder="8 caractères minimum"
            required={!isDemoMode}
            minLength={isDemoMode ? undefined : 8}
          />
        </div>

        {error && (
          <div className="rounded-elem border border-pc-danger-light bg-pc-danger-bg px-4 py-3 text-[12px] text-pc-danger-dark">
            {error}
          </div>
        )}

        {notice && (
          <div className="rounded-elem border border-[#bbf7d0] bg-[#f0fdf4] px-4 py-3 text-[12px] text-[#166534]">
            {notice}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !firstName || !email || (!isDemoMode && password.length < 8)}
          className="w-full py-[13px] rounded-btn bg-pc-green text-white text-[14px] font-black hover:bg-pc-green-dark transition-colors disabled:opacity-50"
        >
          {loading ? 'Création du compte...' : 'Créer mon compte'}
        </button>
      </form>

      <OAuthButtons />
    </AuthShell>
  )
}
