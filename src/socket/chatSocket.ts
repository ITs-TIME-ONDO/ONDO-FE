import { Client } from '@stomp/stompjs'

import { getAccessToken } from '../utils/authStorage'

const WS_URL = 'ws://54.117.1.94/ws'

export function connectChatSocket(): Client {
  const client = new Client({
    brokerURL: WS_URL,
    connectHeaders: {
      Authorization: `Bearer ${getAccessToken() ?? ''}`,
    },
    onConnect: () => {
      console.log('[chatSocket] STOMP 연결 성공')
    },
    onStompError: (frame) => {
      console.error('[chatSocket] STOMP 에러', frame.headers, frame.body)
    },
    onWebSocketError: (event) => {
      console.error('[chatSocket] WebSocket 연결 실패', event)
    },
    onWebSocketClose: (event) => {
      console.log('[chatSocket] WebSocket 연결 종료', event.code, event.reason)
    },
  })

  client.activate()
  return client
}
