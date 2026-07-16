import { useNavigate } from 'react-router-dom'

import alertIcon from '../../assets/alert.png'
import profileBtn from '../../assets/top_small_profile_btn.png'

export default function ChatHeader() {
  const navigate = useNavigate()

  return (
    <header className="absolute left-0 top-[38px] flex h-12 w-full items-center justify-between px-6">
      <p className="text-[22px] font-semibold text-black">채팅</p>

      <div className="flex items-center gap-3">
        <img src={alertIcon} alt="알림" className="h-6 w-5" />

        <button type="button" onClick={() => navigate('/mypage')}>
          <img src={profileBtn} alt="프로필" className="h-6 w-6" />
        </button>
      </div>
    </header>
  )
}
