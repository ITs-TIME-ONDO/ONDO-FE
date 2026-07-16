import { useEffect, useState } from 'react'

import PageTransition from '../../components/PageTransition'
import BottomNav from '../../components/BottomNav'
import ChatHeader from './ChatHeader'
import ChatEmptyState from './ChatEmptyState'
import ChatRoomList from './ChatRoomList'
import FloatingConfirmModal from '../../components/FloatingConfirmModal'
import { closeChatRoom, type ChatRoomSummary } from '../../api/chat'
import { useChatRoomStore } from '../../stores/chatRoomStore'
import { useChatSocketStore } from '../../stores/chatSocketStore'

export default function ChatPage() {
  const rooms = useChatRoomStore((state) => state.rooms)
  const fetchRooms = useChatRoomStore((state) => state.fetchRooms)
  const connect = useChatSocketStore((state) => state.connect)
  const [leaveRoom, setLeaveRoom] = useState<ChatRoomSummary | null>(null)
  const [isLeaving, setIsLeaving] = useState(false)

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

  const hasChatRooms = rooms.some((room) => room.status === 'ACTIVE')

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

        {hasChatRooms ? (
          <ChatRoomList rooms={rooms} onLeave={setLeaveRoom} />
        ) : (
          <ChatEmptyState />
        )}

        <BottomNav />

        <FloatingConfirmModal
          open={Boolean(leaveRoom)}
          title="채팅방을 나가시겠습니까?"
          description="매칭이 자동으로 종료됩니다."
          confirmText={isLeaving ? '처리 중...' : '확인'}
          cancelText="취소"
          disabled={isLeaving}
          onCancel={() => {
            if (!isLeaving) setLeaveRoom(null)
          }}
          onConfirm={async () => {
            if (!leaveRoom || isLeaving) return
            try {
              setIsLeaving(true)
              await closeChatRoom(leaveRoom.id)
              await fetchRooms()
              setLeaveRoom(null)
            } catch {
              alert('채팅방 나가기에 실패했습니다. 다시 시도해주세요.')
            } finally {
              setIsLeaving(false)
            }
          }}
        />
      </div>
    </PageTransition>
  )
}
