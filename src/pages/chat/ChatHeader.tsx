import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import alertIcon from '../../assets/alert.png'
import alertActiveIcon from '../../assets/alert_acitve.svg'
import profileBtn from '../../assets/top_small_profile_btn.png'

export default function ChatHeader() {
  const navigate = useNavigate()
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(
    () => localStorage.getItem('hasUnreadNotifications') === 'true'
  )

  useEffect(() => {
    const syncUnreadState = () => {
      setHasUnreadNotifications(
        localStorage.getItem('hasUnreadNotifications') === 'true'
      )
    }

    window.addEventListener('storage', syncUnreadState)
    window.addEventListener('hasUnreadNotificationsChange', syncUnreadState)

    return () => {
      window.removeEventListener('storage', syncUnreadState)
      window.removeEventListener('hasUnreadNotificationsChange', syncUnreadState)
    }
  }, [])

  return (
    <header className="absolute left-0 top-[38px] flex h-12 w-full items-center justify-between px-6">
      <p className="text-[22px] font-semibold text-black">채팅</p>

      <div className="flex items-center gap-4">
        <button type="button" onClick={() => navigate('/notifications')}>
          <img
            src={hasUnreadNotifications ? alertActiveIcon : alertIcon}
            alt="알림"
            className="h-6 w-5"
          />
        </button>

        <button type="button" onClick={() => navigate('/mypage')}>
          <img src={profileBtn} alt="마이페이지" className="h-6 w-6" />
        </button>
      </div>
    </header>
  )
}
