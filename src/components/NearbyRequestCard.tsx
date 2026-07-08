import { motion } from 'framer-motion'

import photo from '../assets/photo.png'
import miniProfileChar from '../assets/mini_profile_char.png'

type NearbyRequest = {
  id: string
  requesterId: string
  requesterProfileImageUrl: string
  category: string
  description: string
  expiresAt: string
  status: string
  preferredGender: string
  preferredAgeMin: number
  preferredAgeMax: number
  retryCount: number
  createdAt: string
  updatedAt: string
  distanceMeters: number
}

type Props = {
  request: NearbyRequest
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onHelp?: () => void
}

const categoryLabelMap: Record<string, string> = {
  PHOTO: '사진찍기',
  MEAL: '합석',
  OTHER: '기타',
}

const genderLabelMap: Record<string, string> = {
  MALE: '남성',
  FEMALE: '여성',
  ANY: '상관없음',
}

const formatElapsedTime = (createdAt: string): string => {
  const createdTime = new Date(createdAt).getTime()

  if (Number.isNaN(createdTime)) {
    return '방금 전'
  }

  const diffMinutes = Math.max(
    0,
    Math.floor((Date.now() - createdTime) / 1000 / 60)
  )

  if (diffMinutes < 1) {
    return '방금 전'
  }

  if (diffMinutes < 60) {
    return `${diffMinutes}분 전`
  }

  const diffHours = Math.floor(diffMinutes / 60)

  if (diffHours < 24) {
    return `${diffHours}시간 전`
  }

  const diffDays = Math.floor(diffHours / 24)

  return `${diffDays}일 전`
}

export default function NearbyRequestCard({
  request,
  onSwipeLeft,
  onSwipeRight,
  onHelp,
}: Props) {
  const categoryLabel = categoryLabelMap[request.category] ?? request.category
  const genderLabel =
    genderLabelMap[request.preferredGender] ?? request.preferredGender

  return (
    <motion.section
      drag
      dragConstraints={{ left: 0, right: 0, top: -120, bottom: 0 }}
      dragElastic={0.25}
      onDragEnd={(_, info) => {
        if (info.offset.y < -120) {
          onHelp?.()
          return
        }

        if (info.offset.x < -100) {
          onSwipeLeft?.()
        }

        if (info.offset.x > 100) {
          onSwipeRight?.()
        }
      }}
      className="flex h-[508px] w-80 cursor-pointer flex-col items-center justify-between rounded-[20px] bg-white pb-7 pt-5 shadow-[0_4px_4px_rgba(0,0,0,0.25),0_0_4px_rgba(255,158,27,1)]"
    >
      <p className="h-5 text-sm font-normal text-[#555555]">
        {formatElapsedTime(request.createdAt)}
      </p>

      <div className="relative flex h-64 w-72 flex-col items-start justify-start overflow-hidden rounded-2xl px-2 py-3">
        <img
          src={photo}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-white/0" />

        <div className="relative z-10 inline-flex items-center gap-2 rounded-full bg-black/30 pr-3">
          <div className="flex size-11 items-center justify-center rounded-full bg-gradient-to-b from-amber-500 to-white">
            <img
              className="size-11 rounded-full object-cover"
              src={miniProfileChar}
              alt="프로필"
            />
          </div>

          <div className="text-sm font-medium text-white">당당한 당근</div>
        </div>

        <h2 className="absolute left-1/2 top-5 z-10 -translate-x-1/2 text-3xl font-extrabold text-white">
          {categoryLabel}
        </h2>
      </div>

      <div className="flex w-72 items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-base font-normal text-[#555555]">성별</span>
          <span className="text-base font-semibold text-[#333333]">
            {genderLabel}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-base font-normal text-[#555555]">나이</span>
          <span className="text-right text-base font-semibold text-[#333333]">
            {request.preferredAgeMin}살~{request.preferredAgeMax}살
          </span>
        </div>
      </div>

      <p className="h-11 w-72 text-base font-semibold leading-5 text-[#333333]">
        {request.description}
      </p>

      <p className="text-xl font-semibold leading-5 text-amber-500">
        나와 {Math.round(request.distanceMeters)}m 떨어져 있음
      </p>
    </motion.section>
  )
}
