import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import PageTransition from '../../components/PageTransition'
import BottomNav from '../../components/BottomNav'
import MyRequestCard from '../../components/MyRequestCard'
import NearbyRequestCard from '../../components/NearbyRequestCard'
import ConfirmModal from '../../components/ConfirmModal'

import logo from '../../assets/logo.png'
import alertIcon from '../../assets/alert.png'
import alertActiveIcon from '../../assets/alert_acitve.svg'
import profileBtn from '../../assets/top_small_profile_btn.png'
import cryingChar from '../../assets/crying_char.png'
import matchingImage from '../../assets/matching.png'
import upFinger from '../../assets/up_finger.png'
import sideFinger from '../../assets/side_finger.png'
import { apiFetch } from '../../api/client'
import { createChatRoom } from '../../api/chat'
import { hasClosedChatForCard } from '../../utils/cardChatStatus'

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
const NEARBY_GUIDE_SEEN_STORAGE_KEY = 'hasSeenNearbyCardGuide'
const getCardFromResponse = (response: any): any | null => {
  const card = response?.data?.card ?? response?.data ?? response?.card ?? response

  return card?.id ? card : null
}

const getCurrentUserId = (): string | null => {
  const accessToken = localStorage.getItem('accessToken')
  const payload = accessToken?.split('.')[1]

  if (!payload) return null

  try {
    const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/')
    const paddedPayload = normalizedPayload.padEnd(
      normalizedPayload.length + ((4 - (normalizedPayload.length % 4)) % 4),
      '='
    )
    const decodedPayload = JSON.parse(atob(paddedPayload))
    const userId =
      decodedPayload.userId ??
      decodedPayload.memberId ??
      decodedPayload.id ??
      decodedPayload.sub

    return userId == null ? null : String(userId)
  } catch {
    return null
  }
}

const filterOutMyCards = (cards: any[]): any[] => {
  const currentUserId = getCurrentUserId()

  const openCards = cards.filter((card) => card?.status === 'OPEN')

  if (!currentUserId) return openCards

  return openCards.filter(
    (card) => String(card?.requesterId) !== currentUserId
  )
}
const saveStoredMyRequest = (card: any) => {
  const accessToken = localStorage.getItem('accessToken')

  if (!card?.id || !accessToken) return

  localStorage.setItem(
    MY_REQUEST_STORAGE_KEY,
    JSON.stringify({ accessToken, card })
  )
}

const saveStoredMatchedHelp = (card: any) => {
  const accessToken = localStorage.getItem('accessToken')

  if (!card?.id || !accessToken) return

  localStorage.setItem(
    MY_REQUEST_STORAGE_KEY,
    JSON.stringify({ accessToken, card, role: 'helper' })
  )
}

const getStoredMatchedHelp = (): any | null => {
  const accessToken = localStorage.getItem('accessToken')
  const storedRequest = localStorage.getItem(MY_REQUEST_STORAGE_KEY)

  if (!accessToken || !storedRequest) return null

  try {
    const parsedRequest = JSON.parse(storedRequest)

    if (
      parsedRequest?.accessToken !== accessToken ||
      parsedRequest?.role !== 'helper' ||
      !parsedRequest?.card?.id
    ) {
      return null
    }

    return parsedRequest.card
  } catch {
    return null
  }
}

