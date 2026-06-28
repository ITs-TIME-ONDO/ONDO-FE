import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Home from './Home'
import LoginPage from './pages/login/LoginPage'
import ProfilePage from './pages/login/ProfilePage'
import TermsPage from './pages/login/TermsPage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isLoggedIn = localStorage.getItem('onboardingCompleted') === 'true'
  return isLoggedIn ? <>{children}</> : <Navigate to="/login" replace />
}

function App() {
  const location = useLocation()

  return (
    <div
      className="relative overflow-hidden"
      style={{ width: '100%', maxWidth: 390, minHeight: '100dvh', margin: '0 auto' }}
    >
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="*"
            element={
              localStorage.getItem('onboardingCompleted') === 'true'
                ? <Navigate to="/" replace />
                : <Navigate to="/login" replace />
            }
          />
        </Routes>
      </AnimatePresence>
    </div>
  )
}

export default App
