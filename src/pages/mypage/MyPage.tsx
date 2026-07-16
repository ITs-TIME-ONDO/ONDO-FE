import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageTransition from '../../components/PageTransition'
import PageHeader from '../../components/PageHeader'
import ConfirmModal from '../../components/ConfirmModal'
import profileChar from '../../assets/profile_char.svg'
import { DEFAULT_NICKNAME } from '../../constants/user'
import { getUserProfile, type UserProfile } from '../../api/user'
import { postLogout } from '../../api/auth'
import { clearTokens } from '../../utils/authStorage'

export default function MyPage() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  useEffect(() => {
    getUserProfile()
      .then(setProfile)
      .catch((error) => {
        console.error('프로필 조회 실패:', error)
      })
  }, [])

  const nickname =
    profile?.nickname ?? localStorage.getItem('nickname') ?? DEFAULT_NICKNAME
  const profileImage =
    profile?.profileImageUrl ?? localStorage.getItem('profileImage')
  const helpRequestCount = profile?.helpRequestCount ?? 0
  const helpCount = profile?.helpCount ?? 0

  const handleLogout = async () => {
    if (isLoggingOut) return

    try {
      setIsLoggingOut(true)
      await postLogout()
    } catch (error) {
      console.error('로그아웃 요청 실패:', error)
    } finally {
      clearTokens()
      localStorage.removeItem('onboardingCompleted')
      localStorage.removeItem('nickname')
      localStorage.removeItem('profileImage')
      navigate('/login', { replace: true })
    }
  }

  return (
    <PageTransition>
      <div className="relative h-[844px] w-[390px] overflow-hidden bg-white">
        {/* 주황 배경 */}
        <div className="absolute left-0 top-0 h-[388px] w-full bg-[#FF9E1B]/20" />

        {/* 헤더 */}
        <PageHeader title="마이페이지" />

        {/* 프로필 이미지 */}
        <div className="absolute left-1/2 -translate-x-1/2 top-[125px] size-[100px] rounded-full bg-[#FF9E1B] overflow-hidden">
          <img
            src={profileImage || profileChar}
            alt="프로필"
            className="size-full object-cover"
          />
        </div>

        {/* 닉네임 */}
        <p className="absolute left-1/2 -translate-x-1/2 top-[241px] whitespace-nowrap text-[18px] font-medium text-black">
          {nickname}
        </p>

        {/* 프로필 편집 버튼 */}
        <button
          type="button"
          onClick={() => navigate('/mypage/edit')}
          className="absolute left-1/2 -translate-x-1/2 top-[277px] flex items-center justify-center rounded-full bg-white px-[15px] py-[4px]"
        >
          <span className="text-[12px] font-medium text-[#343434] whitespace-nowrap">
            프로필 편집
          </span>
        </button>

        {/* 활동 통계 카드 */}
        <div
          className="absolute left-[27px] top-[342px] flex h-[108px] w-[339px] items-center justify-center gap-[58px] rounded-[10px] bg-white px-[50px] py-[20px]"
          style={{ boxShadow: '0px 2px 3px rgba(0,0,0,0.2)' }}
        >
          <div className="flex flex-col items-center gap-[8px]">
            <p className="text-[12px] font-medium text-black">도움 요청</p>
            <p className="text-[36px] font-bold leading-none text-[#FF9E1B]">
              {helpRequestCount}
            </p>
          </div>
          <div className="h-[50px] w-px bg-[#e0e0e0]" />
          <div className="flex flex-col items-center gap-[8px]">
            <p className="text-[12px] font-medium text-black">도움 응답</p>
            <p className="text-[36px] font-bold leading-none text-[#FF9E1B]">
              {helpCount}
            </p>
          </div>
        </div>

        {/* 로그아웃 / 회원탈퇴 */}
        <div className="absolute left-1/2 -translate-x-1/2 top-[487px] flex w-[338px] flex-col gap-[15px]">
          <button
            type="button"
            className="text-left text-[14px] text-black"
            onClick={() => setShowLogoutModal(true)}
          >
            로그아웃
          </button>
          <div className="h-px w-full bg-[#e0e0e0]" />
          <button
            type="button"
            className="text-left text-[14px] text-black"
            onClick={() => navigate('/mypage/withdraw')}
          >
            회원탈퇴
          </button>
        </div>
        {/* 로그아웃 확인 모달 */}
        <ConfirmModal
          open={showLogoutModal}
          title="로그아웃 하시겠습니까?"
          description="로그인 화면으로 이동합니다."
          confirmText={isLoggingOut ? '처리 중...' : '확인'}
          disabled={isLoggingOut}
          onConfirm={handleLogout}
          onCancel={() => {
            if (!isLoggingOut) setShowLogoutModal(false)
          }}
        />
      </div>
    </PageTransition>
  )
}
