import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import PageTransition from '../../components/PageTransition'
import BottomNav from '../../components/BottomNav'
import MyRequestCard from '../../components/MyRequestCard'
import NearbyRequestCard from '../../components/NearbyRequestCard'
import ConfirmModal from '../../components/ConfirmModal'

import logo from '../../assets/logo.png'
import alertIcon from '../../assets/alert.png'
import profileBtn from '../../assets/top_small_profile_btn.png'
import cryingChar from '../../assets/crying_char.png'
import upFinger from '../../assets/up_finger.png'
import { apiFetch } from '../../api/client'

const getHomeErrorMessage = (error: unknown): string => {
  const code =
    typeof error === 'object' && error !== null && 'code' in error
      ? (error as { code?: number }).code
      : undefined

  if (code === 1) {
    return '\uC704\uCE58 \uAD8C\uD55C\uC774 \uD544\uC694\uD569\uB2C8\uB2E4.'
  }

  if (code === 2 || code === 3) {
    return '\uD604\uC7AC \uC704\uCE58\uB97C \uD655\uC778\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4. \uB2E4\uC2DC \uC2DC\uB3C4\uD574\uC8FC\uC138\uC694.'
  }

  return '\uC8FC\uBCC0 \uC694\uCCAD\uC744 \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4. \uB2E4\uC2DC \uC2DC\uB3C4\uD574\uC8FC\uC138\uC694.'
}

const MY_REQUEST_STORAGE_KEY = 'myRequest'

const getStoredMyRequest = (): any | null => {
  const saved = localStorage.getItem(MY_REQUEST_STORAGE_KEY)
  const accessToken = localStorage.getItem('accessToken')

  if (!saved || !accessToken) return null

  try {
    const parsed = JSON.parse(saved)
    const card = parsed.card ?? parsed
    const savedAccessToken = parsed.accessToken
    const expiresAt = card?.expiresAt ? new Date(card.expiresAt).getTime() : NaN

    if (!card?.id || Number.isNaN(expiresAt) || expiresAt <= Date.now()) {
      localStorage.removeItem(MY_REQUEST_STORAGE_KEY)
      return null
    }

    if (savedAccessToken && savedAccessToken !== accessToken) {
      localStorage.removeItem(MY_REQUEST_STORAGE_KEY)
      return null
    }

    return card
  } catch {
    localStorage.removeItem(MY_REQUEST_STORAGE_KEY)
    return null
  }
}

const saveStoredMyRequest = (card: any) => {
  const accessToken = localStorage.getItem('accessToken')

  if (!card?.id || !accessToken) return

  localStorage.setItem(
    MY_REQUEST_STORAGE_KEY,
    JSON.stringify({ accessToken, card })
  )
}

export default function HomePage() {
  const navigate = useNavigate()

  const [myRequest, setMyRequest] = useState<any>(null)
  const [nearbyCards, setNearbyCards] = useState<any[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showDeleteGuide, setShowDeleteGuide] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showHelpModal, setShowHelpModal] = useState(false)
  const [homeErrorMessage, setHomeErrorMessage] = useState<string | null>(null)
  const isFetchingRef = useRef(false)

  const getCurrentPosition = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      })
    })
  }
  const fetchHomeData = useCallback(async () => {
    if (isFetchingRef.current) return

    isFetchingRef.current = true
    const shouldShowDeleteGuide =
      localStorage.getItem('showDeleteGuide') === 'true'

    if (shouldShowDeleteGuide) {
      setShowDeleteGuide(true)
      localStorage.removeItem('showDeleteGuide')
    }

    try {
      const res = await apiFetch<any>('/api/cards/my/active')
      const card = res.data ?? null

      if (!card || !card.id) {
        const savedMyRequest = getStoredMyRequest()

        if (savedMyRequest) {
          setMyRequest(savedMyRequest)
          setNearbyCards([])
          setHomeErrorMessage(null)
          return
        }

        setMyRequest(null)

        try {
          const position = await getCurrentPosition()

          const nearbyRes = await apiFetch<any>(
            `/api/cards/nearby?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}`
          )

          const nearbyData = nearbyRes.data ?? nearbyRes

          setNearbyCards(nearbyData?.cards ?? [])
          setCurrentIndex(0)
          setHomeErrorMessage(null)
        } catch (error) {
          console.error('주변 요청 조회 실패:', error)
          setNearbyCards([])
          setHomeErrorMessage(getHomeErrorMessage(error))
        }

        return
      }

      saveStoredMyRequest(card)
      setMyRequest(card)
      setNearbyCards([])
      setHomeErrorMessage(null)
    } catch (e) {
      console.error('홈 데이터 조회 실패:', e)
      setMyRequest(null)
      setNearbyCards([])
      setHomeErrorMessage(
        '\uD648 \uB370\uC774\uD130\uB97C \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4. \uB2E4\uC2DC \uC2DC\uB3C4\uD574\uC8FC\uC138\uC694.'
      )
    } finally {
      isFetchingRef.current = false
    }
  }, [])

  useEffect(() => {
    fetchHomeData()
    const intervalId = window.setInterval(fetchHomeData, 10000)

    return () => window.clearInterval(intervalId)
  }, [fetchHomeData])

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

      setShowDeleteGuide(false)
      setShowDeleteModal(false)
      localStorage.removeItem(MY_REQUEST_STORAGE_KEY)

      await fetchHomeData()
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
              onDelete={() => setShowDeleteModal(true)}
              onRetry={fetchHomeData}
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
              onHelp={() => setShowHelpModal(true)}
            />
          ) : homeErrorMessage ? (
            <div className="mt-[96px] flex flex-col items-center px-6 text-center">
              <img
                src={cryingChar}
                alt="울고 있는 캐릭터"
                className="h-auto w-[200px] object-contain"
              />

              <p className="mt-5 text-sm leading-5 text-[#666666]">
                {homeErrorMessage}
              </p>

              <button
                type="button"
                onClick={fetchHomeData}
                className="mt-5 h-10 rounded-full bg-[#FF9814] px-5 text-sm font-semibold text-white"
              >
                {'\uB2E4\uC2DC \uC2DC\uB3C4'}
              </button>
            </div>
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

        <BottomNav disableRequestButton={Boolean(myRequest)} />

        <ConfirmModal
          open={showDeleteModal}
          title="요청을 삭제하시겠습니까?"
          confirmText="삭제"
          cancelText="취소"
          onConfirm={handleDeleteRequest}
          onCancel={() => setShowDeleteModal(false)}
        />

        <ConfirmModal
          open={showHelpModal}
          title="도와주시겠습니까?"
          confirmText="도와주기"
          cancelText="취소"
          onConfirm={() => {
            setShowHelpModal(false)
            navigate(`/cards/${nearbyCards[currentIndex].id}`)
          }}
          onCancel={() => setShowHelpModal(false)}
        />
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
