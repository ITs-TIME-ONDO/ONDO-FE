import { apiFetch } from './client'

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

export interface ChatRoomListParams {
  page?: number
  size?: number
  sort?: string
}

export function getChatRooms(
  params: ChatRoomListParams = {}
): Promise<ApiResponse<PageResponse<ChatRoomSummary>>> {
  const query = new URLSearchParams()
  if (params.page !== undefined) query.set('page', String(params.page))
  if (params.size !== undefined) query.set('size', String(params.size))
  if (params.sort !== undefined) query.set('sort', params.sort)

  const queryString = query.toString()
  return apiFetch<ApiResponse<PageResponse<ChatRoomSummary>>>(
    `/api/chat/rooms${queryString ? `?${queryString}` : ''}`
  )
}

export interface ChatMessageListParams {
  before?: string
  size?: number
}

export function getChatMessages(
  roomId: string,
  params: ChatMessageListParams = {}
): Promise<ApiResponse<ChatMessagesResponse>> {
  const query = new URLSearchParams()
  if (params.before !== undefined) query.set('before', params.before)
  if (params.size !== undefined) query.set('size', String(params.size))

  const queryString = query.toString()
  return apiFetch<ApiResponse<ChatMessagesResponse>>(
    `/api/chat/rooms/${roomId}/messages${queryString ? `?${queryString}` : ''}`
  )
}
