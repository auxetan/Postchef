import { Navigate, Outlet, useLocation } from 'react-router-dom'
import useAppStore from '../../store/useAppStore.js'
import useAuth from '../../hooks/useAuth.js'

function AuthLoader({ label = 'Chargement de ton espace...' }) {
  return (
    <div className="min-h-screen bg-pc-bg flex items-center justify-center px-6">
      <div className="max-w-sm w-full text-center">
        <div
          className="w-12 h-12 rounded-full mx-auto mb-4 animate-spin"
          style={{ border: '2px solid #E8E8E6', borderTopColor: '#1D9E75' }}
        />
        <p className="text-[15px] font-bold text-pc-ink">{label}</p>
        <p className="text-[12px] text-pc-ink-4 mt-1">PostChef prépare ton espace sécurisé.</p>
      </div>
    </div>
  )
}

export function PublicOnlyRoute() {
  const location = useLocation()
  const { user, loading, syncStatus } = useAuth()
  const onboardingCompleted = useAppStore((s) => s.onboarding.completed)

  if (loading || (user && syncStatus === 'loading')) {
    return <AuthLoader label="Vérification de ta session..." />
  }

  if (user) {
    return (
      <Navigate
        to={onboardingCompleted ? '/app' : '/onboarding'}
        replace
        state={{ from: location }}
      />
    )
  }

  return <Outlet />
}

export function RequireAuth() {
  const location = useLocation()
  const { user, loading } = useAuth()

  if (loading) {
    return <AuthLoader />
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}

export function RequireOnboarding() {
  const { user, loading, syncStatus } = useAuth()
  const onboardingCompleted = useAppStore((s) => s.onboarding.completed)

  if (loading || (user && syncStatus === 'loading')) {
    return <AuthLoader label="Chargement de ton onboarding..." />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (onboardingCompleted) {
    return <Navigate to="/app" replace />
  }

  return <Outlet />
}

export function RequireAppAccess() {
  const { user, loading, syncStatus } = useAuth()
  const onboardingCompleted = useAppStore((s) => s.onboarding.completed)

  if (loading || (user && syncStatus === 'loading')) {
    return <AuthLoader label="Chargement de ton tableau de bord..." />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (!onboardingCompleted) {
    return <Navigate to="/onboarding" replace />
  }

  return <Outlet />
}
