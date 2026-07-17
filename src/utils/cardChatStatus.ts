import { getChatRooms } from '../api/chat'

export const hasClosedChatForCard = async (cardId: string): Promise<boolean> => {
  try {
    const roomsRes = await getChatRooms({ page: 0, size: 100 })
    return roomsRes.data.content.some(
      (room) => room.cardId === cardId && room.status === 'CLOSED'
    )
  } catch {
    return false
  }
}
