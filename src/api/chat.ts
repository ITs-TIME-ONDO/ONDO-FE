// 타입 정의만 우선 작성 (docs/api/chat.md 기준). API 함수 연동은 다음 체크리스트 단계에서 진행.

export interface ApiResponse<T> {
  success: boolean
  data: T
  error?: {
    code: string
    message: string
  } | null
}

export interface PageResponse<T> {
  content: T[]
  pageable: {
    pageNumber: number
    pageSize: number
  }
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
}

export type ChatRoomStatus = 'ACTIVE' | 'CLOSED'

export interface ChatRoomSummary {
  id: string
  cardId: string
  status: ChatRoomStatus
  createdAt: string
  closedAt: string | null
  unreadCount: number
  // 상대방 미정 시 null (발생 조건 TBD)
  opponentNickname: string | null
  opponentProfileImageUrl: string | null
  // 메시지 없으면 null. 발신 시각 필드 없음
  lastMessage: string | null
}

export type MessageType = 'TEXT' | 'IMAGE' | 'LOCATION' | 'ROOM_CLOSED'

export interface ChatMessage {
  id: string
  chatRoomId: string
  senderId: string
  senderNickname: string
  messageType: MessageType
  content: string | null
  sentAt: string
  // null이면 미읽음
  readAt: string | null
}

export interface ChatMessagesResponse {
  messages: ChatMessage[]
  hasNext: boolean
  nextCursor: string | null
}

export interface ChatRoomLocation {
  latitude: number
  longitude: number
  city: string
}

export interface ChatMessageLocation {
  latitude: number
  longitude: number
  placeName?: string
}

// TBD: TEXT 외 필드 스펙 (docs/api/chat.md TBD 참고)
export interface ChatMessageSendRequest {
  messageType: MessageType
  content?: string | null
  location?: ChatMessageLocation | null
}

export interface ChatReadEvent {
  roomId: string
  readerId: string
  messageIds: string[]
  readAt: string
}
