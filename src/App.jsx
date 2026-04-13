import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import Landing from './pages/Landing.jsx'
import OnboardingRouter from './pages/onboarding/OnboardingRouter.jsx'
import AppShell from './components/layout/AppShell.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Calendar from './pages/Calendar.jsx'
import Ideas from './pages/Ideas.jsx'
import Analytics from './pages/Analytics.jsx'
import Account from './pages/Account.jsx'
import Trends from './pages/Trends.jsx'
import Studio from './pages/Studio.jsx'
import AiChat from './pages/AiChat.jsx'
import Login from './pages/auth/Login.jsx'
import Signup from './pages/auth/Signup.jsx'
import ForgotPassword from './pages/auth/ForgotPassword.jsx'
import useAppStore from './store/useAppStore.js'
import {
  PublicOnlyRoute,
  RequireAppAccess,
  RequireAuth,
  RequireOnboarding,
} from './components/auth/RouteGuards.jsx'

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
      <Routes>
        <Route path="/" element={<Landing />} />
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
    </BrowserRouter>
    </ErrorBoundary>
  )
}
