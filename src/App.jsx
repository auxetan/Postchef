import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import useAppStore from './store/useAppStore.js'
import {
  PublicOnlyRoute,
  RequireAppAccess,
  RequireAuth,
  RequireOnboarding,
} from './components/auth/RouteGuards.jsx'
import { SpinnerPage } from './components/ui/Spinner.jsx'

// Eager — toujours nécessaire
import Landing from './pages/Landing.jsx'
import AppShell from './components/layout/AppShell.jsx'

// Lazy — chargés à la demande par route
const Demo           = lazy(() => import('./pages/Demo.jsx'))
const OnboardingRouter = lazy(() => import('./pages/onboarding/OnboardingRouter.jsx'))
const Dashboard      = lazy(() => import('./pages/Dashboard.jsx'))
const Calendar       = lazy(() => import('./pages/Calendar.jsx'))
const Ideas          = lazy(() => import('./pages/Ideas.jsx'))
const Analytics      = lazy(() => import('./pages/Analytics.jsx'))
const Account        = lazy(() => import('./pages/Account.jsx'))
const Trends         = lazy(() => import('./pages/Trends.jsx'))
const Studio         = lazy(() => import('./pages/Studio.jsx'))
const AiChat         = lazy(() => import('./pages/AiChat.jsx'))
const Login          = lazy(() => import('./pages/auth/Login.jsx'))
const Signup         = lazy(() => import('./pages/auth/Signup.jsx'))
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword.jsx'))

function Loader() {
  return <SpinnerPage label="Chargement…" />
}

function UsageResetGuard() {
  const checkUsageReset = useAppStore((s) => s.checkUsageReset)
  useEffect(() => {
    checkUsageReset()
  }, [checkUsageReset])
  return null
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <UsageResetGuard />
        <Suspense fallback={<Loader />}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/demo" element={<Demo />} />

            <Route element={<PublicOnlyRoute />}>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
            </Route>

            <Route element={<RequireAuth />}>
              <Route element={<RequireOnboarding />}>
                <Route path="/onboarding/*" element={<OnboardingRouter />} />
              </Route>

              <Route element={<RequireAppAccess />}>
                <Route path="/app" element={<AppShell />}>
                  <Route index element={<Dashboard />} />
                  <Route path="calendar" element={<Calendar />} />
                  <Route path="ideas" element={<Ideas />} />
                  <Route path="trends" element={<Trends />} />
                  <Route path="studio" element={<Studio />} />
                  <Route path="analytics" element={<Analytics />} />
                  <Route path="account" element={<Account />} />
                  <Route path="chef-ia" element={<AiChat />} />
                </Route>
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  )
}
