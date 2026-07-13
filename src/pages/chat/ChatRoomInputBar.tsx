import { useEffect, useState } from 'react'

import mapIcon from '../../assets/chat_map_icon.svg'
import sendIcon from '../../assets/chat_send_icon.svg'

type Props = {
  disabled?: boolean
}

// TODO: 메시지 전송(WebSocket) 연동
export default function ChatRoomInputBar({ disabled = false }: Props) {
  const [value, setValue] = useState('')

  useEffect(() => {
    if (disabled) setValue('')
  }, [disabled])

  const handleSend = () => {
    if (disabled || !value.trim()) return
    setValue('')
  }

  return (
    <div className="absolute bottom-6 left-0 flex w-full items-center gap-3 px-6">
      <button type="button" disabled={disabled} className="shrink-0">
        <img src={mapIcon} alt="위치 공유" className="h-5 w-5" />
      </button>

      <div className="flex h-[50px] flex-1 items-center gap-2 rounded-full bg-[#F3F3F3] px-5">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder={disabled ? '메시지를 보낼 수 없습니다' : '메시지 보내기'}
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
  )
}
