import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import ChatRoomListItem from '../../components/ChatRoomListItem'
import type { ChatRoomSummary } from '../../api/chat'
import { formatMessageTime } from '../../utils/date'
import { mockChatRoom } from '../../mocks/mockChat'

type Props = {
  rooms: ChatRoomSummary[]
  onLeave: (room: ChatRoomSummary) => void
}

export default function ChatRoomList({ rooms, onLeave }: Props) {
  const navigate = useNavigate()
  const [openRoomId, setOpenRoomId] = useState<string | null>(null)

  useEffect(() => {
    if (!openRoomId) return

    const closeOnOutsidePress = (event: PointerEvent) => {
      const target = event.target
      if (!(target instanceof Element)) return

      const pressedRoom = target.closest<HTMLElement>('[data-chat-room-id]')
      if (pressedRoom?.dataset.chatRoomId === openRoomId) return

      setOpenRoomId(null)
    }

    document.addEventListener('pointerdown', closeOnOutsidePress, true)
    return () => document.removeEventListener('pointerdown', closeOnOutsidePress, true)
  }, [openRoomId])

  return (
    <main className="absolute left-0 top-[113px] w-full">
      {(import.meta.env.DEV
        ? [mockChatRoom, ...rooms.filter((room) => room.id !== mockChatRoom.id)]
        : rooms
      ).map((room) => (
        <ChatRoomListItem
          key={room.id}
          roomId={room.id}
          nickname={room.opponentNickname ?? '알 수 없음'}
          message={room.lastMessage ?? '대화를 시작해보세요'}
          time={formatMessageTime(room.latestMessageAt ?? room.createdAt)}
          unread={room.unreadCount > 0}
          profileImageUrl={room.opponentProfileImageUrl ?? undefined}
          onClick={() => navigate(`/chat/${room.id}`)}
          onLeave={() => {
            if (room.id !== mockChatRoom.id && room.status === 'ACTIVE') onLeave(room)
          }}
          swipeOpen={openRoomId === room.id}
          onSwipeOpen={() => setOpenRoomId(room.id)}
          onSwipeClose={() => setOpenRoomId(null)}
          swipeEnabled={room.id !== mockChatRoom.id && room.status === 'ACTIVE'}
        />
      ))}
    </main>
  )
}
