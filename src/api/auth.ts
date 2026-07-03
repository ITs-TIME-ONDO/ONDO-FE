import { apiFetch, apiUrl } from './client'

export interface KakaoCallbackRequest {
  code: string
  state: string
}

export interface KakaoCallbackResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn: number
  isNewUser: boolean
}

export function getKakaoLoginUrl(): string {
  return apiUrl('/api/auth/kakao')
}

export function postKakaoCallback(body: KakaoCallbackRequest): Promise<KakaoCallbackResponse> {
  return apiFetch<KakaoCallbackResponse>('/api/auth/kakao/callback', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}
