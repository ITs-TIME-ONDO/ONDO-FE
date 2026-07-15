import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import PageTransition from '../../components/PageTransition'
import PageHeader from '../../components/PageHeader'
import ChatMessageBubble from '../../components/ChatMessageBubble'
import FloatingConfirmModal from '../../components/FloatingConfirmModal'
import ChatRoomInputBar from './ChatRoomInputBar'
import ChatRoomMenuDropdown from './ChatRoomMenuDropdown'
import ReportModal from './ReportModal'
import { mockChatRooms } from './chatMockData'
import {
  getChatRoom,
  getChatMessages,
  markRoomAsRead,
  sendChatMessage,
  closeChatRoom,
  type ChatRoomSummary,
} from '../../api/chat'
import { getAccessToken } from '../../utils/authStorage'
import { getUserIdFromToken } from '../../utils/jwt'
import { formatMessageTime, formatMatchedDate } from '../../utils/date'
import { useChatSocketStore, EMPTY_MESSAGES } from '../../stores/chatSocketStore'

import menuIcon from '../../assets/chat_menu_icon.svg'
import chatRoomChar from '../../assets/chat_room_char.png'

// category/distanceMeters/matchedDate는 아직 API에 없는 필드라 목데이터로 임시 표시
// (실제 필드 추가되면 room 데이터로 교체 필요)
const mockRoomInfo = mockChatRooms[0]

