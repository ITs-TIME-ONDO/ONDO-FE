import { useEffect, useState } from 'react'
import { check, sexual } from 'korcen'

import mapIcon from '../../assets/chat_map_icon.svg'
import sendIcon from '../../assets/chat_send_icon.svg'
import sendIconActive from '../../assets/chat_send_icon_active.svg'

type Props = {
  disabled?: boolean
  locationRequestDisabled?: boolean
  onSend: (text: string) => Promise<boolean>
  onLocationRequest: () => void
}

export default function ChatRoomInputBar({
  disabled = false,
  locationRequestDisabled = false,
  onSend,
  onLocationRequest,
}: Props) {
  const [value, setValue] = useState('')
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)
  const isSendActive = Boolean(value.trim()) && !disabled && !sending

  useEffect(() => {
    if (disabled) setValue('')
  }, [disabled])

  const handleSend = async () => {
    const text = value.trim()
    if (disabled || sending || !text) return

    if (check(text) || sexual(text)) {
      setError('부적절한 표현이 포함되어 있어 전송할 수 없습니다.')
      return
    }

    setError('')
    setSending(true)

    const success = await onSend?.(text)

    setSending(false)

    if (success) {
      setValue('')
    } else {
      setError('메시지 전송에 실패했습니다. 다시 시도해주세요.')
    }
  }

  return (
    <div className="absolute bottom-0 left-0 z-20 flex min-h-[74px] w-full flex-col gap-1 bg-white px-6 pb-6 before:pointer-events-none before:absolute before:bottom-full before:left-0 before:h-8 before:w-full before:bg-[linear-gradient(to_top,rgba(255,255,255,1)_0%,rgba(255,255,255,0.98)_30%,rgba(255,255,255,0)_75%)]">
      {error && <p className="pl-[3rem] pr-1 text-xs text-red-500">{error}</p>}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onLocationRequest}
          disabled={disabled || locationRequestDisabled}
          aria-label="실시간 위치 공유 요청"
          title={
            locationRequestDisabled
              ? '10분 후 다시 요청할 수 있어요'
              : undefined
          }
          className="shrink-0 disabled:cursor-not-allowed disabled:opacity-40"
        >
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
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.nativeEvent.isComposing) handleSend()
            }}
            placeholder={
              disabled ? '메시지를 보낼 수 없습니다' : '메시지 보내기'
            }
            disabled={disabled}
            className="min-w-0 flex-1 bg-transparent text-sm text-[#343434] placeholder:text-[#929292] focus:outline-none"
          />

          <button
            type="button"
            onClick={handleSend}
            disabled={!isSendActive}
            className="shrink-0"
          >
            <img
              src={isSendActive ? sendIconActive : sendIcon}
              alt="전송"
              className="h-6 w-[23px]"
            />
          </button>
        </div>
      </div>
    </div>
  )
}
