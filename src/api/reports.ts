import { apiFetch } from './client'
import type { ApiResponse } from './chat'

export type ReportReason =
  | 'HARASSMENT'
  | 'OBSCENE_CONTENT'
  | 'PRIVACY_VIOLATION'

export interface CreateReportRequest {
  reportedUserId: string
  reason: ReportReason
  description: string
}

// 신고 시 신고자·피신고자 상호 차단 + 진행 중인 채팅방 자동 종료(ROOM_CLOSED)됨 (reports.md 참고)
// 같은 사용자 재신고 시 409 Conflict
export function createReport(
  body: CreateReportRequest
): Promise<ApiResponse<null>> {
  return apiFetch<ApiResponse<null>>('/api/reports', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}
