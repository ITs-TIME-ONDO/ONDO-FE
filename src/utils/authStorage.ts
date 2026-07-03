import type { KakaoCallbackResponse } from '../api/auth'

const ACCESS_TOKEN_KEY = 'accessToken'
const REFRESH_TOKEN_KEY = 'refreshToken'
const TOKEN_TYPE_KEY = 'tokenType'
const EXPIRES_AT_KEY = 'accessTokenExpiresAt'

export function saveTokens({ accessToken, refreshToken, tokenType, expiresIn }: KakaoCallbackResponse) {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  localStorage.setItem(TOKEN_TYPE_KEY, tokenType)
  localStorage.setItem(EXPIRES_AT_KEY, String(Date.now() + expiresIn * 1000))
}

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem(TOKEN_TYPE_KEY)
  localStorage.removeItem(EXPIRES_AT_KEY)
}
