import { useEffect, useState } from 'react'

import arrowIcon from '../../assets/chat_report_arrow.svg'
import { createChatRoomReport, type ReportReason } from '../../api/reports'
import { ApiError } from '../../api/client'

const REASON_CODE_MAP: Record<string, ReportReason> = {
  '욕설/인신공격': 'HARASSMENT',
  '음란성/선정성': 'OBSCENE_CONTENT',
  '개인정보 노출': 'PRIVACY_VIOLATION',
}
const REPORT_REASONS = Object.keys(REASON_CODE_MAP)

type Props = {
  open: boolean
  onClose: () => void
  roomId: string | undefined
  onSuccess: () => void
}

export default function ReportModal({
  open,
  onClose,
  roomId,
  onSuccess,
}: Props) {
  const [reason, setReason] = useState<string | null>(null)
  const [description, setDescription] = useState('')
  const [isReasonOpen, setIsReasonOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      setReason(null)
      setDescription('')
      setIsReasonOpen(false)
      setSubmitting(false)
    }
  }, [open])

  if (!open) return null

  const isValid = Boolean(reason) && description.trim().length > 0

  const handleSubmit = () => {
    if (!isValid || !reason || !roomId || submitting) return

    setSubmitting(true)
    createChatRoomReport(roomId, {
      reason: REASON_CODE_MAP[reason],
      description: description.trim(),
    })
      .then(() => {
        onSuccess()
        onClose()
      })
      .catch((error) => {
        if (error instanceof ApiError && error.status === 409) {
          alert('이미 신고한 사용자입니다.')
        } else {
          alert('신고 접수에 실패했습니다. 다시 시도해주세요.')
        }
      })
      .finally(() => setSubmitting(false))
  }

  return (
    <>
      <div
        className="absolute inset-0 z-40 bg-white/20 backdrop-blur-[3px]"
        onClick={onClose}
      />

      <div
        className="absolute left-1/2 top-1/2 z-50 flex w-[342px] -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-5 rounded-[20px] bg-white/90 px-7 pb-6 pt-8"
        style={{ boxShadow: '0px 0px 5.6px rgba(0,0,0,0.2)' }}
      >
        <p className="text-[18px] font-semibold leading-[1.7] text-black">
          신고하기
        </p>

        <div className="relative w-full">
          <button
            type="button"
            onClick={() => setIsReasonOpen((prev) => !prev)}
            className={
              'flex h-[50px] w-full items-center justify-between border border-[#C6C6C6] px-5 ' +
              (isReasonOpen ? 'rounded-t-[20px]' : 'rounded-full')
            }
          >
            <span
              className={
                'text-base ' + (reason ? 'text-[#343434]' : 'text-[#929292]')
              }
            >
              {reason ?? '사유 선택'}
            </span>
            <img src={arrowIcon} alt="" className="h-2 w-4" />
          </button>

          {isReasonOpen && (
            <div className="absolute left-0 top-[50px] z-10 w-full">
              {REPORT_REASONS.map((option, index) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    setReason(option)
                    setIsReasonOpen(false)
                  }}
                  className={
                    'flex h-[50px] w-full items-center border border-t-0 border-[#C6C6C6] bg-white/95 px-5 text-left text-base text-[#343434] ' +
                    (index === REPORT_REASONS.length - 1
                      ? 'rounded-b-[20px]'
                      : '')
                  }
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="w-full">
          <p className="text-base font-medium text-black">상세 설명</p>

          <div className="relative mt-[10px] h-[120px] w-full rounded-[20px] bg-[#F3F3F3]">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, 100))}
              maxLength={100}
              className="size-full resize-none bg-transparent px-5 pb-6 pt-[13px] text-sm text-[#343434] focus:outline-none"
            />
            <span className="pointer-events-none absolute bottom-[13px] right-5 text-sm text-[#929292]">
              {description.length}/100
            </span>
          </div>
        </div>

        <button
          type="button"
          disabled={!isValid || !roomId || submitting}
          onClick={handleSubmit}
          className={
            'flex h-[50px] w-[286px] items-center justify-center rounded-full text-lg font-semibold text-white ' +
            (isValid && roomId && !submitting
              ? 'bg-[#FF9E1B]'
              : 'bg-[#FF9E1B]/50')
          }
        >
          {submitting ? '접수 중...' : '신고하기'}
        </button>
      </div>
    </>
  )
}
