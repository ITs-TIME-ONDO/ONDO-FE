import { create } from 'zustand'

import { getChatRooms, type ChatRoomSummary } from '../api/chat'

interface ChatRoomState {
  rooms: ChatRoomSummary[]
  fetchRooms: () => Promise<void>
}

export const useChatRoomStore = create<ChatRoomState>((set) => ({
  rooms: [],
  fetchRooms: async () => {
    try {
      const res = await getChatRooms({ page: 0 })
      set({ rooms: res.data.content })
    } catch (error) {
      console.error('채팅방 목록 조회 실패', error)
    }
  },
}))
