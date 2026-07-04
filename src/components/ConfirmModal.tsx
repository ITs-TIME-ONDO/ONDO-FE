type Props = {
  open: boolean
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmModal({
  open,
  title,
  description,
  confirmText = '확인',
  cancelText = '취소',
  onConfirm,
  onCancel,
}: Props) {
  if (!open) return null

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40">
      <div
        className="flex flex-col items-center gap-[20px] rounded-[20px] bg-white px-[28px] pb-[24px] pt-[32px]"
        style={{ boxShadow: '0px 0px 2.8px rgba(0,0,0,0.25)' }}
      >
        <div className="text-center">
          <p className="text-[20px] font-semibold leading-[1.7] text-black">
            {title}
          </p>

          {description && (
            <p className="text-[14px] leading-[1.7] text-[#666]">
              {description}
            </p>
          )}
        </div>

        <div className="flex gap-[8px]">
          <button
            type="button"
            onClick={onCancel}
            className="flex h-[44px] w-[108px] items-center justify-center rounded-full bg-[#f3f3f3] text-[16px] font-semibold text-[#666]"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="flex h-[44px] w-[107px] items-center justify-center rounded-full bg-[#ff9e1b] text-[16px] font-semibold text-white"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
