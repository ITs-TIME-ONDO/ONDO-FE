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
  latestMessageAt?: string | null
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

export type LiveLocationEventType = 'UPDATE' | 'STOP'

export interface LiveLocationEvent {
  type: LiveLocationEventType
  senderId: string
  latitude: number | null
  longitude: number | null
  accuracy: number | null
  // 해당 senderId 사용자의 현재 위치 → 카드 목표 지점까지 남은 거리(m, 서버 계산·정수 반올림). type이 STOP이면 null
  distanceToTargetMeters: number | null
  sentAt: string
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

// 참여자 아니면 403 FORBIDDEN
export function getChatRoom(roomId: string): Promise<ApiResponse<ChatRoomSummary>> {
  return apiFetch<ApiResponse<ChatRoomSummary>>(`/api/chat/rooms/${roomId}`)
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

// 응답 바디 형태 TBD (chat.md에 명시 없음)
export function markRoomAsRead(roomId: string): Promise<ApiResponse<null>> {
  return apiFetch<ApiResponse<null>>(`/api/chat/rooms/${roomId}/read`, {
    method: 'PATCH',
  })
}

// REST 폴백 전송 (WS 미지원 환경용). 실시간 전송은 WS SEND(chatSocketStore.sendMessage) 우선 사용
export function sendChatMessage(
  roomId: string,
  body: ChatMessageSendRequest
): Promise<ApiResponse<ChatMessage>> {
  return apiFetch<ApiResponse<ChatMessage>>(
    `/api/chat/rooms/${roomId}/messages`,
    {
      method: 'POST',
      body: JSON.stringify(body),
    }
  )
}

export interface CreateChatRoomRequest {
  cardId: string
}

// 멱등(get-or-create). 수락자가 수락 액션 시 직접 호출
export function createChatRoom(
  body: CreateChatRoomRequest
): Promise<ApiResponse<ChatRoomSummary>> {
  return apiFetch<ApiResponse<ChatRoomSummary>>(`/api/chat/rooms`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function closeChatRoom(roomId: string): Promise<ApiResponse<null>> {
  return apiFetch<ApiResponse<null>>(`/api/chat/rooms/${roomId}/close`, {
    method: 'POST',
  })
}

// 채팅방 입장 시 초기값용 — 참여자들의 마지막 위치 스냅샷 (실시간 이벤트와 동일한 JSON 배열)
export function getLiveLocations(
  roomId: string
): Promise<ApiResponse<LiveLocationEvent[]>> {
  return apiFetch<ApiResponse<LiveLocationEvent[]>>(
    `/api/chat/rooms/${roomId}/live-location`
  )
}
