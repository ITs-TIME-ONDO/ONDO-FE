import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import PageTransition from '../../components/PageTransition'
import BottomNav from '../../components/BottomNav'
import MyRequestCard from '../../components/MyRequestCard'
import NearbyRequestCard from '../../components/NearbyRequestCard'

import logo from '../../assets/logo.png'
import alertIcon from '../../assets/alert.png'
import profileBtn from '../../assets/top_small_profile_btn.png'
import cryingChar from '../../assets/crying_char.png'
import upFinger from '../../assets/up_finger.png'
import { apiFetch } from '../../api/client'

export default function HomePage() {
  const navigate = useNavigate()

  const [myRequest, setMyRequest] = useState<any>(null)
  const [nearbyCards, setNearbyCards] = useState<any[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showDeleteGuide, setShowDeleteGuide] = useState(false)

  const getCurrentPosition = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject)
    })
  }
  useEffect(() => {
    const fetchMyCard = async () => {
      if (localStorage.getItem('showDeleteGuide') === 'true') {
        setShowDeleteGuide(true)
        localStorage.removeItem('showDeleteGuide')
      }

      try {
        const res = await apiFetch<any>('/api/cards/my/active')

        const card = res.data ?? null

        console.log('내 활성 카드:', card)

        if (!card || !card.id) {
          setMyRequest(null)

          const position = await getCurrentPosition()

          const nearbyRes = await apiFetch<any>(
            `/api/cards/nearby?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}`
          )

          const nearbyData = nearbyRes.data ?? nearbyRes

          setNearbyCards(nearbyData?.cards ?? [])

          return
        }

        setMyRequest(card)
      } catch (e) {
        setMyRequest(null)
      }

      if (localStorage.getItem('showDeleteGuide') === 'true') {
        setShowDeleteGuide(true)
        localStorage.removeItem('showDeleteGuide')
      }
    }

    fetchMyCard()
  }, [])

  const handleDeleteRequest = async () => {
    const cardId = myRequest?.id

    if (!cardId) {
      console.error('카드 ID 없음:', myRequest)
      alert('카드 ID를 찾을 수 없습니다.')
      return
    }

    try {
      await apiFetch(`/api/cards/${cardId}/cancel`, {
        method: 'PATCH',
      })

      localStorage.removeItem('bumpCount')
      setMyRequest(null)
      setNearbyCards([])
      setCurrentIndex(0)
      setShowDeleteGuide(false)
    } catch (error) {
      console.error('카드 취소 실패:', error)
      alert('카드 취소에 실패했습니다.')
    }
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
          ) : nearbyCards.length > 0 ? (
            <NearbyRequestCard
              request={nearbyCards[currentIndex]}
              onSwipeLeft={() =>
                setCurrentIndex((i) => Math.min(i + 1, nearbyCards.length - 1))
              }
              onSwipeRight={() => setCurrentIndex((i) => Math.max(i - 1, 0))}
              onClick={() => navigate(`/cards/${nearbyCards[currentIndex].id}`)}
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
