import { apiFetch } from './client'
import type { ApiResponse, PageResponse } from './chat'

export type NotificationType =
  | 'NEW_CARD'
  | 'CARD_APPLIED'
  | 'MATCH_ACCEPTED'
  | 'MATCH_REJECTED'
  | 'CHAT_MESSAGE'

export interface NotificationItem {
  id: string
  type: NotificationType
  message: string
  isRead: boolean
  createdAt: string
  referenceId: string
}

export function getNotifications(
  page = 0,
  size = 20
): Promise<ApiResponse<PageResponse<NotificationItem>>> {
  return apiFetch<ApiResponse<PageResponse<NotificationItem>>>(
    `/api/notifications?page=${page}&size=${size}`
  )
}

export function readNotification(notificationId: string): Promise<ApiResponse<{}>> {
  return apiFetch<ApiResponse<{}>>(`/api/notifications/${notificationId}/read`, {
    method: 'PATCH',
  })
}

export function readAllNotifications(): Promise<ApiResponse<{}>> {
  return apiFetch<ApiResponse<{}>>('/api/notifications/read-all', {
    method: 'PATCH',
  })
}
