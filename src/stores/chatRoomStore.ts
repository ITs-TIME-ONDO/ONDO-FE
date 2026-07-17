import { create } from 'zustand'

import { getChatMessages, getChatRooms, type ChatRoomSummary } from '../api/chat'

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
            const messagesRes = await getChatMessages(room.id, { size: 1 })
            return {
              ...room,
              lastMessage:
                room.status === 'CLOSED'
                  ? '종료된 채팅방입니다.'
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
