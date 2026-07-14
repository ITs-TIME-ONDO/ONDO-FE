import { useNavigate } from 'react-router-dom'

import arrow from '../../assets/arrow.png'

export default function LocationPage() {
  const navigate = useNavigate()

  return (
    <div className="relative mx-auto h-[844px] w-[390px] overflow-hidden bg-white font-['Pretendard']">
      <header className="relative h-[99px] w-full">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="뒤로가기"
          className="absolute left-[24px] top-[46px] flex h-8 w-8 items-center justify-center"
        >
          <img src={arrow} alt="" className="h-[18px] w-[10px]" />
        </button>

        <h1 className="absolute left-1/2 top-[50px] -translate-x-1/2 whitespace-nowrap text-xl font-medium leading-6 text-[#111111]">
          실시간 위치 공유
        </h1>
      </header>

      <main className="h-[745px] w-full" aria-label="실시간 위치 지도" />
    </div>
  )
}
