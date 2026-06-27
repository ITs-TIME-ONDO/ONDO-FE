import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Home from './Home'
import LoginPage from './pages/login/LoginPage'
import ProfilePage from './pages/login/ProfilePage'
import TermsPage from './pages/login/TermsPage'

function App() {
  const location = useLocation()

  return (
    <div
      className="relative overflow-hidden"
      style={{ width: 390, minHeight: '100dvh', margin: '0 auto' }}
    >
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/terms" element={<TermsPage />} />
        </Routes>
      </AnimatePresence>
    </div>
  )
}

export default App
