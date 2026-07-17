import { useRef } from 'react'
import type { PointerEvent } from 'react'

const LONG_PRESS_DURATION_MS = 500

export function useLongPress(onLongPress: () => void) {
  const timerRef = useRef<number | null>(null)

  const clear = () => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  return {
    onPointerDown: (e: PointerEvent) => {
      if (e.pointerType === 'mouse') return
      clear()
      timerRef.current = window.setTimeout(onLongPress, LONG_PRESS_DURATION_MS)
    },
    onPointerUp: clear,
    onPointerLeave: clear,
    onPointerCancel: clear,
    onContextMenu: (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
    },
  }
}
