import { create } from 'zustand'
import { Client, type StompSubscription } from '@stomp/stompjs'

import { getAccessToken } from '../utils/authStorage'
import type { ChatMessage, ChatMessageSendRequest, ChatReadEvent } from '../api/chat'

const WS_URL = 'ws://54.117.1.94/ws'

interface ChatSocketState {
  client: Client | null
  connected: boolean
  messagesByRoom: Record<string, ChatMessage[]>
  roomSubscriptions: Record<string, StompSubscription>
  readSubscriptions: Record<string, StompSubscription>
  readHandlers: Record<string, (event: ChatReadEvent) => void>
  pendingRoomIds: Set<string>
  connect: () => void
  subscribeToRoom: (roomId: string) => void
  unsubscribeFromRoom: (roomId: string) => void
  setRoomMessages: (roomId: string, messages: ChatMessage[]) => void
  prependRoomMessages: (roomId: string, messages: ChatMessage[]) => void
  sendMessage: (roomId: string, body: ChatMessageSendRequest) => boolean
  onRoomRead: (roomId: string, handler: ((event: ChatReadEvent) => void) | null) => void
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

  get().pendingRoomIds.delete(roomId)
  set({
    roomSubscriptions: { ...get().roomSubscriptions, [roomId]: messageSub },
    readSubscriptions: { ...get().readSubscriptions, [roomId]: readSub },
  })
}

export const useChatSocketStore = create<ChatSocketState>((set, get) => ({
  client: null,
  connected: false,
  messagesByRoom: {},
  roomSubscriptions: {},
  readSubscriptions: {},
  readHandlers: {},
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
        set({ connected: false })
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
    const { roomSubscriptions, readSubscriptions, pendingRoomIds, readHandlers } = get()
    roomSubscriptions[roomId]?.unsubscribe()
    readSubscriptions[roomId]?.unsubscribe()
    pendingRoomIds.delete(roomId)

    const nextRoomSubs = { ...roomSubscriptions }
    const nextReadSubs = { ...readSubscriptions }
    const nextReadHandlers = { ...readHandlers }
    delete nextRoomSubs[roomId]
    delete nextReadSubs[roomId]
    delete nextReadHandlers[roomId]

    set({
      roomSubscriptions: nextRoomSubs,
      readSubscriptions: nextReadSubs,
      readHandlers: nextReadHandlers,
    })
  },

  setRoomMessages: (roomId, messages) => {
    set({ messagesByRoom: { ...get().messagesByRoom, [roomId]: messages } })
  },

  prependRoomMessages: (roomId, messages) => {
    const current = get().messagesByRoom[roomId] ?? []
    const existingIds = new Set(current.map((m) => m.id))
    const newOnes = messages.filter((m) => !existingIds.has(m.id))
    set({
      messagesByRoom: { ...get().messagesByRoom, [roomId]: [...newOnes, ...current] },
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
}))
