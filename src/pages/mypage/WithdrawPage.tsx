import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageTransition from '../../components/PageTransition'
import PageHeader from '../../components/PageHeader'
import checkBox from '../../assets/check_box.svg'
import { DEFAULT_NICKNAME } from '../../constants/user'
import { deleteUser } from '../../api/user'

const ITEMS = [
  '모든 매칭 내용과 채팅 기록은 즉시 삭제됩니다.',
  '프로필 정보 및 획득한 뱃지 등이 모두 초기화 됩니다.',
  '이 작업은 복구가 불가능합니다.',
]

export default function WithdrawPage() {
  const navigate = useNavigate()
  const nickname = localStorage.getItem('nickname') ?? DEFAULT_NICKNAME
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleWithdraw = async () => {
    if (isSubmitting) return

    try {
      setIsSubmitting(true)
      await deleteUser()
      localStorage.clear()
      navigate('/login', { replace: true })
    } catch (error) {
      console.error('회원 탈퇴 실패:', error)
      alert('회원 탈퇴에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <PageTransition>
      <div className="relative h-[844px] w-[390px] overflow-hidden bg-white">
        <PageHeader title="회원 탈퇴" fallbackPath="/mypage" />

        <div className="absolute left-[24px] top-[145px]">
          <p className="text-[16px] font-semibold leading-[21px] text-black">
            {nickname}님 , 탈퇴하기 전에 확인해주세요!
          </p>
          <p className="text-[16px] font-semibold leading-[21px] text-black">
            계정을 삭제하면,
          </p>
        </div>

        {ITEMS.map((text, i) => (
          <div
            key={i}
            className="absolute left-[24px] flex items-center gap-[9.5px]"
            style={{ top: `${343 + i * 41}px` }}
          >
            <img src={checkBox} alt="" className="size-[18px] shrink-0" />
            <p className="text-[14px] tracking-[-0.3px] text-[#343434]">
              {text}
            </p>
          </div>
        ))}

        <button
          type="button"
          className="absolute left-[24px] top-[720px] flex h-[60px] w-[342px] items-center justify-center rounded-full bg-[red] text-[20px] font-bold text-white disabled:opacity-50"
          onClick={handleWithdraw}
          disabled={isSubmitting}
        >
          {isSubmitting ? '탈퇴 처리 중...' : '탈퇴하기'}
        </button>
      </div>
    </PageTransition>
  )
}
