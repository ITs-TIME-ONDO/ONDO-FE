import { useNavigate } from 'react-router-dom'

import ChatRoomListItem from '../../components/ChatRoomListItem'
import type { ChatRoomSummary } from '../../api/chat'
import { formatMessageTime } from '../../utils/date'

type Props = {
  rooms: ChatRoomSummary[]
}

export default function ChatRoomList({ rooms }: Props) {
  const navigate = useNavigate()

  return (
    <main className="absolute left-0 top-[113px] w-full">
      <ChatRoomListItem
        nickname="위치 공유 UI 목업"
        message="요청·수신·동의 완료 상태를 확인해보세요"
        time="오후 8:34"
        unread
        onClick={() => navigate('/chat/mock-live-location')}
      />
      {rooms.map((room) => (
        <ChatRoomListItem
          key={room.id}
          nickname={room.opponentNickname ?? '알 수 없음'}
          message={room.lastMessage ?? '대화를 시작해보세요'}
          time={formatMessageTime(room.latestMessageAt ?? room.createdAt)}
          unread={room.unreadCount > 0}
          profileImageUrl={room.opponentProfileImageUrl ?? undefined}
          onClick={() => navigate(`/chat/${room.id}`)}
        />
      ))}
    </main>
  )
}
