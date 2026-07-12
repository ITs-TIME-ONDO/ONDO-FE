import miniProfileChar from '../assets/mini_profile_char.png'

type Props = {
  nickname: string
  message: string
  time: string
  unread?: boolean
  profileImageUrl?: string
  onClick?: () => void
}

export default function ChatRoomListItem({
  nickname,
  message,
  time,
  unread = false,
  profileImageUrl,
  onClick,
}: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 border-b border-[#EDEDED] px-6 py-[13px] text-left"
    >
      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#FFF4E8]">
        <img
          src={profileImageUrl || miniProfileChar}
          alt={nickname}
          className="size-9 object-contain"
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-[16px] font-medium text-black">
            {nickname}
          </p>
          <span className="shrink-0 text-[12px] text-[#666]">{time}</span>
        </div>

        <div className="mt-[3px] flex items-center justify-between gap-2">
          <p
            className={`truncate text-[12px] ${
              unread ? 'font-semibold text-[#343434]' : 'text-[#929292]'
            }`}
          >
            {message}
          </p>
          {unread && (
            <span className="size-[10px] shrink-0 rounded-full bg-[#1BB3FF]" />
          )}
        </div>
      </div>
    </button>
  )
}
