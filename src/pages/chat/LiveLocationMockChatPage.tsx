import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import PageHeader from '../../components/PageHeader'
import PageTransition from '../../components/PageTransition'
import LiveLocationShareCard from '../../components/LiveLocationShareCard'
import ChatMessageBubble from '../../components/ChatMessageBubble'
import FloatingConfirmModal from '../../components/FloatingConfirmModal'
import ChatRoomInputBar from './ChatRoomInputBar'
import chatRoomChar from '../../assets/chat_room_char.png'
import miniProfileChar from '../../assets/mini_profile_char.png'

const MOCK_TIME = '오후 8:34'

function MockCardRow({
  sender,
  accepted = false,
  onAgree,
  onOpen,
}: {
  sender: 'me' | 'partner'
  accepted?: boolean
  onAgree?: () => void
  onOpen?: () => void
}) {
  if (sender === 'partner') {
    return (
      <div className="flex items-start gap-2">
        <div className="flex size-[30px] shrink-0 items-center justify-center rounded-full bg-[#FFF4E8]">
          <img
            src={miniProfileChar}
            alt="익명의 고슴도치"
            className="size-[26px] object-contain"
          />
        </div>

        <div className="flex min-w-0 flex-col gap-1">
          <p className="text-[10px] text-[#343434]">익명의 고슴도치</p>
          <div className="flex items-end gap-[5px]">
            <LiveLocationShareCard
              sender="partner"
              status={accepted ? 'accepted' : 'requested'}
              onAgree={onAgree}
              onOpen={onOpen}
            />
            <span className="shrink-0 text-[8px] text-[#929292]">{MOCK_TIME}</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-end justify-end gap-[5px]">
      <span className="shrink-0 text-[8px] text-[#929292]">{MOCK_TIME}</span>
      <LiveLocationShareCard
        sender="me"
        status={accepted ? 'accepted' : 'requested'}
        onAgree={onAgree}
        onOpen={onOpen}
      />
    </div>
  )
}

export default function LiveLocationMockChatPage() {
  const navigate = useNavigate()
  const [receivedAccepted, setReceivedAccepted] = useState(false)
  const [showAgreeModal, setShowAgreeModal] = useState(false)
  const [mockMessages, setMockMessages] = useState<
    Array<{ id: string; message: string }>
  >([])
  const openLocation = () => navigate('/location?roomId=mock-live-location')

  const sendMockMessage = async (message: string) => {
    setMockMessages((current) => [
      ...current,
      { id: crypto.randomUUID(), message },
    ])
    return true
  }

  return (
    <PageTransition>
      <div className="relative mx-auto h-[844px] w-[390px] overflow-hidden bg-white">
        <PageHeader title="위치 공유 UI 목업" onBack={() => navigate('/chat')} />

        <div
          className="absolute left-0 top-[99px] flex h-[166px] w-full flex-col gap-5 px-6 py-3"
          style={{
            background: 'linear-gradient(180deg, #FF9E1B -52.24%, #FFF 115.3%)',
          }}
        >
          <p className="mt-[30px] text-[18px] font-semibold text-black">사진 찍기</p>
          <button
            type="button"
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

        <main className="chat-scrollbar absolute inset-x-0 bottom-[90px] top-[265px] overflow-y-auto pb-8 pt-5">
          <div className="px-6">
          <p className="text-center text-xs text-[#666]">2026년 7월 17일</p>

          <div className="mt-6 flex flex-col gap-7">
            <section aria-label="내가 요청을 보낸 상태">
              <MockCardRow sender="me" />
            </section>

            <section aria-label="내가 요청을 받은 상태">
              <MockCardRow
                sender="partner"
                accepted={receivedAccepted}
                onAgree={() => setShowAgreeModal(true)}
                onOpen={openLocation}
              />
            </section>

            <section aria-label="상호 동의가 완료된 상태">
              <MockCardRow sender="me" accepted onOpen={openLocation} />
            </section>

            {mockMessages.map((message) => (
              <ChatMessageBubble
                key={message.id}
                sender="me"
                message={message.message}
                time={MOCK_TIME}
              />
            ))}
          </div>
          </div>
        </main>

        <ChatRoomInputBar
          onSend={sendMockMessage}
          onLocationRequest={() => {}}
        />

        <FloatingConfirmModal
          open={showAgreeModal}
          title="실시간 위치를 공유하시겠어요?"
          description="상대방과 위치가 실시간으로 공유돼요."
          onConfirm={() => {
            setShowAgreeModal(false)
            setReceivedAccepted(true)
          }}
          onCancel={() => setShowAgreeModal(false)}
        />
      </div>
    </PageTransition>
  )
}
