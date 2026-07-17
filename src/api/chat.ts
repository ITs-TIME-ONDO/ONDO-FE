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
  opponentNickname: string | null
  opponentProfileImageUrl: string | null
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
  distanceToTargetMeters: number | null
  sentAt: string
}

export interface ChatMessageLocation {
  latitude: number
  longitude: number
  placeName?: string
}

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

export function markRoomAsRead(roomId: string): Promise<ApiResponse<null>> {
  return apiFetch<ApiResponse<null>>(`/api/chat/rooms/${roomId}/read`, {
    method: 'PATCH',
  })
}

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

export function getLiveLocations(
  roomId: string
): Promise<ApiResponse<LiveLocationEvent[]>> {
  return apiFetch<ApiResponse<LiveLocationEvent[]>>(
    `/api/chat/rooms/${roomId}/live-location`
  )
}

export interface TranslateMessageResponse {
  translatedText: string
  cached: boolean
}

export function translateChatMessage(
  messageId: string,
  targetLanguage: string
): Promise<ApiResponse<TranslateMessageResponse>> {
  return apiFetch<ApiResponse<TranslateMessageResponse>>(
    `/api/chat/messages/${messageId}/translations`,
    {
      method: 'POST',
      body: JSON.stringify({ targetLanguage }),
    }
  )
}
