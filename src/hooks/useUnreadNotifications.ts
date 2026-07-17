import { useEffect, useState } from 'react'

import { getNotifications } from '../api/notifications'

const STORAGE_KEY = 'hasUnreadNotifications'
const CHANGE_EVENT = 'hasUnreadNotificationsChange'
const POLL_INTERVAL_MS = 5000

const getUnreadState = () => localStorage.getItem(STORAGE_KEY) === 'true'

export default function useUnreadNotifications() {
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(
    () => getUnreadState()
  )

  useEffect(() => {
    let cancelled = false

    const syncUnreadState = () => {
      if (cancelled) return
      setHasUnreadNotifications(getUnreadState())
    }

    const refreshUnreadState = async () => {
      try {
        const response = await getNotifications(0, 50)
        const hasUnread = (response?.data?.content ?? []).some(
          (notification) => !notification.isRead
        )

        if (cancelled) return

        localStorage.setItem(STORAGE_KEY, String(hasUnread))
        window.dispatchEvent(new Event(CHANGE_EVENT))
      } catch {
        // keep the last known state when the network or auth is temporarily unavailable
      }
    }

    window.addEventListener('storage', syncUnreadState)
    window.addEventListener(CHANGE_EVENT, syncUnreadState)
    window.addEventListener('focus', refreshUnreadState)
    document.addEventListener('visibilitychange', refreshUnreadState)

    void refreshUnreadState()
    const intervalId = window.setInterval(refreshUnreadState, POLL_INTERVAL_MS)

    return () => {
      cancelled = true
      window.clearInterval(intervalId)
      window.removeEventListener('storage', syncUnreadState)
      window.removeEventListener(CHANGE_EVENT, syncUnreadState)
      window.removeEventListener('focus', refreshUnreadState)
      document.removeEventListener('visibilitychange', refreshUnreadState)
    }
  }, [])

  return hasUnreadNotifications
}
