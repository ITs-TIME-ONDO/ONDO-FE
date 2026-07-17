const STORAGE_KEY = 'hiddenChatRoomIds'

export function getHiddenChatRoomIds(): string[] {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    return Array.isArray(value) ? value.filter((id) => typeof id === 'string') : []
  } catch {
    return []
  }
}

export function hideChatRoom(roomId: string): string[] {
  const roomIds = Array.from(new Set([...getHiddenChatRoomIds(), roomId]))
  localStorage.setItem(STORAGE_KEY, JSON.stringify(roomIds))
  return roomIds
}
