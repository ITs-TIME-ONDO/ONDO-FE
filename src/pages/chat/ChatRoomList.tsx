import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import ChatRoomListItem from '../../components/ChatRoomListItem'
import type { ChatRoomSummary } from '../../api/chat'
import { formatMessageTime } from '../../utils/date'

type Props = {
  rooms: ChatRoomSummary[]
  onLeave: (room: ChatRoomSummary) => void
}

export default function ChatRoomList({ rooms, onLeave }: Props) {
  const navigate = useNavigate()
  const [openRoomId, setOpenRoomId] = useState<string | null>(null)

  return (
    <main className="absolute left-0 top-[113px] w-full">
      {rooms.filter((room) => room.status === 'ACTIVE').map((room) => (
        <ChatRoomListItem
          key={room.id}
          nickname={room.opponentNickname ?? '알 수 없음'}
          message={room.lastMessage ?? '대화를 시작해보세요'}
          time={formatMessageTime(room.latestMessageAt ?? room.createdAt)}
          unread={room.unreadCount > 0}
          profileImageUrl={room.opponentProfileImageUrl ?? undefined}
          onClick={() => navigate(`/chat/${room.id}`)}
          onLeave={() => onLeave(room)}
          swipeOpen={openRoomId === room.id}
          onSwipeOpen={() => setOpenRoomId(room.id)}
          onSwipeClose={() => setOpenRoomId(null)}
        />
      ))}
    </main>
  )
}
