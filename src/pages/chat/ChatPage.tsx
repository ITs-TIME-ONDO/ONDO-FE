import { useEffect } from 'react'

import PageTransition from '../../components/PageTransition'
import BottomNav from '../../components/BottomNav'
import ChatHeader from './ChatHeader'
import ChatEmptyState from './ChatEmptyState'
import ChatRoomList from './ChatRoomList'
import { useChatRoomStore } from '../../stores/chatRoomStore'
import { useChatSocketStore } from '../../stores/chatSocketStore'

export default function ChatPage() {
  const rooms = useChatRoomStore((state) => state.rooms)
  const fetchRooms = useChatRoomStore((state) => state.fetchRooms)
  const connect = useChatSocketStore((state) => state.connect)

  useEffect(() => {
    fetchRooms()
    connect()

    const intervalId = window.setInterval(fetchRooms, 5000)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchRooms()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.clearInterval(intervalId)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [fetchRooms, connect])

  const hasChatRooms = true

  return (
    <PageTransition>
      <div
        className="relative mx-auto h-[844px] w-[390px] overflow-hidden"
        style={{
          background:
            'linear-gradient(180deg, #FFFFFF 0%, #FFFFFF 65%, #FFF4E8 84%, #FFC679 100%)',
        }}
      >
        <ChatHeader />

        {hasChatRooms ? <ChatRoomList rooms={rooms} /> : <ChatEmptyState />}

        <BottomNav />
      </div>
    </PageTransition>
  )
}
