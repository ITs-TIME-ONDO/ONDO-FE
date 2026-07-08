import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageTransition from '../../components/PageTransition'
import PageHeader from '../../components/PageHeader'
import profileChar from '../../assets/profile_char.svg'
import { DEFAULT_NICKNAME } from '../../constants/user'
import { clearTokens } from '../../utils/authStorage'

export default function MyPage() {
  const navigate = useNavigate()
  const nickname = localStorage.getItem('nickname') ?? DEFAULT_NICKNAME
  const profileImage = localStorage.getItem('profileImage')
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem('onboardingCompleted')
    localStorage.removeItem('nickname')
    localStorage.removeItem('profileImage')
    localStorage.removeItem('myRequest')
    localStorage.removeItem('showDeleteGuide')
    localStorage.removeItem('nearbyRequestGuideSeen')
    clearTokens()
    navigate('/login', { replace: true })
  }

  return (
    <PageTransition>
      <div className="relative h-[844px] w-[390px] overflow-hidden bg-white">
        {/* 주황 배경 */}
        <div className="absolute left-0 top-[89px] h-[299px] w-full bg-[#FF9E1B]/30" />

        {/* 헤더 */}
        <PageHeader title="마이페이지" />

        {/* 프로필 이미지 */}
        <div className="absolute left-1/2 -translate-x-1/2 top-[125px] size-[100px] rounded-full bg-[#FF9E1B] overflow-hidden">
          <img
            src={profileImage ?? profileChar}
            alt="프로필"
            className="size-full object-cover"
          />
        </div>

        {/* 닉네임 */}
        <p className="absolute left-1/2 -translate-x-1/2 top-[241px] whitespace-nowrap text-[18px] font-medium text-black">
          {nickname}
        </p>

        {/* 지역 */}
        <p className="absolute left-1/2 -translate-x-1/2 top-[274px] whitespace-nowrap text-[14px] text-[#666] tracking-[-0.3px]">
          서울 광진구 냥냥동
        </p>

        {/* 프로필 편집 버튼 */}
        <button
          type="button"
          onClick={() => navigate('/mypage/edit')}
          className="absolute left-1/2 -translate-x-1/2 top-[303px] flex items-center justify-center rounded-full bg-white px-[15px] py-[4px]"
        >
          <span className="text-[12px] font-medium text-[#343434] whitespace-nowrap">
            프로필 편집
          </span>
        </button>

        {/* 활동 통계 카드 */}
        <div
          className="absolute left-[27px] top-[342px] flex h-[90px] w-[339px] items-center justify-center gap-[58px] rounded-[10px] bg-white px-[50px] py-[20px]"
          style={{ boxShadow: '0px 2px 3px rgba(0,0,0,0.2)' }}
        >
          <div className="flex flex-col items-center gap-[8px]">
            <p className="text-[12px] font-medium text-black">도움 요청</p>
            <p className="text-[36px] font-bold leading-none text-black">10</p>
          </div>
          <div className="h-[50px] w-px bg-[#e0e0e0]" />
          <div className="flex flex-col items-center gap-[8px]">
            <p className="text-[12px] font-medium text-black">도움 응답</p>
            <p className="text-[36px] font-bold leading-none text-black">20</p>
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
        {showLogoutModal && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40">
            <div
              className="flex flex-col items-center gap-[20px] rounded-[20px] bg-white px-[28px] pb-[24px] pt-[32px]"
              style={{ boxShadow: '0px 0px 2.8px rgba(0,0,0,0.25)' }}
            >
              <div className="text-center">
                <p className="text-[20px] font-semibold leading-[1.7] text-black">
                  로그아웃 하시겠습니까?
                </p>
                <p className="text-[14px] leading-[1.7] text-[#666]">
                  로그인 화면으로 이동합니다
                </p>
              </div>
              <div className="flex gap-[8px]">
                <button
                  type="button"
                  className="flex h-[44px] w-[108px] items-center justify-center rounded-full bg-[#f3f3f3] text-[16px] font-semibold text-[#666]"
                  onClick={() => setShowLogoutModal(false)}
                >
                  취소
                </button>
                <button
                  type="button"
                  className="flex h-[44px] w-[107px] items-center justify-center rounded-full bg-[#ff9e1b] text-[16px] font-semibold text-white"
                  onClick={handleLogout}
                >
                  확인
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  )
}
