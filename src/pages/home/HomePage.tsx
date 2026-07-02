import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import PageTransition from '../../components/PageTransition'
import BottomNav from '../../components/BottomNav'
import MyRequestCard from '../../components/MyRequestCard'

import logo from '../../assets/logo.png'
import alertIcon from '../../assets/alert.png'
import profileBtn from '../../assets/top_small_profile_btn.png'
import cryingChar from '../../assets/crying_char.png'
import upFinger from '../../assets/up_finger.png'

export default function HomePage() {
  const navigate = useNavigate()

  const [myRequest, setMyRequest] = useState<any>(null)
  const [showDeleteGuide, setShowDeleteGuide] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('myRequest')

    if (saved) {
      try {
        setMyRequest(JSON.parse(saved))
      } catch {
        localStorage.removeItem('myRequest')
        setMyRequest(null)
      }
    }

    // 요청 생성 직후 삭제 가이드 표시
    if (localStorage.getItem('showDeleteGuide') === 'true') {
      setShowDeleteGuide(true)
      localStorage.removeItem('showDeleteGuide')
    }
  }, [])

  const handleDeleteRequest = () => {
    localStorage.removeItem('myRequest')
    localStorage.removeItem('bumpCount')

    setMyRequest(null)
    setShowDeleteGuide(false)
  }

  return (
    <PageTransition>
      <div className="relative mx-auto h-[844px] w-[390px] overflow-hidden bg-gradient-to-b from-white via-[#FFF4E8] to-[#FFC679]">
        <header className="absolute left-0 top-[50px] flex w-full items-center justify-between px-6">
          <img src={logo} alt="ONDO" className="h-6 w-[97px] object-contain" />

          <div className="flex items-center gap-3">
            <img src={alertIcon} alt="알림" className="h-6 w-5" />

            <button type="button" onClick={() => navigate('/mypage')}>
              <img src={profileBtn} alt="프로필" className="h-6 w-6" />
            </button>
          </div>
        </header>

        <main className="absolute left-0 top-[171px] flex w-full flex-col items-center">
          {myRequest ? (
            <MyRequestCard
              request={myRequest}
              onDelete={handleDeleteRequest}
              onDragStart={() => {}}
              onDragEnd={() => {}}
            />
          ) : (
            <div className="mt-[96px] flex flex-col items-center">
              <img
                src={cryingChar}
                alt="울고 있는 캐릭터"
                className="h-auto w-[200px] object-contain"
              />

              <p className="mt-5 text-sm text-[#666666]">아직 요청이 없어요</p>
            </div>
          )}
        </main>

        <BottomNav />

        {/* 삭제 가이드 */}
        {showDeleteGuide && (
          <div
            onClick={() => setShowDeleteGuide(false)}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/50"
          >
            <div className="flex flex-col items-center">
              <p className="mb-4 text-base font-medium text-white">
                올려서 삭제하기
              </p>

              <img
                src={upFinger}
                alt="올려서 삭제"
                className="h-12 w-12 animate-bounce"
              />
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  )
}
