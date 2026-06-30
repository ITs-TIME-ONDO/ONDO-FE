interface NicknameInputProps {
  value: string
  onChange: (value: string) => void
  className?: string
}

export default function NicknameInput({ value, onChange, className = 'top-[523px]' }: NicknameInputProps) {
  return (
    <div className={`absolute left-6 w-[342px] ${className}`}>
      <p className="ml-5 mb-[7px] text-[16px] font-medium text-black">
        닉네임
      </p>
      <div
        className={`flex h-[50px] items-center rounded-full bg-[#f3f3f3] px-5 border ${value.trim() ? 'border-[#ff9e1b]' : 'border-transparent'}`}
      >
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="닉네임을 입력해주세요"
          className="w-full bg-transparent text-[16px] text-black placeholder:text-[#929292] outline-none"
        />
      </div>
    </div>
  )
}
