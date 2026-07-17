import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import PageTransition from '../../components/PageTransition'
import PageHeader from '../../components/PageHeader'
import ChatMessageBubble from '../../components/ChatMessageBubble'
import LiveLocationShareCard from '../../components/LiveLocationShareCard'
import FloatingConfirmModal from '../../components/FloatingConfirmModal'
import ChatRoomInputBar from './ChatRoomInputBar'
import ChatRoomMenuDropdown from './ChatRoomMenuDropdown'
import ReportModal from './ReportModal'
import { apiFetch, ApiError } from '../../api/client'
import {
  getChatRoom,
  getChatMessages,
  markRoomAsRead,
  sendChatMessage,
  closeChatRoom,
  getLiveLocations,
  type ChatRoomSummary,
} from '../../api/chat'
import { getAccessToken } from '../../utils/authStorage'
import { getUserIdFromToken } from '../../utils/jwt'
import { formatMessageTime, formatMatchedDate } from '../../utils/date'
import { useChatSocketStore, EMPTY_MESSAGES } from '../../stores/chatSocketStore'
import {
  MOCK_MY_USER_ID,
  isMockChatRoom,
  mockChatMessages,
  mockChatRoom,
} from '../../mocks/mockChat'

import chatRoomChar from '../../assets/chat_room_char.png'
import tapFinger from '../../assets/tap_finger.svg'
import menuIcon from '../../assets/chat_menu_icon.png'
import miniProfileChar from '../../assets/mini_profile_char.png'

const CARD_CATEGORY_LABELS: Record<string, string> = {
  PHOTO: '사진 찍기',
  MEAL: '합석',
  OTHER: '기타',
  ETC: '기타',
}

const LOCATION_GUIDE_SEEN_STORAGE_KEY = 'hasSeenChatLiveLocationGuide'
const LOCATION_REQUEST_MESSAGE = '실시간 위치 공유 요청'
const LOCATION_ACCEPT_MESSAGE = '실시간 위치 공유 동의'
const LOCATION_REQUEST_COOLDOWN_MS = 10 * 60 * 1000
const LOCATION_REQUEST_COOLDOWN_PREFIX = 'chatLocationRequestCooldown:'

