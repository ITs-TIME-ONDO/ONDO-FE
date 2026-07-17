import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import PageTransition from '../../components/PageTransition'
import PageHeader from '../../components/PageHeader'
import NotificationListItem from '../../components/NotificationListItem'
import { formatElapsedTime } from '../../utils/formatElapsedTime'
import {
  getNotifications,
  readAllNotifications,
  readNotification,
  type NotificationItem as NotificationModel,
  type NotificationType,
} from '../../api/notifications'

const routeMap: Record<NotificationType, string> = {
  NEW_CARD: '/',
  CARD_APPLIED: '/chat',
  MATCH_ACCEPTED: '/chat',
  MATCH_REJECTED: '/',
  CHAT_MESSAGE: '/chat',
}

export default function NotificationPage() {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState<NotificationModel[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const hasUnreadNotifications = notifications.some(
    (notification) => !notification.isRead
  )
  const visibleNotifications = notifications.filter(
    (notification) => !notification.isRead
  )

  const syncUnreadState = (nextNotifications: NotificationModel[]) => {
    const nextHasUnreadNotifications = nextNotifications.some(
      (notification) => !notification.isRead
    )

    localStorage.setItem(
      'hasUnreadNotifications',
      String(nextHasUnreadNotifications)
    )
    window.dispatchEvent(new Event('hasUnreadNotificationsChange'))
  }

  useEffect(() => {
    let cancelled = false

    const loadNotifications = async () => {
      setIsLoading(true)

      try {
        const response = await getNotifications(0, 50)
        const content = response?.data?.content ?? []

        if (!cancelled) {
          setNotifications(content)
        }
      } catch {
        if (!cancelled) {
          setNotifications([])
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void loadNotifications()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    syncUnreadState(notifications)
  }, [notifications])

  const handleItemClick = async (notification: NotificationModel) => {
    const nextNotifications = notifications.map((item) =>
      item.id === notification.id ? { ...item, isRead: true } : item
    )

    syncUnreadState(nextNotifications)
    setNotifications(nextNotifications)

    void readNotification(notification.id).catch(() => {})
    navigate(routeMap[notification.type])
  }

  const handleReadAll = async () => {
    if (!hasUnreadNotifications) return

    const nextNotifications = notifications.map((notification) => ({
      ...notification,
      isRead: true,
    }))

    syncUnreadState(nextNotifications)
    setNotifications(nextNotifications)

    void readAllNotifications().catch(() => {})
  }

  return (
    <PageTransition>
      <div className="relative mx-auto h-[844px] w-[390px] overflow-hidden bg-white">
        <PageHeader title="알림" fallbackPath="/" />

        <main className="absolute inset-x-0 top-[104px] bottom-[140px] overflow-y-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="relative min-h-full">
            {isLoading ? (
              <div className="flex min-h-[240px] items-center justify-center text-sm text-[#929292]">
                알림을 불러오는 중
              </div>
            ) : visibleNotifications.length > 0 ? (
              visibleNotifications.map((notification) => (
                <NotificationListItem
                  key={notification.id}
                  type={notification.type}
                  message={notification.message}
                  time={formatElapsedTime(notification.createdAt)}
                  unread={!notification.isRead}
                  onClick={() => void handleItemClick(notification)}
                />
              ))
            ) : (
              <div className="flex min-h-[240px] items-center justify-center text-sm text-[#929292]">
                알림이 없습니다
              </div>
            )}

            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-[linear-gradient(to_bottom,rgba(255,255,255,0)_0%,rgba(255,255,255,0.42)_38%,rgba(255,255,255,0.82)_72%,rgba(255,255,255,1)_100%)]" />
          </div>
        </main>

        <div className="absolute bottom-14 left-6">
          <button
            type="button"
            onClick={() => void handleReadAll()}
            disabled={!hasUnreadNotifications}
            className={`flex h-[60px] w-[342px] items-center justify-center rounded-full text-xl font-bold text-white transition-colors ${
              hasUnreadNotifications ? 'bg-[#ff9e1b]' : 'bg-[#ff9e1b]/50'
            }`}
          >
            모두 읽음
          </button>
        </div>
      </div>
    </PageTransition>
  )
}
