import { apiFetch } from './client'

export interface UpdateProfileRequest {
  nickname: string
  profileImageUrl: string
}

export interface UserProfile {
  nickname: string
  profileImageUrl: string
  helpRequestCount: number
  helpCount: number
  hasCreatedCard: boolean
}

export function postUserProfile(body: UpdateProfileRequest): Promise<void> {
  return apiFetch<void>('/api/user/profile', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function getUserProfile(): Promise<UserProfile> {
  return apiFetch<UserProfile>('/api/user/profile')
}

export function putUserProfile(
  body: UpdateProfileRequest
): Promise<UserProfile> {
  return apiFetch<UserProfile>('/api/user/profile', {
    method: 'PUT',
    body: JSON.stringify(body),
  })
}

export function deleteUser(): Promise<void> {
  return apiFetch<void>('/api/user', {
    method: 'DELETE',
  })
}
