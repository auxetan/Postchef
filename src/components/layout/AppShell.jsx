import { useLocation, Outlet } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Sidebar from './Sidebar.jsx'
import BottomNav from './BottomNav.jsx'
import ToastContainer from '../ui/ToastContainer.jsx'

export default function AppShell() {
  const location = useLocation()

  return (
    <div className="min-h-screen bg-pc-bg">
      <Sidebar />
      <main className="lg:ml-[220px] pb-28 lg:pb-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <BottomNav />
      <ToastContainer />
    </div>
  )
}
