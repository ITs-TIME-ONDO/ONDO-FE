import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import PageHeader from '../../components/PageHeader'
import { getLiveLocations, type LiveLocationEvent } from '../../api/chat'
import { useChatSocketStore } from '../../stores/chatSocketStore'
import { getAccessToken } from '../../utils/authStorage'
import { getUserIdFromToken } from '../../utils/jwt'
import myMapPin from '../../assets/map_ping_me.png'
import opponentMapPin from '../../assets/map_ping_opponent.png'

declare global {
  interface Window {
    kakao: any
  }
}

const DEFAULT_POSITION = { latitude: 37.5665, longitude: 126.978 }
const EMPTY_LIVE_LOCATIONS: Record<string, LiveLocationEvent> = {}
const LOCAL_ME_ID = '__local_me__'
let currentPositionRequest: Promise<GeolocationPosition> | null = null

const loadKakaoMapSdk = (appKey: string): Promise<void> =>
  new Promise((resolve, reject) => {
    const initialize = () => window.kakao.maps.load(resolve)

    if (window.kakao?.maps) {
      initialize()
      return
    }

    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[data-kakao-map-sdk]'
    )

    if (existingScript) {
      existingScript.addEventListener('load', initialize, { once: true })
      existingScript.addEventListener(
        'error',
        () => {
          existingScript.remove()
          reject(new Error('Kakao Maps SDK load failed'))
        },
        { once: true }
      )
      return
    }

    const script = document.createElement('script')
    script.dataset.kakaoMapSdk = 'true'
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&autoload=false`
    script.onload = initialize
    script.onerror = () => {
      script.remove()
      reject(new Error('Kakao Maps SDK load failed'))
    }
    document.head.appendChild(script)
  })

const getCurrentPosition = (): Promise<GeolocationPosition> => {
  if (!currentPositionRequest) {
    currentPositionRequest = new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      })
    })

    const clearRequest = () => {
      window.setTimeout(() => {
        currentPositionRequest = null
      }, 1000)
    }

    currentPositionRequest.then(clearRequest, clearRequest)
  }

  return currentPositionRequest
}

export default function LocationPage() {
  const { search } = useLocation()
  const roomId = new URLSearchParams(search).get('roomId')
  const mapElementRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const markerRefs = useRef<Map<string, any>>(new Map())
  const latestPositionRef = useRef<{
    latitude: number
    longitude: number
    accuracy: number
  } | null>(null)
  const lastPublishedAtRef = useRef(0)
  const hasFitBothLocationsRef = useRef(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [mapReady, setMapReady] = useState(false)

  const accessToken = getAccessToken()
  const myUserId = accessToken ? getUserIdFromToken(accessToken) : null
  const connect = useChatSocketStore((state) => state.connect)
  const socketClient = useChatSocketStore((state) => state.client)
  const connected = useChatSocketStore((state) => state.connected)
  const setLiveLocation = useChatSocketStore((state) => state.setLiveLocation)
  const sendLiveLocation = useChatSocketStore((state) => state.sendLiveLocation)
  const stopLiveLocation = useChatSocketStore((state) => state.stopLiveLocation)
  const liveLocations = useChatSocketStore((state) =>
    roomId
      ? (state.liveLocationByRoom[roomId] ?? EMPTY_LIVE_LOCATIONS)
      : EMPTY_LIVE_LOCATIONS
  )

  useEffect(() => {
    if (!roomId) return

    connect()
    getLiveLocations(roomId)
      .then((response) => {
        response.data.forEach((event) => setLiveLocation(roomId, event))
      })
      .catch(() => {})

    const watchId = navigator.geolocation?.watchPosition(
      (position) => {
        const body = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        }

        latestPositionRef.current = body
        const now = Date.now()
        if (now - lastPublishedAtRef.current >= 1000) {
          sendLiveLocation(roomId, body)
          lastPublishedAtRef.current = now
        }
        setLiveLocation(roomId, {
          type: 'UPDATE',
          senderId: LOCAL_ME_ID,
          ...body,
          distanceToTargetMeters: null,
          sentAt: new Date().toISOString(),
        })
      },
      () => setErrorMessage('현재 위치를 불러오지 못했습니다.'),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 }
    )

    return () => {
      if (watchId !== undefined) navigator.geolocation.clearWatch(watchId)
      stopLiveLocation(roomId)
    }
  }, [
    connect,
    myUserId,
    roomId,
    sendLiveLocation,
    setLiveLocation,
    stopLiveLocation,
  ])

  useEffect(() => {
    if (!connected || !socketClient || !roomId) return

    const subscription = socketClient.subscribe(
      `/sub/chat/rooms/${roomId}/live-location`,
      (frame) => {
        setLiveLocation(roomId, JSON.parse(frame.body) as LiveLocationEvent)
      }
    )

    return () => subscription.unsubscribe()
  }, [connected, roomId, setLiveLocation, socketClient])

  useEffect(() => {
    if (!connected || !roomId || !latestPositionRef.current) return
    sendLiveLocation(roomId, latestPositionRef.current)
    lastPublishedAtRef.current = Date.now()
  }, [connected, roomId, sendLiveLocation])

  useEffect(() => {
    const appKey = import.meta.env.VITE_KAKAO_MAP_KEY
    let cancelled = false

    const initializeMap = async () => {
      if (!appKey) {
        setErrorMessage('카카오 지도 키가 필요합니다.')
        return
      }

      try {
        const position = await getCurrentPosition().catch(() => null)
        await loadKakaoMapSdk(appKey)

        if (cancelled || !mapElementRef.current) return

        const coordinates = position
          ? {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            }
          : DEFAULT_POSITION

        const center = new window.kakao.maps.LatLng(
          coordinates.latitude,
          coordinates.longitude
        )
        const map = new window.kakao.maps.Map(mapElementRef.current, {
          center,
          level: 3,
        })
        mapRef.current = map
        setMapReady(true)

        if (!position) {
          setErrorMessage('현재 위치를 불러오지 못해 기본 위치를 표시했습니다.')
        }
      } catch {
        if (!cancelled) {
          setErrorMessage('지도를 불러오지 못했습니다.')
        }
      }
    }

    initializeMap()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!mapReady || !map || !window.kakao?.maps) return

    const entries = Object.entries(liveLocations).filter(
      ([senderId, event]) =>
        event.type === 'UPDATE' &&
        event.latitude !== null &&
        event.longitude !== null &&
        (senderId === LOCAL_ME_ID || senderId !== myUserId)
    )
    const activeIds = new Set(entries.map(([senderId]) => senderId))
    const locationsOverlap = entries.some(([, location], index) =>
      entries
        .slice(index + 1)
        .some(
          ([, otherLocation]) =>
            Math.abs(location.latitude! - otherLocation.latitude!) < 0.00005 &&
            Math.abs(location.longitude! - otherLocation.longitude!) < 0.00005
        )
    )

    markerRefs.current.forEach((marker, senderId) => {
      if (!activeIds.has(senderId)) {
        marker.setMap(null)
        markerRefs.current.delete(senderId)
      }
    })

    entries.forEach(([senderId, event]) => {
      const position = new window.kakao.maps.LatLng(
        event.latitude,
        event.longitude
      )
      const existingMarker = markerRefs.current.get(senderId)
      const isMine = senderId === LOCAL_ME_ID || senderId === myUserId
      const markerOffsetX = locationsOverlap ? (isMine ? 42 : 14) : 28
      const markerImage = new window.kakao.maps.MarkerImage(
        isMine ? myMapPin : opponentMapPin,
        new window.kakao.maps.Size(57, 66),
        { offset: new window.kakao.maps.Point(markerOffsetX, 66) }
      )

      if (existingMarker) {
        existingMarker.setPosition(position)
        existingMarker.setImage(markerImage)
        return
      }

      markerRefs.current.set(
        senderId,
        new window.kakao.maps.Marker({
          map,
          position,
          image: markerImage,
          title: isMine ? '내 위치' : '상대 위치',
        })
      )
    })

    if (entries.length >= 2 && !hasFitBothLocationsRef.current) {
      const bounds = new window.kakao.maps.LatLngBounds()
      entries.forEach(([, event]) => {
        bounds.extend(
          new window.kakao.maps.LatLng(event.latitude, event.longitude)
        )
      })
      map.setBounds(bounds, 60, 60, 60, 60)
      hasFitBothLocationsRef.current = true
    } else if (entries.length === 1 && !hasFitBothLocationsRef.current) {
      const event = entries[0][1]
      map.setCenter(
        new window.kakao.maps.LatLng(event.latitude, event.longitude)
      )
    }
  }, [liveLocations, mapReady, myUserId])

  const focusMyLocation = async () => {
    const map = mapRef.current
    if (!map || !window.kakao?.maps) return

    let coordinates = latestPositionRef.current
    if (!coordinates) {
      const position = await getCurrentPosition().catch(() => null)
      if (!position) {
        setErrorMessage('현재 위치를 불러오지 못했습니다.')
        return
      }
      coordinates = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
      }
    }

    const myPosition = new window.kakao.maps.LatLng(
      coordinates.latitude,
      coordinates.longitude
    )
    map.setLevel(2, { animate: true })
    map.panTo(myPosition)
  }

  return (
    <div className="relative mx-auto h-[844px] w-[390px] overflow-hidden bg-white font-['Pretendard']">
      <PageHeader title="실시간 위치 공유" fallbackPath="/chat" />

      <main
        className="absolute inset-x-0 bottom-0 top-[99px]"
        aria-label="실시간 위치 지도"
      >
        <div ref={mapElementRef} className="h-full w-full" />

        <div className="absolute left-4 top-4 z-10 flex items-center gap-4 rounded-full bg-white/90 px-4 py-2 text-xs text-[#555555] shadow">
          <span className="flex items-center gap-1.5">
            <img src={myMapPin} alt="" className="h-7 w-auto" />내 위치
          </span>
          <span className="flex items-center gap-1.5">
            <img src={opponentMapPin} alt="" className="h-7 w-auto" />
            상대 위치
          </span>
        </div>

        <button
          type="button"
          onClick={() => void focusMyLocation()}
          aria-label="내 위치로 이동"
          className="absolute bottom-6 right-4 z-10 flex size-12 items-center justify-center rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.22)] active:scale-95"
        >
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="size-7 text-black"
            fill="none"
          >
            <circle
              cx="12"
              cy="12"
              r="6.5"
              stroke="currentColor"
              strokeWidth="2"
            />
            <circle cx="12" cy="12" r="2.5" fill="currentColor" />
            <path
              d="M12 2.5V5M12 19V21.5M2.5 12H5M19 12H21.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>

        {errorMessage && (
          <p className="absolute left-1/2 top-16 z-10 w-max max-w-[342px] -translate-x-1/2 rounded-full bg-white/90 px-4 py-2 text-center text-sm text-[#555555] shadow">
            아 {errorMessage}
          </p>
        )}
      </main>
    </div>
  )
}
