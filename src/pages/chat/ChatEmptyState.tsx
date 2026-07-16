import chatEmptyChar from '../../assets/chat_empty_char.png'

export default function ChatEmptyState() {
  return (
    <main className="absolute left-0 top-[171px] flex w-full flex-col items-center">
      <div className="mt-[96px] flex flex-col items-center">
        <img
          src={chatEmptyChar}
          alt="채팅 없음"
          className="h-[200px] w-auto object-contain"
        />

        <p className="mt-5 text-sm leading-[25px] text-[#343434]">
          채팅을 시작해보세요!
        </p>
      </div>
    </main>
  )
}
