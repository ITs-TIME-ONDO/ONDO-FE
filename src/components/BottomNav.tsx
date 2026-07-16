import { useLocation, useNavigate } from 'react-router-dom'

import homeBtn from '../assets/home_btn.png'
import homeBtnNonactive from '../assets/home_btn_nonactive.png'
import helpBtn from '../assets/help_btn.png'
import chatBtn from '../assets/chat_btn.png'
import chatBtnNonactive from '../assets/chat_btn_nonactive.png'

type Props = {
  disableRequestButton?: boolean
}

const hasStoredActiveRequest = () => {
  try {
    const accessToken = localStorage.getItem('accessToken')
    const storedRequest = localStorage.getItem('myRequest')

    if (!accessToken || !storedRequest) return false

    const parsedRequest = JSON.parse(storedRequest)
    const status = parsedRequest?.card?.status

    return (
      parsedRequest?.accessToken === accessToken &&
      (status === 'OPEN' || status === 'MATCHED')
    )
  } catch {
    return false
  }
}

export default function BottomNav({ disableRequestButton = false }: Props) {
  const location = useLocation()
  const navigate = useNavigate()
  const isRequestButtonDisabled =
    disableRequestButton || hasStoredActiveRequest()

  const isHome = location.pathname === '/' || location.pathname === '/home'
  const isChat = location.pathname === '/chat'

  return (
    <nav className="absolute bottom-1 left-1/2 h-[112px] w-[320px] -translate-x-1/2">
      <svg
        viewBox="0 0 320 112"
        className="absolute left-0 top-[18px] h-[86px] w-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="
            M 48 8
            H 108
            C 126 8 132 22 136 38
            C 142 48 151 58 160 58
            C 169 58 178 48 184 38
            C 188 22 194 8 212 8
            H 272
            C 298 8 316 26 316 50
            C 316 74 298 94 272 94
            H 48
            C 22 94 4 74 4 50
            C 4 26 22 8 48 8
            Z
          "
          className="fill-white/50 stroke-white/80"
          strokeWidth="1.2"
        />
      </svg>

      <button
        type="button"
        onClick={() => navigate('/home')}
        className="absolute left-[68px] top-[40px] z-10"
      >
        <img
          src={isHome ? homeBtn : homeBtnNonactive}
          alt="홈"
          className="h-8 w-8"
        />
      </button>

      <button
        type="button"
        disabled={isRequestButtonDisabled}
        onClick={() => navigate('/request')}
        className={
          'absolute left-1/2 top-0 z-20 h-[70px] w-[70px] -translate-x-1/2 rounded-full shadow-[0_8px_16px_rgba(255,158,27,0.35)] ' +
          (isRequestButtonDisabled
            ? 'cursor-not-allowed opacity-45 grayscale'
            : '')
        }
        aria-disabled={isRequestButtonDisabled}
      >
        <img
          src={helpBtn}
          alt="도움 요청"
          className="h-full w-full object-contain"
        />
      </button>

      <button
        type="button"
        onClick={() => navigate('/chat')}
        className="absolute right-[68px] top-[40px] z-10"
      >
        <img
          src={isChat ? chatBtn : chatBtnNonactive}
          alt="채팅"
          className="h-8 w-8"
        />
      </button>
    </nav>
  )
}
