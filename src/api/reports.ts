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

// 신고 시 신고자·피신고자 상호 차단 + 채팅방 자동 종료(ROOM_CLOSED) + 누적 5건 이상 시 자동 정지 (reports.md 참고)
// 신고 대상 UUID는 클라이언트가 넘기지 않음 — roomId로 참여자를 조회해 서버가 상대방을 특정
// 요청자가 해당 채팅방 참여자가 아니면 403, 같은 사용자 재신고 시 409 Conflict
export function createChatRoomReport(
  roomId: string,
  body: CreateChatRoomReportRequest
): Promise<ApiResponse<null>> {
  return apiFetch<ApiResponse<null>>(`/api/reports/chat-rooms/${roomId}`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}
