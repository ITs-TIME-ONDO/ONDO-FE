type NotificationType =
  | 'NEW_CARD'
  | 'CARD_APPLIED'
  | 'MATCH_ACCEPTED'
  | 'MATCH_REJECTED'
  | 'CHAT_MESSAGE'

type Props = {
  type: NotificationType
  message: string
  time: string
  unread?: boolean
  onClick?: () => void
}

const typeLabelMap: Record<NotificationType, string> = {
  NEW_CARD: '새 카드',
  CARD_APPLIED: '신청 알림',
  MATCH_ACCEPTED: '매칭 완료',
  MATCH_REJECTED: '매칭 결과',
  CHAT_MESSAGE: '채팅 알림',
}

export default function NotificationListItem({
  type,
  message,
  time,
  unread = false,
  onClick,
}: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative flex h-[76px] w-full items-center gap-3 bg-white px-6 text-left after:absolute after:bottom-0 after:left-6 after:right-6 after:h-px after:bg-[#EDEDED]"
    >
      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#FFF4E8]">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <path
            d="M9 1.75C6.377 1.75 4.25 3.877 4.25 6.5V8.21C4.25 9.1 4.026 9.978 3.598 10.757L2.989 11.857C2.632 12.502 3.1 13.25 3.838 13.25H14.162C14.9 13.25 15.368 12.502 15.011 11.857L14.402 10.757C13.974 9.978 13.75 9.1 13.75 8.21V6.5C13.75 3.877 11.623 1.75 9 1.75Z"
            stroke="#FF9E1B"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
          <path
            d="M7 13.25C7.31 14.49 8.11 15.25 9 15.25C9.89 15.25 10.69 14.49 11 13.25"
            stroke="#FF9E1B"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-start">
        <div className="flex h-6 items-start justify-between gap-2">
          <p className="min-w-0 flex-1 truncate text-base font-medium leading-6 text-black">
            {typeLabelMap[type]}
          </p>
          <span className="shrink-0 pt-0.5 text-[11px] font-light leading-4 text-[#666]">
            {time}
          </span>
        </div>

        <div className="mt-1 flex items-center justify-between gap-2">
          <p
            className={`min-w-0 flex-1 truncate whitespace-nowrap text-[13px] leading-4 ${
              unread ? 'font-semibold text-[#343434]' : 'text-[#929292]'
            }`}
          >
            {message}
          </p>

          {unread && <span className="size-2.5 shrink-0 rounded-full bg-[#1BB3FF]" />}
        </div>
      </div>
    </button>
  )
}
