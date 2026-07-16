import { create } from 'zustand'
import { Client, type StompSubscription } from '@stomp/stompjs'

import { getAccessToken } from '../utils/authStorage'
import type {
  ChatMessage,
  ChatMessageSendRequest,
  ChatReadEvent,
  LiveLocationEvent,
} from '../api/chat'

export interface SendLiveLocationRequest {
  latitude: number
  longitude: number
  accuracy: number
}

const WS_URL = 'ws://54.117.1.94/ws'

// selector fallback용 고정 참조 — 매번 새 배열([])을 반환하면 useSyncExternalStore가
// 스냅샷이 계속 바뀌었다고 판단해 무한 리렌더링(Maximum update depth exceeded)이 발생함
export const EMPTY_MESSAGES: ChatMessage[] = []

interface ChatSocketState {
  client: Client | null
  connected: boolean
  messagesByRoom: Record<string, ChatMessage[]>
  roomSubscriptions: Record<string, StompSubscription>
  readSubscriptions: Record<string, StompSubscription>
  liveLocationSubscriptions: Record<string, StompSubscription>
  readHandlers: Record<string, (event: ChatReadEvent) => void>
  // roomId -> senderId -> 그 사용자의 최신 위치 이벤트
  liveLocationByRoom: Record<string, Record<string, LiveLocationEvent>>
  pendingRoomIds: Set<string>
  connect: () => void
  subscribeToRoom: (roomId: string) => void
  unsubscribeFromRoom: (roomId: string) => void
  setRoomMessages: (roomId: string, messages: ChatMessage[]) => void
  prependRoomMessages: (roomId: string, messages: ChatMessage[]) => void
  appendRoomMessage: (roomId: string, message: ChatMessage) => void
  markMessagesRead: (roomId: string, messageIds: string[], readAt: string) => void
  sendMessage: (roomId: string, body: ChatMessageSendRequest) => boolean
  onRoomRead: (roomId: string, handler: ((event: ChatReadEvent) => void) | null) => void
  setLiveLocation: (roomId: string, event: LiveLocationEvent) => void
  sendLiveLocation: (roomId: string, body: SendLiveLocationRequest) => boolean
  stopLiveLocation: (roomId: string) => void
}

function subscribeToRoomChannels(
  get: () => ChatSocketState,
  set: (partial: Partial<ChatSocketState>) => void,
  roomId: string
) {
  const { client } = get()
  if (!client) return

  const messageSub = client.subscribe(`/sub/chat/rooms/${roomId}`, (frame) => {
    const message = JSON.parse(frame.body) as ChatMessage
    const current = get().messagesByRoom
    set({
      messagesByRoom: {
        ...current,
        [roomId]: [...(current[roomId] ?? []), message],
      },
    })
  })

  const readSub = client.subscribe(`/sub/chat/rooms/${roomId}/read`, (frame) => {
    const event = JSON.parse(frame.body) as ChatReadEvent
    get().readHandlers[roomId]?.(event)
  })

  const liveLocationSub = client.subscribe(
    `/sub/chat/rooms/${roomId}/live-location`,
    (frame) => {
      const event = JSON.parse(frame.body) as LiveLocationEvent
      get().setLiveLocation(roomId, event)
    }
  )

  get().pendingRoomIds.delete(roomId)
  set({
    roomSubscriptions: { ...get().roomSubscriptions, [roomId]: messageSub },
    readSubscriptions: { ...get().readSubscriptions, [roomId]: readSub },
    liveLocationSubscriptions: {
      ...get().liveLocationSubscriptions,
      [roomId]: liveLocationSub,
    },
  })
}

