import { apiFetch } from './client'

export interface UpdateProfileRequest {
  nickname?: string
  profileImage?: File | null
}

export interface UserProfile {
  nickname: string
  profileImageUrl: string
  helpRequestCount: number
  helpCount: number
  hasCreatedCard: boolean
}

// 닉네임/프로필 이미지 중 최소 하나는 필수. multipart/form-data로 전송 (request: JSON part, profileImage: 파일 part)
function buildProfileFormData({ nickname, profileImage }: UpdateProfileRequest): FormData {
  const formData = new FormData()
  formData.append(
    'request',
    new Blob([JSON.stringify({ nickname })], { type: 'application/json' })
  )
  if (profileImage) {
    formData.append('profileImage', profileImage)
  }
  return formData
}

export function postUserProfile(body: UpdateProfileRequest): Promise<void> {
  return apiFetch<void>('/api/user/profile', {
    method: 'POST',
    body: buildProfileFormData(body),
  })
}

export function getUserProfile(): Promise<UserProfile> {
  return apiFetch<UserProfile>('/api/user/profile')
}

export function putUserProfile(
  body: UpdateProfileRequest,
  signal?: AbortSignal
): Promise<void> {
  return apiFetch<void>('/api/user/profile', {
    method: 'PUT',
    body: buildProfileFormData(body),
    signal,
  })
}

export function deleteUser(): Promise<void> {
  return apiFetch<void>('/api/user', {
    method: 'DELETE',
  })
}
