import { apiFetch } from './client'
import type { ApiResponse } from './chat'

export type ReportReason =
  | 'HARASSMENT'
  | 'OBSCENE_CONTENT'
  | 'PRIVACY_VIOLATION'

export interface CreateChatRoomReportRequest {
  reason: ReportReason
  description: string
}

export function createChatRoomReport(
  roomId: string,
  body: CreateChatRoomReportRequest
): Promise<ApiResponse<null>> {
  return apiFetch<ApiResponse<null>>(`/api/reports/chat-rooms/${roomId}`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}
