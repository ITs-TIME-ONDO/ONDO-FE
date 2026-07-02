import { useEffect, useState, type ReactNode } from 'react'

const FRAME_WIDTH = 390
const FRAME_HEIGHT = 844

function getViewportSize() {
  const viewport = window.visualViewport
  return {
    width: viewport?.width ?? window.innerWidth,
    height: viewport?.height ?? window.innerHeight,
  }
}

// 390x844(Figma 기준) 디자인을 실제 기기 화면 크기에 맞춰 꽉 차게 스케일링한다.
export default function ScreenScaler({ children }: { children: ReactNode }) {
  const [{ width, height }, setSize] = useState(getViewportSize)

  useEffect(() => {
    const handleResize = () => setSize(getViewportSize())
    window.addEventListener('resize', handleResize)
    window.visualViewport?.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      window.visualViewport?.removeEventListener('resize', handleResize)
    }
  }, [])

  const scale = Math.min(width / FRAME_WIDTH, height / FRAME_HEIGHT)

  return (
    <div className="fixed inset-0 flex items-center justify-center overflow-hidden bg-white">
      <div
        style={{
          width: FRAME_WIDTH,
          height: FRAME_HEIGHT,
          transform: `scale(${scale})`,
          transformOrigin: 'center',
        }}
      >
        {children}
      </div>
    </div>
  )
}
