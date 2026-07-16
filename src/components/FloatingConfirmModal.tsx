import { useEffect, useRef } from 'react'

type Props = {
  open: boolean
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
}

export default function FloatingConfirmModal({
  open,
  title,
  description,
  confirmText = '확인',
  cancelText = '취소',
  onConfirm,
  onCancel,
}: Props) {
  const cancelButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return

    cancelButtonRef.current?.focus()

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onCancel])

  if (!open) return null

  return (
    <>
      <div
        className="absolute inset-0 z-40 bg-white/20 backdrop-blur-[3px]"
        onClick={onCancel}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="floating-confirm-modal-title"
        className="absolute left-1/2 top-1/2 z-50 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-5 rounded-[20px] bg-white/90 px-7 pb-6 pt-8"
        style={{ boxShadow: '0px 0px 5.6px rgba(0,0,0,0.2)' }}
      >
        <div className="text-center">
          <p
            id="floating-confirm-modal-title"
            className="text-[18px] font-semibold leading-[1.7] text-black"
          >
            {title}
          </p>

          {description && (
            <p className="text-[14px] leading-[1.7] text-[#666]">
              {description}
            </p>
          )}
        </div>

        <div className="flex gap-2">
          <button
            ref={cancelButtonRef}
            type="button"
            onClick={onCancel}
            className="flex h-11 w-[108px] items-center justify-center rounded-full bg-[#C6C6C6]/60 text-base text-[#343434]"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="flex h-11 w-[107px] items-center justify-center rounded-full bg-[#FF9E1B] text-base font-semibold text-white"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </>
  )
}
