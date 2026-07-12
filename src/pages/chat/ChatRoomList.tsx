import { useNavigate } from 'react-router-dom'

import ChatRoomListItem from '../../components/ChatRoomListItem'
import type { ChatRoomSummary } from './chatMockData'

type Props = {
  rooms: ChatRoomSummary[]
}

export default function ChatRoomList({ rooms }: Props) {
  const navigate = useNavigate()

  return (
    <main className="absolute left-0 top-[123px] w-full border-t border-[#EDEDED]">
      {rooms.map((room) => (
        <ChatRoomListItem
          key={room.id}
          nickname={room.nickname}
          message={room.message}
          time={room.time}
          unread={room.unread}
          onClick={() => navigate(`/chat/${room.id}`)}
        />
      ))}
    </main>
  )
}