export default function ChatRoomPage() {
  const navigate = useNavigate()
  const { roomId } = useParams<{ roomId: string }>()
  const mockMode = import.meta.env.DEV && isMockChatRoom(roomId)
  const [room, setRoom] = useState<ChatRoomSummary | null>(null)
  const [cardCategory, setCardCategory] = useState('도움 요청')
  const [roomNotFound, setRoomNotFound] = useState(false)
  const [showCompleteModal, setShowCompleteModal] = useState(false)
  const [showLeaveModal, setShowLeaveModal] = useState(false)
  const [closedMessage, setClosedMessage] = useState<string | null>(null)
  const [showMenu, setShowMenu] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [showLocationGuide, setShowLocationGuide] = useState(false)
  const [showLocationAgreeModal, setShowLocationAgreeModal] = useState(false)
  const [liveLocationSharingEnabled, setLiveLocationSharingEnabled] =
    useState(false)
  const [locationRequestCooldownUntil, setLocationRequestCooldownUntil] =
    useState(0)
  const [localMockMessages, setLocalMockMessages] = useState(mockChatMessages)

  const [hasNext, setHasNext] = useState(false)
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [loadingMore, setLoadingMore] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const firstUnreadMessageRef = useRef<HTMLDivElement>(null)
  const isInitialLoadRef = useRef(true)
  const preserveScrollRef = useRef<{ height: number; top: number } | null>(null)

  const accessToken = getAccessToken()
  const myUserId = mockMode
    ? MOCK_MY_USER_ID
    : accessToken
      ? getUserIdFromToken(accessToken)
      : null

  const socketMessages = useChatSocketStore((state) =>
    roomId ? (state.messagesByRoom[roomId] ?? EMPTY_MESSAGES) : EMPTY_MESSAGES
  )
  const messages = mockMode ? localMockMessages : socketMessages
  const lastMessageId = messages[messages.length - 1]?.id
  const connect = useChatSocketStore((state) => state.connect)
  const subscribeToRoom = useChatSocketStore((state) => state.subscribeToRoom)
  const unsubscribeFromRoom = useChatSocketStore((state) => state.unsubscribeFromRoom)
  const setRoomMessages = useChatSocketStore((state) => state.setRoomMessages)
  const prependRoomMessages = useChatSocketStore((state) => state.prependRoomMessages)
  const markMessagesRead = useChatSocketStore((state) => state.markMessagesRead)
  const onRoomRead = useChatSocketStore((state) => state.onRoomRead)
  const sendSocketMessage = useChatSocketStore((state) => state.sendMessage)
  const appendRoomMessage = useChatSocketStore((state) => state.appendRoomMessage)
  const setLiveLocation = useChatSocketStore((state) => state.setLiveLocation)
  const sendLiveLocation = useChatSocketStore((state) => state.sendLiveLocation)
  const stopLiveLocation = useChatSocketStore((state) => state.stopLiveLocation)
  useEffect(() => {
    if (!roomId) return

    if (mockMode) {
      setRoom(mockChatRoom)
      setCardCategory('사진 찍기')
      setRoomNotFound(false)
      return
    }

    let active = true
    setRoom(null)
    setRoomNotFound(false)

    const loadRoom = async () => {
      try {
        const roomRes = await getChatRoom(roomId)
        let category = '도움 요청'

        try {
          const cardRes = await apiFetch<any>(`/api/cards/${roomRes.data.cardId}`)
          const card = cardRes?.data?.card ?? cardRes?.data ?? cardRes
          category =
            CARD_CATEGORY_LABELS[card?.category] ?? card?.category ?? '도움 요청'
        } catch {}

        if (!active) return
        setCardCategory(category)
        setRoom(roomRes.data)

        if (roomRes.data.status === 'CLOSED') {
          setLiveLocationSharingEnabled(false)
          setClosedMessage('종료된 채팅방입니다.')
        }

        if (localStorage.getItem(LOCATION_GUIDE_SEEN_STORAGE_KEY) !== 'true') {
          setShowLocationGuide(true)
        }
      } catch {
        if (!active) return
        setRoomNotFound(true)
      }
    }

    void loadRoom()

    return () => {
      active = false
    }
  }, [mockMode, roomId])

  useEffect(() => {
    if (!roomId || mockMode) return

    const storageKey = `${LOCATION_REQUEST_COOLDOWN_PREFIX}${roomId}`
    const savedUntil = Number(localStorage.getItem(storageKey) ?? 0)
    const validUntil = savedUntil > Date.now() ? savedUntil : 0
    setLocationRequestCooldownUntil(validUntil)

    if (!validUntil) {
      localStorage.removeItem(storageKey)
    }
  }, [mockMode, roomId])

  useEffect(() => {
    if (!locationRequestCooldownUntil) return

    const remaining = locationRequestCooldownUntil - Date.now()
    if (remaining <= 0) {
      setLocationRequestCooldownUntil(0)
      return
    }

    const timeoutId = window.setTimeout(() => {
      setLocationRequestCooldownUntil(0)
      if (!mockMode && roomId) {
        localStorage.removeItem(`${LOCATION_REQUEST_COOLDOWN_PREFIX}${roomId}`)
      }
    }, remaining)

    return () => window.clearTimeout(timeoutId)
  }, [locationRequestCooldownUntil, mockMode, roomId])

  useEffect(() => {
    if (!roomId || mockMode) return

    isInitialLoadRef.current = true
    preserveScrollRef.current = null

    connect()
    subscribeToRoom(roomId)
    onRoomRead(roomId, (event) => markMessagesRead(roomId, event.messageIds, event.readAt))

    getChatMessages(roomId, { size: 30 })
      .then((res) => {
        setRoomMessages(roomId, [...res.data.messages].reverse())
        setHasNext(res.data.hasNext)
        setNextCursor(res.data.nextCursor)
      })
      .catch(() => {})

    markRoomAsRead(roomId).catch(() => {})

    return () => {
      onRoomRead(roomId, null)
      unsubscribeFromRoom(roomId)
    }
  }, [
    roomId,
    mockMode,
    connect,
    subscribeToRoom,
    unsubscribeFromRoom,
    setRoomMessages,
    markMessagesRead,
    onRoomRead,
  ])

  useEffect(() => {
    if (!roomId || mockMode) return

    getLiveLocations(roomId)
      .then((res) => {
        res.data.forEach((event) => setLiveLocation(roomId, event))
      })
      .catch(() => {})
  }, [mockMode, roomId, setLiveLocation])

  useEffect(() => {
    if (!roomId || mockMode || !liveLocationSharingEnabled || !navigator.geolocation) return

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        sendLiveLocation(roomId, {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        })
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 0 }
    )

    return () => {
      navigator.geolocation.clearWatch(watchId)
      stopLiveLocation(roomId)
    }
  }, [mockMode, roomId, liveLocationSharingEnabled, sendLiveLocation, stopLiveLocation])

  useEffect(() => {
    const lastMessage = messages[messages.length - 1]
    if (lastMessage?.messageType !== 'ROOM_CLOSED') return

    setLiveLocationSharingEnabled(false)
    setClosedMessage('종료된 채팅방입니다.')
  }, [messages, myUserId])

  useLayoutEffect(() => {
    const el = scrollRef.current
    if (!el) return

    if (preserveScrollRef.current) {
      const { height, top } = preserveScrollRef.current
      el.scrollTop = el.scrollHeight - height + top
      preserveScrollRef.current = null
      return
    }

    if (messages.length > 0) {
      if (isInitialLoadRef.current && firstUnreadMessageRef.current) {
        el.scrollTop = Math.max(firstUnreadMessageRef.current.offsetTop - 16, 0)
        isInitialLoadRef.current = false
        return
      }

      el.scrollTo({
        top: el.scrollHeight,
        behavior: isInitialLoadRef.current ? 'auto' : 'smooth',
      })
      isInitialLoadRef.current = false
    }
  }, [room?.id, lastMessageId, messages.length])

  const loadMoreMessages = () => {
    if (mockMode || !roomId || !hasNext || !nextCursor || loadingMore) return

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
      .catch(() => {
        preserveScrollRef.current = null
      })
      .finally(() => setLoadingMore(false))
  }

  const handleSend = async (text: string): Promise<boolean> => {
    if (!roomId) return false

    if (mockMode) {
      setLocalMockMessages((current) => [
        ...current,
        {
          id: `mock-message-${Date.now()}`,
          chatRoomId: roomId,
          senderId: MOCK_MY_USER_ID,
          senderNickname: '나',
          messageType: 'TEXT',
          content: text,
          sentAt: new Date().toISOString(),
          readAt: null,
        },
      ])
      return true
    }

    const body = { messageType: 'TEXT' as const, content: text }
    const sentViaSocket = sendSocketMessage(roomId, body)

    if (sentViaSocket) return true

    try {
      const res = await sendChatMessage(roomId, body)
      appendRoomMessage(roomId, res.data)
      return true
    } catch {
      return false
    }
  }

  const handleLocationRequest = async () => {
    if (!roomId || locationRequestCooldownUntil > Date.now()) return

    const sent = await handleSend(LOCATION_REQUEST_MESSAGE)
    if (!sent) return

    const cooldownUntil = Date.now() + LOCATION_REQUEST_COOLDOWN_MS
    if (!mockMode) {
      localStorage.setItem(
        `${LOCATION_REQUEST_COOLDOWN_PREFIX}${roomId}`,
        String(cooldownUntil)
      )
    }
    setLocationRequestCooldownUntil(cooldownUntil)
  }

  const handleLocationAgree = async () => {
    const sent = await handleSend(LOCATION_ACCEPT_MESSAGE)
    if (sent) setLiveLocationSharingEnabled(true)
  }

  useEffect(() => {
    if (messages.some((message) => message.content === LOCATION_ACCEPT_MESSAGE)) {
      setLiveLocationSharingEnabled(true)
    }
  }, [messages])

  const handleCompleteCard = async () => {
    if (!roomId || !room) return

    if (mockMode) {
      setLiveLocationSharingEnabled(false)
      setClosedMessage('종료된 채팅방입니다.')
      return
    }

    try {
      await apiFetch(`/api/cards/${room.cardId}/complete`, { method: 'PATCH' })
      await closeChatRoom(roomId)
      setLiveLocationSharingEnabled(false)
      setClosedMessage('종료된 채팅방입니다.')
    } catch (error) {
      if (error instanceof ApiError && error.status === 403) {
        alert('카드 작성자만 완료할 수 있습니다.')
      } else if (error instanceof ApiError && error.status === 409) {
        alert('매칭 상태가 아니어서 완료할 수 없습니다.')
      } else {
        alert('완료 처리에 실패했습니다. 다시 시도해주세요.')
      }
    }
  }

  const handleCloseRoom = async () => {
    if (!roomId) return

    if (mockMode) {
      setLiveLocationSharingEnabled(false)
      setClosedMessage('종료된 채팅방입니다.')
      return
    }

    try {
      await closeChatRoom(roomId)
      setLiveLocationSharingEnabled(false)
      setClosedMessage('종료된 채팅방입니다.')
    } catch {
      alert('채팅방 종료에 실패했습니다. 다시 시도해주세요.')
    }
  }

  const handleScroll = () => {
    if (scrollRef.current && scrollRef.current.scrollTop < 40) {
      loadMoreMessages()
    }
  }

  const handleDismissLocationGuide = () => {
    localStorage.setItem(LOCATION_GUIDE_SEEN_STORAGE_KEY, 'true')
    setShowLocationGuide(false)
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

  const visibleMessages = messages.filter(
    (msg) =>
      msg.messageType !== 'ROOM_CLOSED' &&
      msg.content !== LOCATION_ACCEPT_MESSAGE
  )
  const firstUnreadMessageIndex = visibleMessages.findIndex(
    (message) => message.senderId !== myUserId && !message.readAt
  )

  return (
    <PageTransition>
      <div className="relative mx-auto h-[844px] w-[390px] overflow-hidden bg-white">
        <PageHeader
          title={room.opponentNickname ?? '알 수 없음'}
          onBack={() => navigate('/chat', { replace: true })}
          rightAction={
            <button
              type="button"
              onClick={() => setShowMenu((prev) => !prev)}
              className="flex h-6 w-6 items-center justify-center"
            >
              <img src={menuIcon} alt="메뉴" className="h-[18px] w-[3px]" />
            </button>
          }
        />

        <ChatRoomMenuDropdown
          open={showMenu}
          onClose={() => setShowMenu(false)}
          options={[
            ...(closedMessage
              ? []
              : [
                  {
                    label: notificationsEnabled ? '알림 끄기' : '알림 켜기',
                    onClick: () => setNotificationsEnabled((prev) => !prev),
                  },
                ]),
            { label: '신고하기', onClick: () => setShowReportModal(true) },
            ...(closedMessage
              ? []
              : [{ label: '채팅방 나가기', onClick: () => setShowLeaveModal(true) }]),
          ]}
        />

        <div
          className="absolute left-0 top-[99px] flex h-[145px] w-full flex-col gap-5 px-6 py-3"
          style={{
            background: 'linear-gradient(180deg, #FF9E1B -52.24%, #FFF 115.3%)',
          }}
        >
          <div>
            <p className="mt-[30px] text-[18px] font-semibold text-black">
              {cardCategory}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowCompleteModal(true)}
            disabled={Boolean(closedMessage)}
            className="flex h-10 w-[107px] -translate-y-2 items-center justify-center rounded-full bg-black text-base font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            완료
          </button>

          <img
            src={chatRoomChar}
            alt=""
            className="pointer-events-none absolute right-0 top-0 h-36 w-[153px] object-contain"
          />
        </div>

        <div className="pointer-events-none absolute inset-x-0 top-[243px] z-10 h-8 bg-[linear-gradient(to_bottom,rgba(255,255,255,1)_0%,rgba(255,255,255,0.98)_30%,rgba(255,255,255,0)_75%)]" />

        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="chat-scrollbar absolute inset-x-0 top-[259px] bottom-[73px] overflow-y-auto"
        >
          <p className="text-center text-[13px] text-[#666]">{formatMatchedDate(room.createdAt)}</p>

          <div className="mt-6 flex flex-col gap-6">
            {visibleMessages.map((msg, index) => {
                const sender = msg.senderId === myUserId ? 'me' : 'partner'
                const previousMessage = visibleMessages[index - 1]
                const nextMessage = visibleMessages[index + 1]
                const isSameGroupAsPrevious =
                  Boolean(previousMessage) &&
                  previousMessage.senderId === msg.senderId &&
                  formatMessageTime(previousMessage.sentAt) ===
                    formatMessageTime(msg.sentAt)
                const compact = isSameGroupAsPrevious
                const showTime =
                  !nextMessage ||
                  nextMessage.senderId !== msg.senderId ||
                  formatMessageTime(nextMessage.sentAt) !==
                    formatMessageTime(msg.sentAt)
                const showSenderInfo =
                  sender === 'partner' && !isSameGroupAsPrevious
                if (msg.content === LOCATION_REQUEST_MESSAGE) {
                  const accepted = messages.some(
                    (message) =>
                      message.content === LOCATION_ACCEPT_MESSAGE &&
                      (mockMode ||
                        Date.parse(message.sentAt) >= Date.parse(msg.sentAt))
                  )

                  if (sender === 'partner' && showSenderInfo) {
                    return (
                      <div
                        key={msg.id}
                        ref={index === firstUnreadMessageIndex ? firstUnreadMessageRef : undefined}
                        className="flex items-start gap-2 px-6"
                      >
                        <div className="flex size-[30px] shrink-0 items-center justify-center rounded-full bg-[#FFF4E8]">
                          <img
                            src={room.opponentProfileImageUrl || miniProfileChar}
                            alt={msg.senderNickname}
                            className="size-[26px] object-contain"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <p className="text-xs text-[#343434]">{msg.senderNickname}</p>
                          <div className="flex items-end gap-[5px]">
                            <LiveLocationShareCard
                              sender={sender}
                              status={closedMessage ? 'ended' : accepted ? 'accepted' : 'requested'}
                              onAgree={() => setShowLocationAgreeModal(true)}
                              onOpen={() => navigate(`/location?roomId=${roomId}`)}
                            />
                            {showTime && (
                              <span className="shrink-0 text-[10px] font-light leading-[14px] text-[#929292]">
                                {formatMessageTime(msg.sentAt)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  }

                  return (
                    <div
                      key={msg.id}
                      ref={index === firstUnreadMessageIndex ? firstUnreadMessageRef : undefined}
                      className={`flex items-end gap-[5px] ${compact ? '-mt-3' : ''} ${
                        sender === 'me'
                          ? 'justify-end px-6'
                          : 'justify-start pl-[62px] pr-6'
                      }`}
                    >
                      {sender === 'me' && showTime && (
                        <span className="shrink-0 text-[10px] font-light leading-[14px] text-[#929292]">
                          {formatMessageTime(msg.sentAt)}
                        </span>
                      )}

                      <LiveLocationShareCard
                        sender={sender}
                        status={closedMessage ? 'ended' : accepted ? 'accepted' : 'requested'}
                        onAgree={() => setShowLocationAgreeModal(true)}
                        onOpen={() => navigate(`/location?roomId=${roomId}`)}
                      />

                      {sender === 'partner' && showTime && (
                        <span className="shrink-0 text-[10px] font-light leading-[14px] text-[#929292]">
                          {formatMessageTime(msg.sentAt)}
                        </span>
                      )}
                    </div>
                  )
                }

                return (
                  <ChatMessageBubble
                    key={msg.id}
                    sender={sender}
                    message={msg.content ?? ''}
                    time={formatMessageTime(msg.sentAt)}
                    nickname={sender === 'partner' ? msg.senderNickname : undefined}
                    showSenderInfo={showSenderInfo}
                    compact={compact}
                    showTime={showTime}
                    containerRef={index === firstUnreadMessageIndex ? firstUnreadMessageRef : undefined}
                    profileImageUrl={
                      sender === 'partner'
                        ? (room.opponentProfileImageUrl ?? undefined)
                        : undefined
                    }
                    messageId={msg.id}
                    messageType={msg.messageType}
                    translatable={msg.messageType === 'TEXT'}
                    mockTranslate={mockMode}
                  />
                )
              })}
          </div>

          {closedMessage && (
            <p className="mt-6 text-center text-sm text-black">
              {closedMessage}
            </p>
          )}
          <div ref={messagesEndRef} className="h-6" aria-hidden="true" />
        </div>

        <ChatRoomInputBar
          disabled={Boolean(closedMessage)}
          locationRequestDisabled={locationRequestCooldownUntil > Date.now()}
          onSend={handleSend}
          onLocationRequest={handleLocationRequest}
        />

        <FloatingConfirmModal
          open={showLocationAgreeModal}
          title="실시간 위치를 공유하시겠어요?"
          description="상대방과 위치가 실시간으로 공유돼요."
          onConfirm={() => {
            setShowLocationAgreeModal(false)
            void handleLocationAgree()
          }}
          onCancel={() => setShowLocationAgreeModal(false)}
        />

        <FloatingConfirmModal
          open={showCompleteModal}
          title="매칭을 완료하시겠습니까?"
          description="완료 시 위치 공유가 불가합니다."
          onConfirm={() => {
            setShowCompleteModal(false)
            handleCompleteCard()
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
          roomId={roomId}
          onSuccess={() => setClosedMessage('종료된 채팅방입니다.')}
        />

        {showLocationGuide && !closedMessage && (
          <div
            onClick={handleDismissLocationGuide}
            className="absolute inset-0 z-50 bg-black/40"
          >
            <div className="absolute left-[17px] top-[682px] animate-bounce">
              <p className="text-base text-white">실시간 위치 공유하기</p>

              <img
                src={tapFinger}
                alt="실시간 위치 공유하기"
                className="mt-[3px] h-[43px] w-[38px] rotate-180"
              />
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  )
}