export const useChatSocketStore = create<ChatSocketState>((set, get) => ({
  client: null,
  connected: false,
  messagesByRoom: {},
  roomSubscriptions: {},
  readSubscriptions: {},
  liveLocationSubscriptions: {},
  readHandlers: {},
  liveLocationByRoom: {},
  pendingRoomIds: new Set(),

  connect: () => {
    if (get().client) return

    const client = new Client({
      brokerURL: WS_URL,
      connectHeaders: {
        Authorization: `Bearer ${getAccessToken() ?? ''}`,
      },
      onConnect: () => {
        console.log('[chatSocket] STOMP 연결 성공')
        set({ connected: true })
        get().pendingRoomIds.forEach((roomId) => subscribeToRoomChannels(get, set, roomId))
      },
      onStompError: (frame) => {
        console.error('[chatSocket] STOMP 에러', frame.headers, frame.body)
      },
      onWebSocketError: (event) => {
        console.error('[chatSocket] WebSocket 연결 실패', event)
      },
      onWebSocketClose: (event) => {
        console.log('[chatSocket] WebSocket 연결 종료', event.code, event.reason)
        // 연결이 끊기면 구독도 함께 끊어지므로, 재연결 시 다시 구독할 수 있도록
        // 기존 구독 방들을 pendingRoomIds로 옮기고 구독 맵은 비운다.
        const { roomSubscriptions, pendingRoomIds } = get()
        Object.keys(roomSubscriptions).forEach((roomId) => pendingRoomIds.add(roomId))
        set({
          connected: false,
          roomSubscriptions: {},
          readSubscriptions: {},
          liveLocationSubscriptions: {},
        })
      },
    })

    client.activate()
    set({ client })
  },

  subscribeToRoom: (roomId) => {
    if (get().roomSubscriptions[roomId]) return

    const { client, connected } = get()
    if (client && connected) {
      subscribeToRoomChannels(get, set, roomId)
    } else {
      get().pendingRoomIds.add(roomId)
    }
  },

  unsubscribeFromRoom: (roomId) => {
    const {
      roomSubscriptions,
      readSubscriptions,
      liveLocationSubscriptions,
      pendingRoomIds,
      readHandlers,
    } = get()
    roomSubscriptions[roomId]?.unsubscribe()
    readSubscriptions[roomId]?.unsubscribe()
    liveLocationSubscriptions[roomId]?.unsubscribe()
    pendingRoomIds.delete(roomId)

    const nextRoomSubs = { ...roomSubscriptions }
    const nextReadSubs = { ...readSubscriptions }
    const nextLiveLocationSubs = { ...liveLocationSubscriptions }
    const nextReadHandlers = { ...readHandlers }
    delete nextRoomSubs[roomId]
    delete nextReadSubs[roomId]
    delete nextLiveLocationSubs[roomId]
    delete nextReadHandlers[roomId]

    set({
      roomSubscriptions: nextRoomSubs,
      readSubscriptions: nextReadSubs,
      liveLocationSubscriptions: nextLiveLocationSubs,
      readHandlers: nextReadHandlers,
    })
  },

  setRoomMessages: (roomId, messages) => {
    const current = get().messagesByRoom[roomId] ?? []
    const incomingIds = new Set(messages.map((m) => m.id))
    const liveOnly = current.filter((m) => !incomingIds.has(m.id))
    set({
      messagesByRoom: { ...get().messagesByRoom, [roomId]: [...messages, ...liveOnly] },
    })
  },

  prependRoomMessages: (roomId, messages) => {
    const current = get().messagesByRoom[roomId] ?? []
    const existingIds = new Set(current.map((m) => m.id))
    const newOnes = messages.filter((m) => !existingIds.has(m.id))
    set({
      messagesByRoom: { ...get().messagesByRoom, [roomId]: [...newOnes, ...current] },
    })
  },

  appendRoomMessage: (roomId, message) => {
    const current = get().messagesByRoom[roomId] ?? []
    if (current.some((m) => m.id === message.id)) return
    set({ messagesByRoom: { ...get().messagesByRoom, [roomId]: [...current, message] } })
  },

  markMessagesRead: (roomId, messageIds, readAt) => {
    const current = get().messagesByRoom[roomId]
    if (!current) return

    const idsToMark = new Set(messageIds)
    set({
      messagesByRoom: {
        ...get().messagesByRoom,
        [roomId]: current.map((m) =>
          idsToMark.has(m.id) ? { ...m, readAt } : m
        ),
      },
    })
  },

  sendMessage: (roomId, body) => {
    const { client, connected } = get()
    if (!client || !connected) {
      console.error('[chatSocket] 연결되지 않은 상태에서 SEND 시도')
      return false
    }

    client.publish({
      destination: `/pub/chat/rooms/${roomId}/messages`,
      body: JSON.stringify(body),
    })
    return true
  },

  onRoomRead: (roomId, handler) => {
    const next = { ...get().readHandlers }
    if (handler) next[roomId] = handler
    else delete next[roomId]
    set({ readHandlers: next })
  },

  setLiveLocation: (roomId, event) => {
    const current = get().liveLocationByRoom
    set({
      liveLocationByRoom: {
        ...current,
        [roomId]: { ...(current[roomId] ?? {}), [event.senderId]: event },
      },
    })
  },

  sendLiveLocation: (roomId, body) => {
    const { client, connected } = get()
    if (!client || !connected) return false

    client.publish({
      destination: `/pub/chat/rooms/${roomId}/live-location`,
      body: JSON.stringify(body),
    })
    return true
  },

  stopLiveLocation: (roomId) => {
    const { client, connected } = get()
    if (!client || !connected) return

    client.publish({
      destination: `/pub/chat/rooms/${roomId}/live-location/stop`,
      body: '',
    })
  },
}))
