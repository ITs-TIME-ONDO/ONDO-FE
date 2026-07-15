import { motion } from 'framer-motion'

import photo from '../assets/photo.png'
import miniProfileChar from '../assets/mini_profile_char.png'
import { formatElapsedTime } from '../utils/formatElapsedTime'

type NearbyRequest = {
  id: string
  requesterId: string
  requesterProfileImageUrl: string
  requesterNickname?: string
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

export default function NearbyRequestCard({
  request,
  onSwipeLeft,
  onSwipeRight,
  onHelp,
}: Props) {
  const categoryLabel = categoryLabelMap[request.category] ?? request.category
  const genderLabel =
    genderLabelMap[request.preferredGender] ?? request.preferredGender
  const requesterProfileImage =
    request.requesterProfileImageUrl?.trim() || miniProfileChar
  const requesterName = request.requesterNickname?.trim() || '요청자'

  return (
    <motion.section
      drag
      dragDirectionLock
      dragConstraints={{ left: -140, right: 140, top: -120, bottom: 0 }}
      dragElastic={0}
      dragSnapToOrigin
      onDragEnd={(_, info) => {
        if (info.offset.y <= -100) {
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
        {formatElapsedTime(request.updatedAt || request.createdAt)}
      </p>

      <div className="relative h-64 w-72 overflow-hidden rounded-2xl">
        <img
          src={photo}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-white/0" />

        <div className="absolute bottom-3 left-2 z-10 inline-flex items-center gap-2 rounded-full bg-black/30 pr-3">
          <div className="flex size-11 items-center justify-center rounded-full bg-gradient-to-b from-amber-500 to-white">
            <img
              className="size-11 rounded-full object-cover"
              src={requesterProfileImage}
              alt="프로필"
            />
          </div>

          <div className="text-sm font-medium text-white">{requesterName}</div>
        </div>

        <h2 className="absolute left-1/2 top-5 z-10 -translate-x-1/2 text-3xl font-extrabold text-white">
          {categoryLabel}
        </h2>
      </div>

      <div className="flex w-72 items-center justify-between">
        <div className="flex w-[136px] items-center gap-3 whitespace-nowrap">
          <span className="shrink-0 text-base font-normal text-[#555555]">성별</span>
          <span className="shrink-0 text-base font-semibold text-[#333333]">
            {genderLabel}
          </span>
        </div>

        <div className="ml-auto flex w-[120px] items-center justify-end gap-3 whitespace-nowrap">
          <span className="shrink-0 text-base font-normal text-[#555555]">나이</span>
          <span className="shrink-0 text-right text-base font-semibold text-[#333333]">
            {request.preferredAgeMin}살~{request.preferredAgeMax}살
          </span>
        </div>
      </div>

      <p className="h-11 w-72 overflow-hidden text-base font-semibold leading-5 text-[#333333] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
        {request.description}
      </p>

      <p className="text-xl font-semibold leading-5 text-amber-500">
        나와 {Math.round(request.distanceMeters)}m 떨어져 있음
      </p>
    </motion.section>
  )
}
