import { useEffect, type ReactNode } from 'react'

const FRAME_WIDTH = 390
const FRAME_HEIGHT = 844

export default function ScreenScaler({ children }: { children: ReactNode }) {
  useEffect(() => {
    const isMapTarget = (target: EventTarget | null) =>
      target instanceof Element && Boolean(target.closest('[data-map-gesture]'))

    const preventBrowserZoom = (event: WheelEvent) => {
      if (event.ctrlKey && !isMapTarget(event.target)) event.preventDefault()
    }

    const preventZoomShortcut = (event: KeyboardEvent) => {
      if (
        (event.ctrlKey || event.metaKey) &&
        ['+', '-', '=', '0'].includes(event.key) &&
        !isMapTarget(event.target)
      ) {
        event.preventDefault()
      }
    }

    const preventPinchZoom = (event: Event) => {
      if (!isMapTarget(event.target)) event.preventDefault()
    }

    window.addEventListener('wheel', preventBrowserZoom, { passive: false })
    window.addEventListener('keydown', preventZoomShortcut)
    document.addEventListener('gesturestart', preventPinchZoom, {
      passive: false,
    })

    return () => {
      window.removeEventListener('wheel', preventBrowserZoom)
      window.removeEventListener('keydown', preventZoomShortcut)
      document.removeEventListener('gesturestart', preventPinchZoom)
    }
  }, [])

  return (
    <div
      className="fixed inset-0 flex items-start justify-center overflow-hidden"
      style={{
        background:
          'linear-gradient(180deg, #FFFFFF 0%, #FFFFFF 65%, #FFF4E8 84%, #FFC679 100%)',
        backgroundColor: '#FFC679',
        backgroundRepeat: 'no-repeat',
        backgroundSize: `100% ${FRAME_HEIGHT}px`,
      }}
    >
      <div
        className="relative shrink-0 overflow-hidden"
        style={{
          width: FRAME_WIDTH,
          height: FRAME_HEIGHT,
        }}
      >
        {children}
      </div>
    </div>
  )
}
