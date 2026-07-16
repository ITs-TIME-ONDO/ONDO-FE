import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import ScreenScaler from './components/ScreenScaler'
import Home from './Home'
import LoginPage from './pages/login/LoginPage'
import KakaoCallbackPage from './pages/login/KakaoCallbackPage'
import ProfilePage from './pages/login/ProfilePage'
import TermsPage from './pages/login/TermsPage'
import RequestPage from './pages/home/RequestPage'
import ChatPage from './pages/chat/ChatPage'
import ChatRoomPage from './pages/chat/ChatRoomPage'
import MyPage from './pages/mypage/MyPage'
import ProfileEditPage from './pages/mypage/ProfileEditPage'
import WithdrawPage from './pages/mypage/WithdrawPage'
import LocationPage from './pages/location/location'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isLoggedIn = localStorage.getItem('onboardingCompleted') === 'true'
  return isLoggedIn ? <>{children}</> : <Navigate to="/login" replace />
}

function App() {
  const location = useLocation()

  return (
    <ScreenScaler>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/api/auth/kakao/callback" element={<KakaoCallbackPage />} />
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
            path="/request"
            element={
              <ProtectedRoute>
                <RequestPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/chat/:roomId"
            element={
              <ProtectedRoute>
                <ChatRoomPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/mypage"
            element={
              <ProtectedRoute>
                <MyPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/mypage/edit"
            element={
              <ProtectedRoute>
                <ProfileEditPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/mypage/withdraw"
            element={
              <ProtectedRoute>
                <WithdrawPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/location"
            element={<LocationPage />}
          />

          <Route
            path="*"
            element={
              localStorage.getItem('onboardingCompleted') === 'true' ? (
                <Navigate to="/" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
        </Routes>
      </AnimatePresence>
    </ScreenScaler>
  )
}

export default App
