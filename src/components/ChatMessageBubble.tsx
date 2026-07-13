import miniProfileChar from '../assets/mini_profile_char.png'

type Props = {
  sender: 'me' | 'partner'
  message: string
  time: string
  nickname?: string
  profileImageUrl?: string
}

export default function ChatMessageBubble({
  sender,
  message,
  time,
  nickname,
  profileImageUrl,
}: Props) {
  if (sender === 'me') {
    return (
      <div className="flex items-end justify-end gap-[5px] px-6">
        <span className="shrink-0 text-[8px] text-[#929292]">{time}</span>
        <div className="max-w-[220px] rounded-2xl bg-[#1BB3FF]/20 px-3 py-2">
          <p className="whitespace-pre-wrap break-words text-sm text-black">
            {message}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-start gap-2 px-6">
      <div className="flex size-[30px] shrink-0 items-center justify-center rounded-full bg-[#FFF4E8]">
        <img
          src={profileImageUrl || miniProfileChar}
          alt={nickname}
          className="size-[26px] object-contain"
        />
      </div>

      <div className="flex flex-col gap-1">
        <p className="text-[10px] text-[#343434]">{nickname}</p>

        <div className="flex items-end gap-[5px]">
          <div className="max-w-[220px] rounded-2xl bg-[#F3F3F3] px-3 py-2">
            <p className="whitespace-pre-wrap break-words text-sm text-black">
              {message}
            </p>
          </div>
          <span className="shrink-0 text-[8px] text-[#929292]">{time}</span>
        </div>
      </div>
    </div>
  )
}
