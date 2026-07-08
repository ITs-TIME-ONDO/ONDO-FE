import { motion } from 'framer-motion'

import photo from '../assets/photo.png'

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
  PHOTO: '사진 찍기',
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
    return '\uBC29\uAE08 \uC804'
  }

  const diffMinutes = Math.max(
    0,
    Math.floor((Date.now() - createdTime) / 1000 / 60)
  )

  if (diffMinutes < 1) {
    return '\uBC29\uAE08 \uC804'
  }

  if (diffMinutes < 60) {
    return `${diffMinutes}\uBD84 \uC804`
  }

  const diffHours = Math.floor(diffMinutes / 60)

  if (diffHours < 24) {
    return `${diffHours}\uC2DC\uAC04 \uC804`
  }

  const diffDays = Math.floor(diffHours / 24)

  return `${diffDays}\uC77C \uC804`
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
      className="flex h-[508px] w-[342px] cursor-pointer flex-col items-center rounded-[20px] border border-[#FFC878] bg-white px-[26px] py-5 shadow-[0_0_4px_rgba(255,158,27,1),0_4px_4px_rgba(0,0,0,0.15)]"
    >
      <p className="text-center text-sm text-[#666666]">
        {formatElapsedTime(request.createdAt)}
      </p>
      <div className="mt-4 flex justify-center">
        <div className="relative h-[250px] w-[290px] overflow-hidden rounded-2xl">
          <img src={photo} alt="" className="h-full w-full object-cover" />

          <div className="absolute inset-0 bg-black/50" />

          <div className="absolute inset-0 flex items-center justify-center">
            <h2 className="text-[24px] font-extrabold text-white">
              {categoryLabel}
            </h2>
          </div>
        </div>
      </div>

      <div className="mt-6 flex w-full items-center">
        <div className="flex items-center gap-8">
          <span className="text-[#666666]">성별</span>

          <span className="font-semibold text-[#333333]">{genderLabel}</span>
        </div>

        <div className="w-[54px]" />

        <div className="flex items-center gap-8">
          <span className="text-[#666666]">나이</span>

          <span className="font-semibold text-[#333333]">
            {request.preferredAgeMin}살~{request.preferredAgeMax}살
          </span>
        </div>
      </div>

      <p className="mt-6 w-full text-base font-semibold leading-6 text-[#333333]">
        {request.description}
      </p>

      <div className="mt-auto flex h-12 w-full items-center justify-center rounded-full">
        <p className="text-lg font-semibold leading-5 text-[#FF9814]">
          나와 {Math.round(request.distanceMeters)}m 떨어져 있음
        </p>
      </div>
    </motion.section>
  )
}
