import { useEffect, useState } from 'react'
import { check, sexual } from 'korcen' // korcen.ts 오픈소스 이용해서 한국어 비속어 블로킹

import mapIcon from '../../assets/chat_map_icon.svg'
import sendIcon from '../../assets/chat_send_icon.svg'

type Props = {
  disabled?: boolean
  onSend?: (text: string) => void
}

export default function ChatRoomInputBar({ disabled = false, onSend }: Props) {
  const [value, setValue] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (disabled) setValue('')
  }, [disabled])

  const handleSend = () => {
    const text = value.trim()
    if (disabled || !text) return

    // 클라이언트 단어사전 기반 경량 차단 — 우회 가능성 있어 실효성 있는 필터링은
    // 백엔드/AI 모더레이션에서 별도로 처리해야 함
    if (check(text) || sexual(text)) {
      setError('부적절한 표현이 포함되어 있어 전송할 수 없습니다.')
      return
    }

    setError('')
    onSend?.(text)
    setValue('')
  }

  return (
    <div className="absolute bottom-6 left-0 flex w-full flex-col gap-1 px-6">
      {error && <p className="px-1 text-xs text-red-500">{error}</p>}

      <div className="flex items-center gap-3">
        <button type="button" disabled={disabled} className="shrink-0">
          <img src={mapIcon} alt="위치 공유" className="h-5 w-5" />
        </button>

        <div className="flex h-[50px] flex-1 items-center gap-2 rounded-full bg-[#F3F3F3] px-5">
          <input
            type="text"
            value={value}
            onChange={(e) => {
              setValue(e.target.value)
              if (error) setError('')
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={
              disabled ? '메시지를 보낼 수 없습니다' : '메시지 보내기'
            }
            disabled={disabled}
            className="min-w-0 flex-1 bg-transparent text-sm text-[#343434] placeholder:text-[#343434] focus:outline-none"
          />

          <button
            type="button"
            onClick={handleSend}
            disabled={disabled}
            className="shrink-0"
          >
            <img src={sendIcon} alt="전송" className="h-6 w-[23px]" />
          </button>
        </div>
      </div>
    </div>
  )
}
