type Props = {
  open: boolean
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  mutedConfirm?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmModal({
  open,
  title,
  description,
  confirmText = '확인',
  cancelText = '취소',
  mutedConfirm = false,
  onConfirm,
  onCancel,
}: Props) {
  if (!open) return null

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/25">
      <div
        className="flex flex-col items-center justify-center gap-5 rounded-[20px] bg-white/90 px-7 pb-6 pt-8 shadow-[0_0_5.6px_rgba(0,0,0,0.20)]"
      >
        <div className="text-center">
          <p className="text-lg font-semibold leading-7 text-zinc-800">
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
            type="button"
            onClick={onCancel}
            className="flex h-11 w-28 items-center justify-center rounded-full bg-stone-300/60 text-base font-normal leading-6 text-[#666]"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className={`flex h-11 w-28 items-center justify-center rounded-full text-base font-semibold leading-6 text-white ${
              mutedConfirm ? 'bg-amber-500/80' : 'bg-amber-500'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
