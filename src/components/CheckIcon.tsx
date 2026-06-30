// 체크 아이콘
type CheckIconProps = {
  checked: boolean
  size?: number
}

export default function CheckIcon({ checked, size = 32 }: CheckIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M11.2 16.5L15 20.1L22.5 13"
        stroke={checked ? '#ff9e1b' : '#929292'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
