const BASE_URL = import.meta.env.VITE_API_BASE_URL

export class ApiError extends Error {
  status: number
  code?: string

  constructor(status: number, message: string, code?: string) {
    super(message)
    this.status = status
    this.code = code
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    credentials: 'include',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!res.ok) {
    let code: string | undefined
    let message = `요청에 실패했습니다. (${res.status})`
    try {
      const body = await res.json()
      code = body.error?.code
      message = body.error?.message ?? message
    } catch {
      // 에러 응답 본문이 없거나 JSON이 아닌 경우 기본 메시지 사용
    }
    throw new ApiError(res.status, message, code)
  }

  if (res.status === 204) {
    return undefined as T
  }

  return res.json() as Promise<T>
}

export function apiUrl(path: string): string {
  return `${BASE_URL}${path}`
}
