// 홈화면 제외한 페이지들 헤더, 이전 버튼(<) 있는 헤더
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'

interface MyPageHeaderProps {
  title: string
  fallbackPath?: string
  onBack?: () => void
  rightAction?: ReactNode
}

export default function MyPageHeader({
  title,
  fallbackPath,
  onBack,
  rightAction,
}: MyPageHeaderProps) {
  const navigate = useNavigate()

  const handleBack = onBack ?? (() => {
    if (window.history.state?.idx > 0) {
      navigate(-1)
    } else {
      navigate(fallbackPath ?? '/', { replace: true })
    }
  })

  return (
    <div className="absolute left-0 top-0 flex w-full items-center justify-center h-[89px]">
      <button
        type="button"
        onClick={handleBack}
        className="absolute left-6 flex items-center justify-center"
      >
        <svg width="10" height="16" viewBox="0 0 10 16" fill="none">
          <path
            d="M9 1L1 8L9 15"
            stroke="black"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <p className="text-[20px] font-medium text-black">{title}</p>

      {rightAction && (
        <div className="absolute right-6 flex items-center justify-center">
          {rightAction}
        </div>
      )}
    </div>
  )
}
