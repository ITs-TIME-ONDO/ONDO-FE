import { useEffect, useState } from 'react'
import { animate, motion, useMotionValue, useTransform } from 'framer-motion'
import miniProfileChar from '../assets/mini_profile_char.png'

type Props = {
  roomId: string
  nickname: string
  message: string
  time: string
  unread?: boolean
  profileImageUrl?: string
  onClick?: () => void
  onLeave?: () => void
  swipeOpen?: boolean
  onSwipeOpen?: () => void
  onSwipeClose?: () => void
  swipeEnabled?: boolean
}

export default function ChatRoomListItem({
  roomId,
  nickname,
  message,
  time,
  unread = false,
  profileImageUrl,
  onClick,
  onLeave,
  swipeOpen = false,
  onSwipeOpen,
  onSwipeClose,
  swipeEnabled = true,
}: Props) {
  const x = useMotionValue(0)
  const leaveButtonX = useTransform(x, [-76, 0], [0, 76])
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    const animation = animate(x, swipeOpen ? -76 : 0, {
      type: 'spring',
      stiffness: 320,
      damping: 30,
    })
    return () => animation.stop()
  }, [swipeOpen, x])

  return (
    <div
      data-chat-room-id={roomId}
      className="relative h-[85px] w-full overflow-hidden"
    >
      {swipeEnabled && (
        <motion.button
          type="button"
          onClick={onLeave}
          aria-hidden={!swipeOpen}
          tabIndex={swipeOpen ? 0 : -1}
          style={{ x: leaveButtonX }}
          className={`absolute inset-y-0 right-0 flex w-[76px] items-center justify-center bg-[#F06464] text-sm font-semibold text-white transition-opacity duration-100 ${
            swipeOpen || isDragging ? 'opacity-100' : 'pointer-events-none opacity-0'
          }`}
        >
          나가기
        </motion.button>
      )}

      <motion.button
        type="button"
        drag={swipeEnabled ? 'x' : false}
        dragConstraints={{ left: -76, right: 0 }}
        dragElastic={0.12}
        onDragStart={() => setIsDragging(true)}
        style={{ x }}
        aria-expanded={swipeOpen}
        onKeyDown={(event) => {
          if (!swipeEnabled) return
          if (event.key === 'ArrowLeft') {
            event.preventDefault()
            onSwipeOpen?.()
          } else if (event.key === 'ArrowRight' && swipeOpen) {
            event.preventDefault()
            onSwipeClose?.()
          }
        }}
        onDragEnd={(_, info) => {
          setIsDragging(false)
          const shouldOpen = info.offset.x <= -42 || info.velocity.x <= -450

          void animate(x, shouldOpen ? -76 : 0, {
            type: 'spring',
            stiffness: 320,
            damping: 30,
          })

          if (shouldOpen) {
            onSwipeOpen?.()
          } else {
            onSwipeClose?.()
          }
        }}
        onClick={() => {
          if (swipeOpen) {
            onSwipeClose?.()
            return
          }
          onClick?.()
        }}
        className="relative flex h-[85px] w-full items-center gap-3 bg-white px-6 text-left after:absolute after:bottom-0 after:left-6 after:right-6 after:h-px after:bg-[#EDEDED]"
      >
      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#FFF4E8]">
        <img
          src={profileImageUrl || miniProfileChar}
          alt={nickname}
          className="size-10 rounded-full object-cover"
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-start">
        <div className="flex h-6 flex-nowrap items-start justify-between gap-2">
          <p className="min-w-0 flex-1 truncate text-base font-medium leading-6 text-black">
            {nickname}
          </p>
          <span className="shrink-0 pt-0.5 text-[11px] font-light leading-4 text-[#666]">
            {time}
          </span>
        </div>

        <div className="mt-1.5 flex flex-nowrap items-center justify-between gap-2">
          <p
            className={`min-w-0 flex-1 truncate whitespace-nowrap text-[13px] leading-4 ${
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
      </motion.button>
    </div>
  )
}
