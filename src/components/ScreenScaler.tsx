import { useEffect, useRef, useState, type ReactNode } from 'react'

const FRAME_WIDTH = 390
const FRAME_HEIGHT = 844

export default function ScreenScaler({ children }: { children: ReactNode }) {
  const getViewportSize = () => {
    const viewport = window.visualViewport
    return {
      width: viewport?.width ?? window.innerWidth,
      height: viewport?.height ?? window.innerHeight,
    }
  }

  const [{ width, height }, setSize] = useState(getViewportSize)
  const sizeRef = useRef({ width, height })

  useEffect(() => {
    const handleResize = () => {
      const nextSize = getViewportSize()
      const previousSize = sizeRef.current
      const widthChanged = Math.abs(nextSize.width - previousSize.width) > 1
      const keyboardLikelyOpen =
        !widthChanged &&
        previousSize.height - nextSize.height > 120 &&
        document.activeElement instanceof HTMLElement &&
        (document.activeElement.matches('input, textarea, select') ||
          document.activeElement.isContentEditable)

      if (keyboardLikelyOpen) return

      sizeRef.current = nextSize
      setSize(nextSize)
    }

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
