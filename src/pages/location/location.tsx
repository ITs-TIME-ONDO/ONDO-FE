import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import arrow from '../../assets/arrow.png'

declare global {
  interface Window {
    kakao: any
  }
}

const DEFAULT_POSITION = { latitude: 37.5665, longitude: 126.978 }
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
  const navigate = useNavigate()
  const mapRef = useRef<HTMLDivElement>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

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

        if (cancelled || !mapRef.current) return

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
        const map = new window.kakao.maps.Map(mapRef.current, {
          center,
          level: 3,
        })

        new window.kakao.maps.Marker({ position: center, map })

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

  return (
    <div className="relative mx-auto h-[844px] w-[390px] overflow-hidden bg-white font-['Pretendard']">
      <header className="relative h-[99px] w-full">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="뒤로가기"
          className="absolute left-[24px] top-[46px] flex h-8 w-8 items-center justify-center"
        >
          <img src={arrow} alt="" className="h-[18px] w-[10px]" />
        </button>

        <h1 className="absolute left-1/2 top-[50px] -translate-x-1/2 whitespace-nowrap text-xl font-medium leading-6 text-[#111111]">
          실시간 위치 공유
        </h1>
      </header>

      <main className="relative h-[745px] w-full" aria-label="실시간 위치 지도">
        <div ref={mapRef} className="h-full w-full" />

        {errorMessage && (
          <p className="absolute left-1/2 top-4 z-10 w-max max-w-[342px] -translate-x-1/2 rounded-full bg-white/90 px-4 py-2 text-center text-sm text-[#555555] shadow">
            {errorMessage}
          </p>
        )}
      </main>
    </div>
  )
}
