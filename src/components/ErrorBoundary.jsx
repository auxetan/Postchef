import { Component } from 'react'

/**
 * ErrorBoundary global — capture les erreurs React non gérées.
 * Affiche un écran de récupération propre plutôt qu'un écran blanc.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    // En production, brancher ici Sentry ou équivalent
    console.error('[PostChef ErrorBoundary]', error, info.componentStack)
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div className="min-h-screen bg-pc-bg flex items-center justify-center px-6">
        <div className="max-w-sm w-full text-center">
          <div className="w-16 h-16 rounded-full bg-[#FEF2F2] flex items-center justify-center mx-auto mb-5">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <h1 className="text-[20px] font-black text-pc-ink mb-2 tracking-tight">
            Une erreur est survenue
          </h1>
          <p className="text-[13px] text-pc-ink-3 leading-relaxed mb-6">
            PostChef a rencontré un problème inattendu. Tes données sont préservées.
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null })
              window.location.href = '/app'
            }}
            className="w-full bg-pc-ink text-white font-bold text-[14px] py-[12px] rounded-pill hover:opacity-90 transition-opacity"
          >
            Retourner au tableau de bord
          </button>
          {import.meta.env.DEV && this.state.error && (
            <pre className="mt-4 text-left text-[10px] text-red-500 bg-red-50 rounded-lg p-3 overflow-auto max-h-40">
              {this.state.error.toString()}
            </pre>
          )}
        </div>
      </div>
    )
  }
}
