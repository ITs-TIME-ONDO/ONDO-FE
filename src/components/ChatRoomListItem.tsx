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
      className="relative flex h-[83px] w-full items-center gap-3 px-6 text-left after:absolute after:bottom-0 after:left-6 after:right-6 after:h-px after:bg-[#EDEDED]"
    >
      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#FFF4E8]">
        <img
          src={profileImageUrl || miniProfileChar}
          alt={nickname}
          className="size-10 rounded-full object-cover"
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-base font-medium leading-6 text-black">
            {nickname}
          </p>
          <span className="shrink-0 text-xs leading-4 text-[#666]">{time}</span>
        </div>

        <div className="mt-1 flex items-center justify-between gap-2">
          <p
            className={`truncate text-xs leading-4 ${
              unread ? 'font-semibold text-[#343434]' : 'text-[#929292]'
            }`}
          >
            {message}
          </p>
          {unread && (
            <span className="size-2.5 shrink-0 rounded-full bg-[#1BB3FF]">
              <span className="sr-only">읽지 않음</span>
            </span>
          )}
        </div>
      </div>
    </button>
  )
}
