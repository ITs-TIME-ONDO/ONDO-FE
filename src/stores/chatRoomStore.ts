import { create } from 'zustand'

import { getChatMessages, getChatRooms, type ChatRoomSummary } from '../api/chat'
import { MATCH_COMPLETE_MESSAGE } from '../constants/chat'

interface ChatRoomState {
  rooms: ChatRoomSummary[]
  fetchRooms: () => Promise<void>
}

export const useChatRoomStore = create<ChatRoomState>((set) => ({
  rooms: [],
  fetchRooms: async () => {
    try {
      const res = await getChatRooms({ page: 0 })
      const rooms = await Promise.all(
        res.data.content.map(async (room) => {
          try {
            const messagesRes = await getChatMessages(room.id, { size: 5 })
            const completed = messagesRes.data.messages.some(
              (message) => message.content === MATCH_COMPLETE_MESSAGE
            )
            return {
              ...room,
              lastMessage:
                room.status === 'CLOSED' && completed
                  ? '이 채팅방은 완료되었습니다.'
                  : room.lastMessage,
              latestMessageAt: messagesRes.data.messages[0]?.sentAt ?? null,
            }
          } catch {
            return room
          }
        })
      )
      set({ rooms })
    } catch {}
  },
}))
