import type { ChatMessage, ChatRoomSummary } from '../api/chat'

export const MOCK_CHAT_ROOM_ID = 'mock-live-location-room'
export const MOCK_MY_USER_ID = 'mock-me'
export const MOCK_PARTNER_USER_ID = 'mock-partner'

export const mockChatRoom: ChatRoomSummary = {
  id: MOCK_CHAT_ROOM_ID,
  cardId: 'mock-photo-card',
  status: 'ACTIVE',
  createdAt: '2026-07-17T10:30:00+09:00',
  closedAt: null,
  unreadCount: 1,
  opponentNickname: '익명의 고슴도치',
  opponentProfileImageUrl: null,
  lastMessage: '실시간 위치 공유',
  latestMessageAt: '2026-07-17T20:34:00+09:00',
}

export const mockChatMessages: ChatMessage[] = [
  { id: 'mock-1', chatRoomId: MOCK_CHAT_ROOM_ID, senderId: MOCK_PARTNER_USER_ID, senderNickname: '익명의 고슴도치', messageType: 'TEXT', content: '안녕하세요!ㅎㅎ', sentAt: '2026-07-17T19:48:00+09:00', readAt: '2026-07-17T19:49:00+09:00' },
  { id: 'mock-1-2', chatRoomId: MOCK_CHAT_ROOM_ID, senderId: MOCK_PARTNER_USER_ID, senderNickname: '익명의 고슴도치', messageType: 'TEXT', content: '지금 경복궁 근처에 계신가요?', sentAt: '2026-07-17T19:48:20+09:00', readAt: '2026-07-17T19:49:00+09:00' },
  { id: 'mock-2', chatRoomId: MOCK_CHAT_ROOM_ID, senderId: MOCK_MY_USER_ID, senderNickname: '나', messageType: 'TEXT', content: '네! 안녕하세요~ 반가워요', sentAt: '2026-07-17T19:51:00+09:00', readAt: '2026-07-17T19:51:00+09:00' },
  { id: 'mock-2-2', chatRoomId: MOCK_CHAT_ROOM_ID, senderId: MOCK_MY_USER_ID, senderNickname: '나', messageType: 'TEXT', content: '저는 입구 쪽에 있어요!', sentAt: '2026-07-17T19:51:25+09:00', readAt: '2026-07-17T19:51:30+09:00' },
  { id: 'mock-3', chatRoomId: MOCK_CHAT_ROOM_ID, senderId: MOCK_PARTNER_USER_ID, senderNickname: '익명의 고슴도치', messageType: 'TEXT', content: '경복궁에서 사진 찍어줄 분 찾으시는 거 맞으시죠?', sentAt: '2026-07-17T20:03:00+09:00', readAt: '2026-07-17T20:04:00+09:00' },
  { id: 'mock-4', chatRoomId: MOCK_CHAT_ROOM_ID, senderId: MOCK_MY_USER_ID, senderNickname: '나', messageType: 'TEXT', content: '네 맞아요! 위치 먼저 공유할게요.', sentAt: '2026-07-17T20:12:00+09:00', readAt: '2026-07-17T20:13:00+09:00' },
  { id: 'mock-location-mine', chatRoomId: MOCK_CHAT_ROOM_ID, senderId: MOCK_MY_USER_ID, senderNickname: '나', messageType: 'TEXT', content: '실시간 위치 공유 요청', sentAt: '2026-07-17T20:20:00+09:00', readAt: '2026-07-17T20:21:00+09:00' },
  { id: 'mock-5', chatRoomId: MOCK_CHAT_ROOM_ID, senderId: MOCK_PARTNER_USER_ID, senderNickname: '익명의 고슴도치', messageType: 'TEXT', content: '저도 위치 공유 보낼게요!', sentAt: '2026-07-17T20:31:00+09:00', readAt: null },
  { id: 'mock-location-partner', chatRoomId: MOCK_CHAT_ROOM_ID, senderId: MOCK_PARTNER_USER_ID, senderNickname: '익명의 고슴도치', messageType: 'TEXT', content: '실시간 위치 공유 요청', sentAt: '2026-07-17T20:34:00+09:00', readAt: null },
]

export const isMockChatRoom = (roomId?: string) => roomId === MOCK_CHAT_ROOM_ID