export default function HomePage() {
  const navigate = useNavigate()
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(
    () => localStorage.getItem('hasUnreadNotifications') === 'true'
  )

  const [myRequest, setMyRequest] = useState<any>(null)
  const [nearbyCards, setNearbyCards] = useState<any[]>([])
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showDeleteGuide, setShowDeleteGuide] = useState(false)
  const [nearbyGuideStep, setNearbyGuideStep] = useState<
    'help' | 'swipe' | null
  >(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showHelpModal, setShowHelpModal] = useState(false)
  const [selectedHelpCardId, setSelectedHelpCardId] = useState<string | null>(null)
  const [isApplying, setIsApplying] = useState(false)
  const [homeErrorMessage, setHomeErrorMessage] = useState<string | null>(null)
  const isFetchingRef = useRef(false)
  const fetchGenerationRef = useRef(0)
  const isLoadingMoreRef = useRef(false)
  const positionRef = useRef<GeolocationPosition | null>(null)
  const selectedHelpCardRef = useRef<any | null>(null)
  const deleteGuideDismissedCardIdRef = useRef<string | null>(null)

  useEffect(() => {
    const syncUnreadState = () => {
      setHasUnreadNotifications(
        localStorage.getItem('hasUnreadNotifications') === 'true'
      )
    }

    window.addEventListener('storage', syncUnreadState)
    window.addEventListener('hasUnreadNotificationsChange', syncUnreadState)

    return () => {
      window.removeEventListener('storage', syncUnreadState)
      window.removeEventListener('hasUnreadNotificationsChange', syncUnreadState)
    }
  }, [])

  const getCurrentPosition = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: false,
        timeout: 15000,
        maximumAge: 300000,
      })
    })
  }
  const fetchHomeData = useCallback(async (options?: { force?: boolean }) => {
    if (isFetchingRef.current && !options?.force) return

    isFetchingRef.current = true
    const fetchGeneration = ++fetchGenerationRef.current
    const isLatestFetch = () => fetchGenerationRef.current === fetchGeneration

    try {
      const res = await apiFetch<any>('/api/cards/my/active')
      if (!isLatestFetch()) return

      let card = getCardFromResponse(res)
      const activeCardData = res?.data ?? res
      const hasCreatedCard = activeCardData?.hasCreatedCard

      if (card?.status === 'MATCHED') {
        const chatClosed = await hasClosedChatForCard(card.id)
        if (!isLatestFetch()) return

        if (chatClosed) {
          card = null
          localStorage.removeItem(MY_REQUEST_STORAGE_KEY)
        }
      }

      if (!card || !card.id) {
        const storedMatchedHelp = getStoredMatchedHelp()

        if (storedMatchedHelp) {
          const matchedCardRes = await apiFetch<any>(
            `/api/cards/${storedMatchedHelp.id}`
          )
          if (!isLatestFetch()) return

          const matchedCard = getCardFromResponse(matchedCardRes)

          const matchedChatClosed = matchedCard?.id
            ? await hasClosedChatForCard(matchedCard.id)
            : false
          if (!isLatestFetch()) return

          if (matchedCard?.status === 'MATCHED' && !matchedChatClosed) {
            saveStoredMatchedHelp(matchedCard)
            setMyRequest(matchedCard)
            setNearbyCards([])
            setNextCursor(null)
            setShowDeleteGuide(false)
            setShowDeleteModal(false)
            setShowHelpModal(false)
            setSelectedHelpCardId(null)
            setNearbyGuideStep(null)
            setHomeErrorMessage(null)
            return
          }
        }

        localStorage.removeItem(MY_REQUEST_STORAGE_KEY)
        setMyRequest(null)
        setShowDeleteGuide(false)
        deleteGuideDismissedCardIdRef.current = null

        try {
          const position = await getCurrentPosition()
          if (!isLatestFetch()) return

          positionRef.current = position

          const nearbyRes = await apiFetch<any>(
            `/api/cards/nearby?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}`
          )
          if (!isLatestFetch()) return

          const nearbyData = nearbyRes.data ?? nearbyRes

          const nextNearbyCards = filterOutMyCards(nearbyData?.cards ?? [])

          setNearbyCards(nextNearbyCards)
          setNextCursor(nearbyData?.nextCursor ?? null)
          setCurrentIndex((prev) =>
            nextNearbyCards.length === 0
              ? 0
              : Math.min(prev, nextNearbyCards.length - 1)
          )
          if (
            nextNearbyCards.length > 0 &&
            nearbyData?.hasSeenCardViewOnboarding === false &&
            sessionStorage.getItem(NEARBY_GUIDE_SEEN_STORAGE_KEY) !== 'true'
          ) {
            setNearbyGuideStep((prev) => prev ?? 'help')
          }
          setHomeErrorMessage(null)
        } catch (error) {
          if (!isLatestFetch()) return

          setNearbyCards([])
          setNextCursor(null)
          setHomeErrorMessage(getHomeErrorMessage(error))
        }

        return
      }

      saveStoredMyRequest(card)
      setMyRequest(card)
      setNearbyCards([])
      setNextCursor(null)
      if (card.status === 'MATCHED') {
        setShowDeleteGuide(false)
        setShowDeleteModal(false)
        setShowHelpModal(false)
        setSelectedHelpCardId(null)
        setNearbyGuideStep(null)
      }
      if (
        card.status === 'OPEN' &&
        hasCreatedCard === false &&
        deleteGuideDismissedCardIdRef.current !== card.id
      ) {
        setShowDeleteGuide(true)
      }
      setHomeErrorMessage(null)
    } catch (e) {
      if (!isLatestFetch()) return

      setMyRequest(null)
      setNearbyCards([])
      setNextCursor(null)
      setShowDeleteGuide(false)
      setHomeErrorMessage(
        '\uD648 \uB370\uC774\uD130\uB97C \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4. \uB2E4\uC2DC \uC2DC\uB3C4\uD574\uC8FC\uC138\uC694.'
      )
    } finally {
      if (isLatestFetch()) {
        isFetchingRef.current = false
      }
    }
  }, [])

  useEffect(() => {
    fetchHomeData()
    const intervalId = window.setInterval(fetchHomeData, 10000)

    return () => window.clearInterval(intervalId)
  }, [fetchHomeData])

  useEffect(() => {
    setCurrentIndex((index) =>
      Math.min(index, Math.max(nearbyCards.length - 1, 0))
    )
  }, [nearbyCards.length])

  useEffect(() => {
    if (
      myRequest ||
      !nextCursor ||
      nearbyCards.length === 0 ||
      currentIndex < nearbyCards.length - 2 ||
      isLoadingMoreRef.current
    ) {
      return
    }

    const loadMoreNearbyCards = async () => {
      isLoadingMoreRef.current = true

      try {
        const position = positionRef.current ?? (await getCurrentPosition())
        positionRef.current = position

        const response = await apiFetch<any>(
          `/api/cards/nearby?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}&cursor=${encodeURIComponent(nextCursor)}`
        )
        const data = response?.data ?? response
        const newCards = filterOutMyCards(data?.cards ?? [])

        setNearbyCards((cards) => {
          const existingIds = new Set(cards.map((card) => card.id))
          return [...cards, ...newCards.filter((card) => !existingIds.has(card.id))]
        })
        setNextCursor(data?.nextCursor ?? null)
      } catch {} finally {
        isLoadingMoreRef.current = false
      }
    }

    loadMoreNearbyCards()
  }, [currentIndex, myRequest, nearbyCards.length, nextCursor])

  const handleNearbyGuideClick = () => {
    setNearbyGuideStep((step) => {
      if (step === 'help') {
        return 'swipe'
      }

      sessionStorage.setItem(NEARBY_GUIDE_SEEN_STORAGE_KEY, 'true')
      return null
    })
  }
  const handleDeleteRequest = async () => {
    const cardId = myRequest?.id

    if (!cardId) {
      return
    }

    try {
      await apiFetch(`/api/cards/${cardId}/cancel`, {
        method: 'PATCH',
      })

      setShowDeleteGuide(false)
      setShowDeleteModal(false)
      setMyRequest(null)
      setNearbyCards([])
      setCurrentIndex(0)
      localStorage.removeItem(MY_REQUEST_STORAGE_KEY)

      await fetchHomeData({ force: true })
    } catch (error) {
      const status =
        typeof error === 'object' && error !== null && 'status' in error
          ? (error as { status?: number }).status
          : undefined

      if (status === 404 || status === 409) {
        setShowDeleteModal(false)
        localStorage.removeItem(MY_REQUEST_STORAGE_KEY)
        await fetchHomeData({ force: true })
      }
    }
  }

  const removeNearbyCard = (cardId: string) => {
    setNearbyCards((cards) => cards.filter((card) => card.id !== cardId))
  }

  const handleHelpRequest = async () => {
    const cardId = selectedHelpCardId

    if (!cardId || isApplying) return

    setIsApplying(true)

    try {
      await apiFetch(`/api/cards/${cardId}/applies`, {
        method: 'POST',
      })

      const matchedCard = {
        ...selectedHelpCardRef.current,
        id: cardId,
        status: 'MATCHED',
      }

      saveStoredMatchedHelp(matchedCard)
      setMyRequest(matchedCard)
      setNearbyCards([])
      setNextCursor(null)
      setShowHelpModal(false)
      setSelectedHelpCardId(null)
      selectedHelpCardRef.current = null
      await fetchHomeData({ force: true })

      try {
        const chatRoomRes = await createChatRoom({ cardId })
        navigate(`/chat/${chatRoomRes.data.id}`)
      } catch {}
    } catch (error) {
      const status =
        typeof error === 'object' && error !== null && 'status' in error
          ? (error as { status?: number }).status
          : undefined

      if (status === 403 || status === 404 || status === 409) {
        removeNearbyCard(cardId)
        setShowHelpModal(false)
        setSelectedHelpCardId(null)
        selectedHelpCardRef.current = null
        await fetchHomeData({ force: true })
      }
    } finally {
      setIsApplying(false)
    }
  }
  return (
    <PageTransition>
      <div
        className="relative mx-auto h-[844px] w-[390px] overflow-hidden"
        style={{
          background:
            'linear-gradient(180deg, #FFFFFF 0%, #FFFFFF 65%, #FFF4E8 84%, #FFC679 100%)',
        }}
      >
        <header className="absolute left-0 top-[38px] flex h-12 w-full items-center justify-between px-6">
          <img src={logo} alt="ONDO" className="h-6 w-[97px] object-contain" />

          <div className="flex items-center gap-4">
            <button type="button" onClick={() => navigate('/notifications')}>
              <img
                src={hasUnreadNotifications ? alertActiveIcon : alertIcon}
                alt="알림"
                className="h-6 w-5"
              />
            </button>

            <button type="button" onClick={() => navigate('/mypage')}>
              <img src={profileBtn} alt="프로필" className="h-6 w-6" />
            </button>
          </div>
        </header>

        <main className="absolute left-0 top-[171px] flex w-full flex-col items-center">
          {myRequest?.status === 'MATCHED' ? (
            <div className="mt-[96px] flex flex-col items-center" aria-live="polite">
              <img
                src={matchingImage}
                alt="매칭 완료"
                className="h-[200px] w-auto object-contain"
              />

              <p className="mt-5 text-center text-sm leading-[25px] text-[#343434]">
                매칭완료!
              </p>
            </div>
          ) : myRequest ? (
            <MyRequestCard
              request={myRequest}
              onDelete={() => setShowDeleteModal(true)}
              onRetry={() => fetchHomeData({ force: true })}
              onDragStart={() => {}}
              onDragEnd={() => {}}
            />
          ) : nearbyCards.length > 0 ? (
            <div className="relative h-[508px] w-80">
              {nearbyCards
                .slice(currentIndex, currentIndex + 3)
                .map((request, stackIndex) => (
                  <div
                    key={request.id}
                    className={`absolute inset-0 ${
                      stackIndex === 0 ? '' : 'pointer-events-none'
                    }`}
                    style={{
                      zIndex: 3 - stackIndex,
                      transform: `translateX(${stackIndex * 12}px) scale(${
                        1 - stackIndex * 0.015
                      })`,
                      transformOrigin: 'left center',
                    }}
                    aria-hidden={stackIndex !== 0}
                  >
                    <NearbyRequestCard
                      request={request}
                      onSwipeLeft={
                        stackIndex === 0
                          ? () =>
                              setCurrentIndex((i) =>
                                Math.min(i + 1, nearbyCards.length - 1)
                              )
                          : undefined
                      }
                      onSwipeRight={
                        stackIndex === 0
                          ? () => setCurrentIndex((i) => Math.max(i - 1, 0))
                          : undefined
                      }
                      onHelp={
                        stackIndex === 0
                          ? () => {
                              selectedHelpCardRef.current = request
                              setSelectedHelpCardId(request.id)
                              setShowHelpModal(true)
                            }
                          : undefined
                      }
                    />
                  </div>
                ))}
            </div>
          ) : homeErrorMessage ? (
            <div className="mt-[96px] flex flex-col items-center px-6 text-center">
              <img
                src={cryingChar}
                alt="울고 있는 캐릭터"
                className="h-[200px] w-auto object-contain"
              />

              <p className="mt-5 text-sm leading-[25px] text-[#343434]">
                {homeErrorMessage}
              </p>

              <button
                type="button"
                onClick={() => fetchHomeData()}
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
                className="h-[200px] w-auto object-contain"
              />

              <p className="mt-5 text-sm text-[#666666]">아직 요청이 없어요</p>
            </div>
          )}
        </main>

        <BottomNav disableRequestButton={Boolean(myRequest)} />

        <ConfirmModal
          open={showDeleteModal}
          title="요청을 취소하시겠습니까?"
          confirmText="삭제"
          cancelText="취소"
          mutedConfirm
          onConfirm={handleDeleteRequest}
          onCancel={() => setShowDeleteModal(false)}
        />

        <ConfirmModal
          open={showHelpModal}
          title="도와주시겠습니까?"
          confirmText="도와주기"
          cancelText="취소"
          onConfirm={handleHelpRequest}
          onCancel={() => {
            setShowHelpModal(false)
            setSelectedHelpCardId(null)
            selectedHelpCardRef.current = null
          }}
        />
        {showDeleteGuide && (
          <div
            onClick={() => {
              deleteGuideDismissedCardIdRef.current = myRequest?.id ?? null
              setShowDeleteGuide(false)
            }}
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

        {nearbyGuideStep && (
          <div
            onClick={handleNearbyGuideClick}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/50"
          >
            <div className="flex flex-col items-center">
              <p className="mb-4 text-base font-medium text-white">
                {nearbyGuideStep === 'help'
                  ? '\uC62C\uB824\uC11C \uB3C4\uC640\uC8FC\uAE30'
                  : '\uC606\uC73C\uB85C \uBC00\uC5B4\uC11C \uB2E4\uB978 \uC694\uCCAD \uBCF4\uAE30'}
              </p>

              <img
                src={nearbyGuideStep === 'help' ? upFinger : sideFinger}
                alt={
                  nearbyGuideStep === 'help'
                    ? '\uC62C\uB824\uC11C \uB3C4\uC640\uC8FC\uAE30'
                    : '\uC606\uC73C\uB85C \uBC00\uC5B4\uC11C \uB2E4\uB978 \uC694\uCCAD \uBCF4\uAE30'
                }
                className={`h-12 w-12 ${
                  nearbyGuideStep === 'help' ? 'animate-bounce' : 'animate-pulse'
                }`}
              />
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  )
}
