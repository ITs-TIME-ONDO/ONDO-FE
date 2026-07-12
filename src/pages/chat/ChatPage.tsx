import PageTransition from '../../components/PageTransition'
import BottomNav from '../../components/BottomNav'
import ChatHeader from './ChatHeader'
import ChatEmptyState from './ChatEmptyState'
import ChatRoomList from './ChatRoomList'
import { mockChatRooms } from './chatMockData'

const ROOM_LIST_BACKGROUND =
  'linear-gradient(180deg, #FFF 66.83%, rgba(255, 233, 204, 0.50) 86.87%, #FF9200 100%), #FFF'

export default function ChatPage() {
  const hasChatRooms = mockChatRooms.length > 0

  return (
    <PageTransition>
      <div
        className={
          'relative mx-auto h-[844px] w-[390px] overflow-hidden' +
          (hasChatRooms
            ? ''
            : ' bg-gradient-to-b from-white via-[#FFF4E8] to-[#FFC679]')
        }
        style={hasChatRooms ? { background: ROOM_LIST_BACKGROUND } : undefined}
      >
        <ChatHeader />

        {hasChatRooms ? (
          <ChatRoomList rooms={mockChatRooms} />
        ) : (
          <ChatEmptyState />
        )}

        <BottomNav />
      </div>
    </PageTransition>
  )
}
