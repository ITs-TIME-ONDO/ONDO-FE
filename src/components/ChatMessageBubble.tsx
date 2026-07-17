import { useRef, useState } from 'react'
import type { Ref } from 'react'
import miniProfileChar from '../assets/mini_profile_char.png'
import { translateChatMessage, type MessageType } from '../api/chat'
import { useLongPress } from '../hooks/useLongPress'

type Props = {
  sender: 'me' | 'partner'
  message: string
  time: string
  nickname?: string
  profileImageUrl?: string
  showSenderInfo?: boolean
  compact?: boolean
  showTime?: boolean
  containerRef?: Ref<HTMLDivElement>
  messageId?: string
  messageType?: MessageType
  translatable?: boolean
  mockTranslate?: boolean
}

const MOCK_TRANSLATE_DELAY_MS = 800

type TranslationState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'done'; translatedText: string }

function TranslateMenu({
  onTranslate,
  onClose,
  side = 'right',
}: {
  onTranslate: () => void
  onClose: () => void
  side?: 'left' | 'right'
}) {
  return (
    <>
      <button
        type="button"
        aria-label="번역 메뉴 닫기"
        tabIndex={-1}
        className="fixed inset-0 z-40"
        onPointerDown={onClose}
      />
      <div
        className={`absolute top-1/2 z-50 -translate-y-1/2 overflow-hidden whitespace-nowrap rounded-[5px] border border-white/60 bg-white/90 backdrop-blur-[2px] ${
          side === 'right' ? 'left-full ml-2' : 'right-full mr-2'
        }`}
        style={{ boxShadow: '0px 2px 4px rgba(0,0,0,0.25)' }}
      >
        <button
          type="button"
          onClick={() => {
            onTranslate()
            onClose()
          }}
          className="min-w-[54px] px-4 py-1.5 text-left text-[12px] text-black"
        >
          번역
        </button>
      </div>
    </>
  )
}

function MessageBubble({
  message,
  bubbleClassName,
  messageId,
  translatable,
  mockTranslate,
  menuSide = 'right',
}: {
  message: string
  bubbleClassName: string
  messageId?: string
  translatable: boolean
  mockTranslate?: boolean
  menuSide?: 'left' | 'right'
}) {
  const [translation, setTranslation] = useState<TranslationState>({
    status: 'idle',
  })
  const [showTranslation, setShowTranslation] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const cachedTranslationRef = useRef<string | null>(null)

  const requestTranslation = () => {
    if (!messageId || translation.status === 'loading') return

    if (cachedTranslationRef.current !== null) {
      setShowTranslation(true)
      return
    }

    setTranslation({ status: 'loading' })

    if (mockTranslate) {
      window.setTimeout(() => {
        const mockTranslatedText = `[Mock 번역] ${message}`
        cachedTranslationRef.current = mockTranslatedText
        setTranslation({ status: 'done', translatedText: mockTranslatedText })
        setShowTranslation(true)
      }, MOCK_TRANSLATE_DELAY_MS)
      return
    }

    translateChatMessage(messageId, navigator.language)
      .then((res) => {
        cachedTranslationRef.current = res.data.translatedText
        setTranslation({
          status: 'done',
          translatedText: res.data.translatedText,
        })
        setShowTranslation(true)
      })
      .catch(() => setTranslation({ status: 'error' }))
  }

  const longPress = useLongPress(() => setMenuOpen(true))

  return (
    <div className="relative">
      <div
        role={translatable ? 'button' : undefined}
        tabIndex={translatable ? 0 : undefined}
        onKeyDown={(e) => {
          if (!translatable) return
          if (e.target !== e.currentTarget) return
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setMenuOpen((prev) => !prev)
          }
        }}
        {...(translatable ? longPress : {})}
        className={`select-none transition-transform duration-200 ease-out ${
          menuOpen ? 'scale-[1.03]' : 'scale-100'
        } ${bubbleClassName}`}
      >
        <p className="whitespace-pre-wrap break-words text-sm text-black">
          {message}
        </p>

        {translation.status === 'loading' && (
          <div className="mt-1.5 flex gap-1">
            <span className="size-1 animate-bounce rounded-full bg-black/40 [animation-delay:-0.2s]" />
            <span className="size-1 animate-bounce rounded-full bg-black/40 [animation-delay:-0.1s]" />
            <span className="size-1 animate-bounce rounded-full bg-black/40" />
          </div>
        )}

        {translation.status === 'error' && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              requestTranslation()
            }}
            className="mt-1.5 block text-xs text-red-500 underline"
          >
            번역 실패, 다시 시도
          </button>
        )}

        {showTranslation && translation.status === 'done' && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setShowTranslation(false)
            }}
            className="mt-1.5 block w-full border-t border-black/10 pt-1.5 text-left"
          >
            <p className="whitespace-pre-wrap break-words text-sm text-black/70">
              {translation.translatedText}
            </p>
          </button>
        )}
      </div>

      {menuOpen && (
        <TranslateMenu
          onTranslate={requestTranslation}
          onClose={() => setMenuOpen(false)}
          side={menuSide}
        />
      )}
    </div>
  )
}

export default function ChatMessageBubble({
  sender,
  message,
  time,
  nickname,
  profileImageUrl,
  showSenderInfo = true,
  compact = false,
  showTime = true,
  containerRef,
  messageId,
  translatable = false,
  mockTranslate = false,
}: Props) {
  if (sender === 'me') {
    return (
      <div
        ref={containerRef}
        className={`flex items-end justify-end gap-[5px] px-6 ${compact ? '-mt-3' : ''}`}
      >
        {showTime && (
          <span className="shrink-0 text-[10px] font-light leading-[14px] text-[#929292]">
            {time}
          </span>
        )}
        <MessageBubble
          message={message}
          bubbleClassName="max-w-[220px] rounded-2xl bg-[#1BB3FF]/20 px-3 py-2"
          messageId={messageId}
          translatable={translatable}
          mockTranslate={mockTranslate}
          menuSide="left"
        />
      </div>
    )
  }

  if (!showSenderInfo) {
    return (
      <div
        ref={containerRef}
        className={`flex items-end gap-[5px] pl-[62px] pr-6 ${compact ? '-mt-3' : ''}`}
      >
        <MessageBubble
          message={message}
          bubbleClassName="max-w-[220px] rounded-2xl bg-[#F3F3F3] px-3 py-2"
          messageId={messageId}
          translatable={translatable}
          mockTranslate={mockTranslate}
          menuSide="right"
        />
        {showTime && (
          <span className="shrink-0 text-[10px] font-light leading-[14px] text-[#929292]">
            {time}
          </span>
        )}
      </div>
    )
  }

  return (
    <div ref={containerRef} className="flex items-start gap-2 px-6">
      <div className="flex size-[30px] shrink-0 items-center justify-center rounded-full bg-[#FFF4E8]">
        <img
          src={profileImageUrl || miniProfileChar}
          alt={nickname}
          className="size-[26px] object-contain"
        />
      </div>

      <div className="flex flex-col gap-1">
        <p className="text-xs text-[#343434]">{nickname}</p>

        <div className="flex items-end gap-[5px]">
          <MessageBubble
            message={message}
            bubbleClassName="max-w-[220px] rounded-2xl bg-[#F3F3F3] px-3 py-2"
            messageId={messageId}
            translatable={translatable}
            mockTranslate={mockTranslate}
            menuSide="right"
          />
          {showTime && (
            <span className="shrink-0 text-[10px] font-light leading-[14px] text-[#929292]">
              {time}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
