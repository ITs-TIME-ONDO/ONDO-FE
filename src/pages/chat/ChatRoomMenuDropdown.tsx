type MenuOption = {
  label: string
  onClick: () => void
}

type Props = {
  open: boolean
  onClose: () => void
  options: MenuOption[]
}

export default function ChatRoomMenuDropdown({
  open,
  onClose,
  options,
}: Props) {
  if (!open) return null

  return (
    <>
      <div className="absolute inset-0 z-40" onClick={onClose} />

      <div
        className="absolute right-6 top-[80px] z-50 flex w-36 flex-col rounded-[5px] border border-white/60 bg-white/90 backdrop-blur-[2px]"
        style={{ boxShadow: '0px 2px 4px rgba(0,0,0,0.25)' }}
      >
        {options.map((option) => (
          <button
            key={option.label}
            type="button"
            onClick={() => {
              option.onClick()
              onClose()
            }}
            className="whitespace-nowrap px-4 py-[10px] text-left text-sm text-black"
          >
            {option.label}
          </button>
        ))}
      </div>
    </>
  )
}
