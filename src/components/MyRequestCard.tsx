import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

import photo from '../assets/photo.png'
import meal from '../assets/합석.png'
import other from '../assets/기타.png'
import { apiFetch } from '../api/client'
import { formatElapsedTime } from '../utils/formatElapsedTime'

type MyRequest = {
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
  request: MyRequest
  onDelete: () => void
  onRetry: () => void | Promise<void>
  onDragStart: () => void
  onDragEnd: () => void
}

export default function MyRequestCard({
  request,
  onDelete,
  onRetry,
  onDragStart,
  onDragEnd,
}: Props) {
  const [bumpCount, setBumpCount] = useState(request.retryCount ?? 0)
  const [isBumping, setIsBumping] = useState(false)
  const [lastRetriedAt, setLastRetriedAt] = useState<string | null>(null)
  const isOpen = request.status === 'OPEN'

  useEffect(() => {
    setBumpCount(request.retryCount ?? 0)
  }, [request.retryCount])

  useEffect(() => {
    setLastRetriedAt(null)
  }, [request.id])

  const handleBump = async () => {
    if (!isOpen || isBumping || bumpCount >= 3) return

    setIsBumping(true)

    try {
      await apiFetch(`/api/cards/${request.id}/retry`, {
        method: 'PATCH',
      })

      setBumpCount((prev) => prev + 1)
      setLastRetriedAt(new Date().toISOString())

      await onRetry()
    } catch (error) {
      console.error('재요청 실패:', error)

      const status =
        typeof error === 'object' && error !== null && 'status' in error
          ? (error as { status?: number }).status
          : undefined

      if (status === 404 || status === 409) {
        await onRetry()
      }
    } finally {
      setIsBumping(false)
    }
  }

  const categoryLabelMap: Record<string, string> = {
    PHOTO: '사진찍기',
    MEAL: '합석',
    OTHER: '기타',
  }

  const categoryImageMap: Record<string, string> = {
    PHOTO: photo,
    MEAL: meal,
    OTHER: other,
  }

  const genderLabelMap: Record<string, string> = {
    MALE: '남성',
    FEMALE: '여성',
    ANY: '상관없음',
  }

  const categoryLabel = categoryLabelMap[request.category] ?? request.category
  const categoryImage = categoryImageMap[request.category] ?? photo

  const genderLabel =
    genderLabelMap[request.preferredGender] ?? request.preferredGender
  const elapsedTime = formatElapsedTime(
    lastRetriedAt || request.updatedAt || request.createdAt
  )

  return (
    <motion.section
      drag={isOpen ? 'y' : false}
      dragConstraints={{ top: -100, bottom: 0 }}
      dragElastic={0.15}
      onDragStart={onDragStart}
      onDragEnd={(_, info) => {
        onDragEnd()

        if (isOpen && info.offset.y < -120) {
          onDelete()
        }
      }}
      className="flex h-[508px] w-[342px] flex-col rounded-[20px] border border-[#FFC878] bg-white px-[26px] py-5 shadow-[0_0_4px_rgba(255,158,27,1),0_4px_4px_rgba(0,0,0,0.15)]"
    >
      <p className="text-center text-sm text-[#666666]">{elapsedTime}</p>

      <div className="mt-4 flex justify-center">
        <div className="relative h-[250px] w-[290px] overflow-hidden rounded-2xl">
          <img
            src={categoryImage}
            alt=""
            className="h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-black/50" />

          <div className="absolute inset-0 flex items-center justify-center">
            <h2 className="text-[24px] font-extrabold text-white">
              {categoryLabel}
            </h2>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <div className="flex w-[136px] items-center gap-3 whitespace-nowrap">
          <span className="shrink-0 text-[#666666]">성별</span>

          <span className="shrink-0 font-semibold text-[#333333]">{genderLabel}</span>
        </div>

        <div className="ml-auto flex w-[120px] items-center justify-end gap-3 whitespace-nowrap">
          <span className="shrink-0 text-[#666666]">나이</span>

          <span className="shrink-0 font-semibold text-[#333333]">
            {request.preferredAgeMin}살~{request.preferredAgeMax}살
          </span>
        </div>
      </div>

      <p className="mt-6 h-12 overflow-hidden text-base font-semibold leading-6 text-[#333333] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
        {request.description}
      </p>

      <button
        type="button"
        disabled={!isOpen || isBumping || bumpCount >= 3}
        onClick={handleBump}
        className={`mt-auto h-12 w-full rounded-full text-lg font-semibold transition ${
          !isOpen || isBumping || bumpCount >= 3
            ? 'cursor-not-allowed bg-[#D9D9D9] text-[#8C8C8C]'
            : 'bg-black text-white'
        }`}
      >
        {isOpen ? `다시 요청하기 (${bumpCount}/3회)` : '매칭 진행 중'}
      </button>
    </motion.section>
  )
}
