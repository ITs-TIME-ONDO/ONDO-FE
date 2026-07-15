import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'

import PageTransition from '../../components/PageTransition'
import PageHeader from '../../components/PageHeader'
import ChatMessageBubble from '../../components/ChatMessageBubble'
import FloatingConfirmModal from '../../components/FloatingConfirmModal'
import ChatRoomInputBar from './ChatRoomInputBar'
import ChatRoomMenuDropdown from './ChatRoomMenuDropdown'
import ReportModal from './ReportModal'
import { mockChatRooms } from './chatMockData'
import { getChatMessages, markRoomAsRead } from '../../api/chat'
import { getAccessToken } from '../../utils/authStorage'
import { getUserIdFromToken } from '../../utils/jwt'
import { formatMessageTime } from '../../utils/date'
import { useChatSocketStore } from '../../stores/chatSocketStore'

import menuIcon from '../../assets/chat_menu_icon.svg'
import chatRoomChar from '../../assets/chat_room_char.png'

export default function ChatRoomPage() {
  const { roomId } = useParams<{ roomId: string }>()
  const room = mockChatRooms.find((r) => r.id === roomId)
  const [showCompleteModal, setShowCompleteModal] = useState(false)
  const [showLeaveModal, setShowLeaveModal] = useState(false)
  const [closedMessage, setClosedMessage] = useState<string | null>(null)
  const [showMenu, setShowMenu] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)

  const [hasNext, setHasNext] = useState(false)
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [loadingMore, setLoadingMore] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const accessToken = getAccessToken()
  const myUserId = accessToken ? getUserIdFromToken(accessToken) : null

  const messages = useChatSocketStore((state) =>
    roomId ? (state.messagesByRoom[roomId] ?? []) : []
  )
  const connect = useChatSocketStore((state) => state.connect)
  const subscribeToRoom = useChatSocketStore((state) => state.subscribeToRoom)
  const unsubscribeFromRoom = useChatSocketStore((state) => state.unsubscribeFromRoom)
  const setRoomMessages = useChatSocketStore((state) => state.setRoomMessages)
  const prependRoomMessages = useChatSocketStore((state) => state.prependRoomMessages)
  const markMessagesRead = useChatSocketStore((state) => state.markMessagesRead)
  const onRoomRead = useChatSocketStore((state) => state.onRoomRead)

  useEffect(() => {
    if (!roomId) return

    // 소켓 연결은 앱 전체 1개만 유지 (이미 연결돼 있으면 no-op)
    connect()
    subscribeToRoom(roomId)
    onRoomRead(roomId, (event) => markMessagesRead(roomId, event.messageIds, event.readAt))

    getChatMessages(roomId, { size: 30 })
      .then((res) => {
        setRoomMessages(roomId, [...res.data.messages].reverse())
        setHasNext(res.data.hasNext)
        setNextCursor(res.data.nextCursor)
      })
      .catch((error) => console.error('메시지 목록 조회 실패', error))

    // 채팅방 진입 시 상대방이 보낸 미읽음 메시지 읽음 처리
    markRoomAsRead(roomId).catch((error) =>
      console.error('읽음 처리 실패', error)
    )

    return () => {
      onRoomRead(roomId, null)
      unsubscribeFromRoom(roomId)
    }
  }, [
    roomId,
    connect,
    subscribeToRoom,
    unsubscribeFromRoom,
    setRoomMessages,
    markMessagesRead,
    onRoomRead,
  ])

  const loadMoreMessages = () => {
    if (!roomId || !hasNext || !nextCursor || loadingMore) return

    setLoadingMore(true)
    getChatMessages(roomId, { before: nextCursor, size: 30 })
      .then((res) => {
        prependRoomMessages(roomId, [...res.data.messages].reverse())
        setHasNext(res.data.hasNext)
        setNextCursor(res.data.nextCursor)
      })
      .catch((error) => console.error('이전 메시지 조회 실패', error))
      .finally(() => setLoadingMore(false))
  }

  const handleScroll = () => {
    if (scrollRef.current && scrollRef.current.scrollTop < 40) {
      loadMoreMessages()
    }
  }

  if (!room) {
    return (
      <PageTransition>
        <div className="relative mx-auto flex h-[844px] w-[390px] flex-col items-center justify-center bg-white">
          <p className="text-sm text-[#666]">채팅방을 찾을 수 없습니다.</p>
        </div>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <div className="relative mx-auto h-[844px] w-[390px] overflow-hidden bg-white">
        <PageHeader
          title={room.nickname}
          fallbackPath="/chat"
          rightAction={
            <button type="button" onClick={() => setShowMenu((prev) => !prev)}>
              <img src={menuIcon} alt="메뉴" className="h-6 w-6" />
            </button>
          }
        />

        <ChatRoomMenuDropdown
          open={showMenu}
          onClose={() => setShowMenu(false)}
          options={[
            // TODO: 알림 켜기/끄기 연동
            { label: '알림 켜기', onClick: () => {} },
            { label: '신고하기', onClick: () => setShowReportModal(true) },
            { label: '채팅방 나가기', onClick: () => setShowLeaveModal(true) },
          ]}
        />

        <div
          className="absolute left-0 top-[99px] flex w-full flex-col gap-5 px-6 py-3"
          style={{
            background: 'linear-gradient(180deg, #FF9E1B -52.24%, #FFF 115.3%)',
          }}
        >
          <div>
            <p className="text-[18px] font-semibold text-black">
              {room.category}
            </p>
            <p className="mt-[10px] text-sm font-light text-[#343434]">
              나와 {room.distanceMeters}m 떨어져 있음
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowCompleteModal(true)}
            className="flex h-10 w-[107px] items-center justify-center rounded-full bg-black text-base font-medium text-white"
          >
            완료
          </button>

          <img
            src={chatRoomChar}
            alt=""
            className="pointer-events-none absolute right-0 top-[-2px] h-[144px] w-[153px] object-contain"
          />
        </div>

        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="absolute inset-x-0 top-[265px] bottom-[90px] overflow-y-auto"
        >
          <p className="text-center text-xs text-[#666]">{room.matchedDate}</p>

          <div className="mt-6 flex flex-col gap-6">
            {messages.map((msg) => {
              const sender = msg.senderId === myUserId ? 'me' : 'partner'
              return (
                <ChatMessageBubble
                  key={msg.id}
                  sender={sender}
                  message={msg.content ?? ''}
                  time={formatMessageTime(msg.sentAt)}
                  nickname={sender === 'partner' ? msg.senderNickname : undefined}
                />
              )
            })}
          </div>

          {closedMessage && (
            <p className="mt-6 text-center text-sm text-black">
              {closedMessage}
            </p>
          )}
        </div>

        <ChatRoomInputBar disabled={Boolean(closedMessage)} />

        <FloatingConfirmModal
          open={showCompleteModal}
          title="매칭을 완료하시겠습니까?"
          description="완료 시 위치 공유가 불가합니다."
          // TODO: 요청 완료 처리 API 연동
          onConfirm={() => {
            setShowCompleteModal(false)
            setClosedMessage('상대방이 채팅을 종료했습니다.')
            // 상대방이 종료 시에 종료 메시지 표시
          }}
          onCancel={() => setShowCompleteModal(false)}
        />

        <FloatingConfirmModal
          open={showLeaveModal}
          title="채팅방을 나가시겠습니까?"
          description="매칭이 자동으로 종료됩니다."
          // TODO: 채팅방 나가기 API 연동
          onConfirm={() => {
            setShowLeaveModal(false)
            setClosedMessage('채팅방을 나갔습니다.')
            // 내가 종료 시에 종료 메시지 표시
          }}
          onCancel={() => setShowLeaveModal(false)}
        />

        <ReportModal
          open={showReportModal}
          onClose={() => setShowReportModal(false)}
        />
      </div>
    </PageTransition>
  )
}
