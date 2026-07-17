import { useEffect, useState } from 'react'

const STORAGE_KEY = 'hasUnreadNotifications'
const CHANGE_EVENT = 'hasUnreadNotificationsChange'

const getUnreadState = () => localStorage.getItem(STORAGE_KEY) === 'true'

export default function useUnreadNotifications() {
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(
    () => getUnreadState()
  )

  useEffect(() => {
    const syncUnreadState = () => {
      setHasUnreadNotifications(getUnreadState())
    }

    window.addEventListener('storage', syncUnreadState)
    window.addEventListener(CHANGE_EVENT, syncUnreadState)

    return () => {
      window.removeEventListener('storage', syncUnreadState)
      window.removeEventListener(CHANGE_EVENT, syncUnreadState)
    }
  }, [])

  return hasUnreadNotifications
}
