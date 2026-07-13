// TODO: 채팅방/메시지 API 연동 후 mock 데이터 제거

export type ChatMessage = {
  id: string
  sender: 'me' | 'partner'
  message: string
  time: string
}

export type ChatRoomSummary = {
  id: string
  nickname: string
  message: string
  time: string
  unread: boolean
  category: string
  distanceMeters: number
  matchedDate: string
  messages: ChatMessage[]
}

export const mockChatRooms: ChatRoomSummary[] = [
  {
    id: '1',
    nickname: '익명의 고슴도치',
    message: '어디서 만날까요 .....',
    time: '오후 8:34',
    unread: true,
    category: '사진 찍기',
    distanceMeters: 98,
    matchedDate: '2026년 5월 23일',
    messages: [
      { id: 'm1', sender: 'partner', message: '안녕하세요!ㅎㅎ', time: '오후 8:34' },
      { id: 'm2', sender: 'me', message: '네! 안녕하세요~반가워용', time: '오후 8:34' },
      {
        id: 'm3',
        sender: 'partner',
        message: '경복궁에서 사진 찍어줄 분 찾으시는 거 맞으시죠?',
        time: '오후 8:34',
      },
    ],
  },
  {
    id: '2',
    nickname: '당당한 당근',
    message: '어디서 만날까요 .....',
    time: '오후 8:34',
    unread: false,
    category: '합석',
    distanceMeters: 150,
    matchedDate: '2026년 5월 23일',
    messages: [
      { id: 'm1', sender: 'partner', message: '어디서 만날까요 .....', time: '오후 8:34' },
    ],
  },
]
