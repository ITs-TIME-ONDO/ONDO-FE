import { useState } from 'react'
import { motion } from 'framer-motion'

import photo from '../assets/photo.png'

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
  onDragStart: () => void
  onDragEnd: () => void
}

export default function MyRequestCard({
  request,
  onDelete,
  onDragStart,
  onDragEnd,
}: Props) {
  const [bumpCount, setBumpCount] = useState(
    Number(localStorage.getItem('bumpCount') ?? 0)
  )

  const handleBump = () => {
    if (bumpCount >= 3) return

    const next = bumpCount + 1

    setBumpCount(next)
    localStorage.setItem('bumpCount', String(next))

    alert('요청이 다시 전송되었습니다.')
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

  const categoryLabel = categoryLabelMap[request.category] ?? request.category

  const genderLabel =
    genderLabelMap[request.preferredGender] ?? request.preferredGender

  return (
    <motion.section
      drag="y"
      dragConstraints={{ top: -180, bottom: 0 }}
      dragElastic={0.15}
      onDragStart={onDragStart}
      onDragEnd={(_, info) => {
        onDragEnd()

        if (info.offset.y < -120) {
          onDelete()
        }
      }}
      className="flex h-[508px] w-[342px] flex-col rounded-[20px] border border-[#FFC878] bg-white px-[26px] py-5 shadow-[0_0_4px_rgba(255,158,27,1),0_4px_4px_rgba(0,0,0,0.15)]"
    >
      <p className="text-center text-sm text-[#666666]">30분 전</p>

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

      <div className="mt-6 flex items-center">
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

      <p className="mt-6 text-base font-semibold leading-6 text-[#333333]">
        {request.description}
      </p>

      <button
        type="button"
        disabled={bumpCount >= 3}
        onClick={handleBump}
        className={`mt-auto h-12 w-full rounded-full text-lg font-semibold transition ${
          bumpCount >= 3
            ? 'cursor-not-allowed bg-[#D9D9D9] text-[#8C8C8C]'
            : 'bg-black text-white'
        }`}
      >
        다시 요청하기 ({bumpCount}/3회)
      </button>
    </motion.section>
  )
}
