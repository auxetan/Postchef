import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/Landing.jsx'
import OnboardingRouter from './pages/onboarding/OnboardingRouter.jsx'
import AppShell from './components/layout/AppShell.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Calendar from './pages/Calendar.jsx'
import Ideas from './pages/Ideas.jsx'
import Analytics from './pages/Analytics.jsx'
import Account from './pages/Account.jsx'
import Trends from './pages/Trends.jsx'
import useAppStore from './store/useAppStore.js'

function UsageResetGuard() {
  const checkUsageReset = useAppStore((s) => s.checkUsageReset)
  useEffect(() => {
    checkUsageReset()
  }, [checkUsageReset])
  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <UsageResetGuard />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/onboarding/*" element={<OnboardingRouter />} />
        <Route path="/app" element={<AppShell />}>
          <Route index element={<Dashboard />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="ideas" element={<Ideas />} />
          <Route path="trends" element={<Trends />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="account" element={<Account />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
