// 다음 버튼
type NextButtonProps = {
  disabled?: boolean
  onClick?: () => void
}

export default function NextButton({
  disabled = false,
  onClick,
}: NextButtonProps) {
  return (
    <button
      className={`absolute left-6 top-[720px] flex h-[60px] w-[342px] items-center justify-center rounded-full text-[20px] font-bold text-white transition-colors ${disabled ? 'bg-[#ff9e1b]/50' : 'bg-[#ff9e1b]'}`}
      type="button"
      disabled={disabled}
      onClick={onClick}
    >
      다음
    </button>
  )
}
