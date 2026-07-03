import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'

import 'pretendard/dist/web/static/pretendard.css'
import './index.css'

import App from './App.tsx'

if (
  window.location.pathname === '/api/auth/kakao/callback' &&
  !window.location.hash
) {
  window.history.replaceState(
    null,
    '',
    `${window.location.origin}/#/api/auth/kakao/callback${window.location.search}`
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>
)
