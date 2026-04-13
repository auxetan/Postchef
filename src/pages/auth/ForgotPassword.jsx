import { useState } from 'react'
import { Link } from 'react-router-dom'
import AuthShell from '../../components/auth/AuthShell.jsx'
import useAuth from '../../hooks/useAuth.js'

const inputClass = 'w-full bg-pc-bg border border-pc-border rounded-btn px-4 py-[12px] text-[14px] text-pc-ink placeholder:text-pc-ink-4 focus:outline-none focus:border-pc-green focus:ring-2 focus:ring-pc-green/10 transition-all'

export default function ForgotPassword() {
  const { resetPassword, isConfigured } = useAuth()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    setNotice('')

    const { error: resetError } = await resetPassword(email)

    if (resetError) {
      setError(resetError.message || 'Envoi impossible.')
      setLoading(false)
      return
    }

    setNotice('Email envoyé. Vérifie ta boîte mail pour réinitialiser ton mot de passe.')
    setLoading(false)
  }

  return (
    <AuthShell
      eyebrow="Réinitialisation"
      title="Réinitialise ton mot de passe."
      subtitle="On t’envoie un lien sécurisé pour récupérer l’accès à ton compte PostChef."
      footer={
        <p className="text-[12px] text-pc-ink-4">
          Tu te souviens de ton mot de passe ?{' '}
          <Link to="/login" className="font-bold text-pc-green hover:underline">
            Revenir à la connexion
          </Link>
        </p>
      }
    >
      {!isConfigured && (
        <div className="rounded-card border border-[#FDE68A] bg-[#FFFBEB] px-4 py-3 text-[12px] text-[#92400E] leading-[1.6]">
          Supabase doit être configuré pour envoyer un email de réinitialisation.
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

        {error && (
          <div className="rounded-elem border border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-[12px] text-[#b91c1c]">
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
          disabled={loading || !email || !isConfigured}
          className="w-full py-[13px] rounded-btn bg-pc-green text-white text-[14px] font-black hover:bg-pc-green-dark transition-colors disabled:opacity-50"
        >
          {loading ? 'Envoi...' : 'Envoyer le lien'}
        </button>
      </form>
    </AuthShell>
  )
}