export default function ChatRoomPage() {
  const navigate = useNavigate()
  const { roomId } = useParams<{ roomId: string }>()
  const [room, setRoom] = useState<ChatRoomSummary | null>(null)
  const [roomNotFound, setRoomNotFound] = useState(false)
  const [showCompleteModal, setShowCompleteModal] = useState(false)
  const [showLeaveModal, setShowLeaveModal] = useState(false)
  const [closedMessage, setClosedMessage] = useState<string | null>(null)
  const [showMenu, setShowMenu] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)

  const [hasNext, setHasNext] = useState(false)
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [loadingMore, setLoadingMore] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const isInitialLoadRef = useRef(true)
  const preserveScrollRef = useRef<{ height: number; top: number } | null>(null)

  const accessToken = getAccessToken()
  const myUserId = accessToken ? getUserIdFromToken(accessToken) : null

  const messages = useChatSocketStore((state) =>
    roomId ? (state.messagesByRoom[roomId] ?? EMPTY_MESSAGES) : EMPTY_MESSAGES
  )
  // 방 정보엔 상대방 userId가 없어서, 받은 메시지의 senderId로 유추 (메시지가 없으면 신고 불가)
  const opponentUserId =
    messages.find((msg) => msg.senderId !== myUserId)?.senderId ?? null
  const connect = useChatSocketStore((state) => state.connect)
  const subscribeToRoom = useChatSocketStore((state) => state.subscribeToRoom)
  const unsubscribeFromRoom = useChatSocketStore((state) => state.unsubscribeFromRoom)
  const setRoomMessages = useChatSocketStore((state) => state.setRoomMessages)
  const prependRoomMessages = useChatSocketStore((state) => state.prependRoomMessages)
  const markMessagesRead = useChatSocketStore((state) => state.markMessagesRead)
  const onRoomRead = useChatSocketStore((state) => state.onRoomRead)
  const sendSocketMessage = useChatSocketStore((state) => state.sendMessage)
  const appendRoomMessage = useChatSocketStore((state) => state.appendRoomMessage)

  useEffect(() => {
    if (!roomId) return

    let active = true
    setRoom(null)
    setRoomNotFound(false)

    getChatRoom(roomId)
      .then((res) => {
        if (active) setRoom(res.data)
      })
      .catch((error) => {
        if (!active) return
        console.error('채팅방 조회 실패', error)
        setRoomNotFound(true)
      })

    return () => {
      active = false
    }
  }, [roomId])

  useEffect(() => {
    if (!roomId) return

    isInitialLoadRef.current = true
    preserveScrollRef.current = null

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

  // 서버가 발행하는 ROOM_CLOSED 시스템 메시지 수신 시 방 종료 처리
  useEffect(() => {
    const lastMessage = messages[messages.length - 1]
    if (lastMessage?.messageType !== 'ROOM_CLOSED') return

    setClosedMessage(
      lastMessage.senderId === myUserId
        ? '채팅방을 나갔습니다.'
        : `${lastMessage.senderNickname}님이 채팅을 종료했습니다.`
    )
  }, [messages, myUserId])

  // 최초 로딩 시에는 최신 메시지가 보이도록 하단으로 스크롤하고,
  // 이전 메시지를 위로 더 불러온 경우에는 기존에 보고 있던 위치를 유지한다.
  useLayoutEffect(() => {
    const el = scrollRef.current
    if (!el) return

    if (preserveScrollRef.current) {
      const { height, top } = preserveScrollRef.current
      el.scrollTop = el.scrollHeight - height + top
      preserveScrollRef.current = null
      return
    }

    if (isInitialLoadRef.current && messages.length > 0) {
      el.scrollTop = el.scrollHeight
      isInitialLoadRef.current = false
    }
  }, [messages])

  const loadMoreMessages = () => {
    if (!roomId || !hasNext || !nextCursor || loadingMore) return

    const el = scrollRef.current
    if (el) {
      preserveScrollRef.current = { height: el.scrollHeight, top: el.scrollTop }
    }

    setLoadingMore(true)
    getChatMessages(roomId, { before: nextCursor, size: 30 })
      .then((res) => {
        prependRoomMessages(roomId, [...res.data.messages].reverse())
        setHasNext(res.data.hasNext)
        setNextCursor(res.data.nextCursor)
      })
      .catch((error) => {
        preserveScrollRef.current = null
        console.error('이전 메시지 조회 실패', error)
      })
      .finally(() => setLoadingMore(false))
  }

  const handleSend = async (text: string): Promise<boolean> => {
    if (!roomId) return false

    const body = { messageType: 'TEXT' as const, content: text }
    const sentViaSocket = sendSocketMessage(roomId, body)

    // 소켓으로 보낸 메시지는 SUBSCRIBE 채널로 에코되어 돌아옴
    if (sentViaSocket) return true

    // 소켓 미연결 시에만 REST 폴백
    try {
      const res = await sendChatMessage(roomId, body)
      appendRoomMessage(roomId, res.data)
      return true
    } catch (error) {
      console.error('메시지 전송 실패', error)
      return false
    }
  }

  const handleCloseRoom = async () => {
    if (!roomId) return

    try {
      await closeChatRoom(roomId)
      // 상대방 화면에는 ROOM_CLOSED 소켓 echo(위 useEffect)가 "OO님이 채팅을 종료했습니다."를 띄워줌
      setClosedMessage('채팅방을 나갔습니다.')
    } catch (error) {
      console.error('채팅방 종료 실패', error)
      alert('채팅방 종료에 실패했습니다. 다시 시도해주세요.')
    }
  }

  const handleScroll = () => {
    if (scrollRef.current && scrollRef.current.scrollTop < 40) {
      loadMoreMessages()
    }
  }

  if (roomNotFound) {
    return (
      <PageTransition>
        <div className="relative mx-auto flex h-[844px] w-[390px] flex-col items-center justify-center bg-white">
          <p className="text-sm text-[#666]">채팅방을 찾을 수 없습니다.</p>
        </div>
      </PageTransition>
    )
  }

  if (!room) {
    return (
      <PageTransition>
        <div className="relative mx-auto h-[844px] w-[390px] bg-white" />
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <div className="relative mx-auto h-[844px] w-[390px] overflow-hidden bg-white">
        <PageHeader
          title={room.opponentNickname ?? '알 수 없음'}
          onBack={() => navigate('/chat', { replace: true })}
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
            // TODO: 알림 켜기/끄기 서버 연동 (지금은 로컬 상태만 토글)
            {
              label: notificationsEnabled ? '알림 끄기' : '알림 켜기',
              onClick: () => setNotificationsEnabled((prev) => !prev),
            },
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
              {mockRoomInfo.category}
            </p>
            <p className="mt-[10px] text-sm font-light text-[#343434]">
              나와 {mockRoomInfo.distanceMeters}m 떨어져 있음
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
          <p className="text-center text-xs text-[#666]">{formatMatchedDate(room.createdAt)}</p>

          <div className="mt-6 flex flex-col gap-6">
            {messages
              .filter((msg) => msg.messageType !== 'ROOM_CLOSED')
              .map((msg) => {
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

        <ChatRoomInputBar disabled={Boolean(closedMessage)} onSend={handleSend} />

        <FloatingConfirmModal
          open={showCompleteModal}
          title="매칭을 완료하시겠습니까?"
          description="완료 시 위치 공유가 불가합니다."
          onConfirm={() => {
            setShowCompleteModal(false)
            handleCloseRoom()
          }}
          onCancel={() => setShowCompleteModal(false)}
        />

        <FloatingConfirmModal
          open={showLeaveModal}
          title="채팅방을 나가시겠습니까?"
          description="매칭이 자동으로 종료됩니다."
          onConfirm={() => {
            setShowLeaveModal(false)
            handleCloseRoom()
          }}
          onCancel={() => setShowLeaveModal(false)}
        />

        <ReportModal
          open={showReportModal}
          onClose={() => setShowReportModal(false)}
          reportedUserId={opponentUserId}
          onSuccess={() => setClosedMessage('채팅방을 나갔습니다.')}
        />
      </div>
    </PageTransition>
  )
}
